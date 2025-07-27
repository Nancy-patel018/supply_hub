const express = require('express');
const Product = require('../models/Product');
const SupplierProduct = require('../models/SupplierProduct');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { generateAIInsights } = require('../utils/ai');

const router = express.Router();

// @desc    Get all products with suppliers (Vendor view)
// @route   GET /api/products
// @access  Private (Vendor)
router.get('/', protect, authorize('vendor'), async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = 'price',
      minPrice,
      maxPrice,
      maxDistance = 50,
      page = 1,
      limit = 20
    } = req.query;

    // Get vendor location for distance calculation
    const vendor = await User.findById(req.user.id);
    const vendorLocation = vendor.profile?.address?.coordinates;

    // Build match conditions
    let matchConditions = { isActive: true };
    
    if (category && category !== 'all') {
      matchConditions.category = category;
    }

    if (search) {
      matchConditions.$text = { $search: search };
    }

    // Aggregation pipeline to get products with suppliers
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'supplierproducts',
          localField: '_id',
          foreignField: 'product',
          as: 'suppliers'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'suppliers.supplier',
          foreignField: '_id',
          as: 'supplierDetails'
        }
      },
      {
        $addFields: {
          suppliers: {
            $map: {
              input: '$suppliers',
              as: 'sup',
              in: {
                $mergeObjects: [
                  '$$sup',
                  {
                    supplierInfo: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$supplierDetails',
                            cond: { $eq: ['$$this._id', '$$sup.supplier'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          suppliers: {
            $filter: {
              input: '$suppliers',
              cond: { $eq: ['$$this.isAvailable', true] }
            }
          }
        }
      },
      {
        $match: {
          'suppliers.0': { $exists: true } // Only products with available suppliers
        }
      }
    ];

    // Add distance filter if vendor location is available
    if (vendorLocation) {
      pipeline.push({
        $addFields: {
          suppliers: {
            $filter: {
              input: '$suppliers',
              cond: {
                $lte: [
                  {
                    $divide: [
                      {
                        $sqrt: {
                          $add: [
                            {
                              $pow: [
                                { $subtract: ['$$this.supplierInfo.profile.address.coordinates.lng', vendorLocation.lng] },
                                2
                              ]
                            },
                            {
                              $pow: [
                                { $subtract: ['$$this.supplierInfo.profile.address.coordinates.lat', vendorLocation.lat] },
                                2
                              ]
                            }
                          ]
                        }
                      },
                      111 // Rough conversion to km
                    ]
                  },
                  parseInt(maxDistance)
                ]
              }
            }
          }
        }
      });
    }

    // Add price filters
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      
      pipeline.push({
        $addFields: {
          suppliers: {
            $filter: {
              input: '$suppliers',
              cond: {
                $and: Object.entries(priceFilter).map(([op, val]) => ({
                  [op]: ['$$this.price', val]
                }))
              }
            }
          }
        }
      });
    }

    // Sort suppliers within each product
    let sortStage = {};
    switch (sortBy) {
      case 'price':
        sortStage = { 'suppliers.price': 1 };
        break;
      case 'distance':
        sortStage = { 'suppliers.supplierInfo.profile.address.coordinates': 1 };
        break;
      case 'rating':
        sortStage = { 'suppliers.supplierInfo.stats.rating': -1 };
        break;
      default:
        sortStage = { 'suppliers.price': 1 };
    }

    pipeline.push(
      {
        $addFields: {
          suppliers: {
            $sortArray: {
              input: '$suppliers',
              sortBy: sortStage
            }
          }
        }
      },
      {
        $addFields: {
          lowestPrice: { $min: '$suppliers.price' },
          supplierCount: { $size: '$suppliers' }
        }
      },
      { $sort: { lowestPrice: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const products = await Product.aggregate(pipeline);

    // Generate AI insights for each product
    const productsWithInsights = await Promise.all(
      products.map(async (product) => {
        const insights = await generateAIInsights(product, vendorLocation);
        return {
          ...product,
          aiInsights: insights
        };
      })
    );

    // Get total count for pagination
    const totalPipeline = pipeline.slice(0, -3); // Remove sort, skip, limit
    totalPipeline.push({ $count: 'total' });
    const countResult = await Product.aggregate(totalPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: productsWithInsights
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @desc    Get product details with all suppliers
// @route   GET /api/products/:id
// @access  Private (Vendor)
router.get('/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get all suppliers for this product
    const suppliers = await SupplierProduct.find({
      product: req.params.id,
      isAvailable: true,
      isActive: true
    }).populate('supplier', 'name profile stats');

    // Calculate distance if vendor location is available
    const vendor = await User.findById(req.user.id);
    const vendorLocation = vendor.profile?.address?.coordinates;

    const suppliersWithDistance = suppliers.map(sup => {
      let distance = null;
      if (vendorLocation && sup.supplier.profile?.address?.coordinates) {
        const lat1 = vendorLocation.lat;
        const lon1 = vendorLocation.lng;
        const lat2 = sup.supplier.profile.address.coordinates.lat;
        const lon2 = sup.supplier.profile.address.coordinates.lng;
        
        distance = calculateDistance(lat1, lon1, lat2, lon2);
      }

      return {
        ...sup.toObject(),
        distance,
        priceChangePercentage: sup.priceChangePercentage
      };
    });

    // Sort by price
    suppliersWithDistance.sort((a, b) => a.price - b.price);

    // Generate AI insights
    const insights = await generateAIInsights(product, vendorLocation, suppliersWithDistance);

    res.status(200).json({
      success: true,
      data: {
        product,
        suppliers: suppliersWithDistance,
        aiInsights: insights
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details'
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    const categoryData = categories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      emoji: getCategoryEmoji(category)
    }));

    res.status(200).json({
      success: true,
      data: categoryData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Search products with autocomplete
// @route   GET /api/products/search/suggestions
// @access  Private
router.get('/search/suggestions', protect, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const suggestions = await Product.find(
      {
        $text: { $search: q },
        isActive: true
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .select('name category');

    res.status(200).json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching search suggestions'
    });
  }
});

// @desc    Get group order opportunities
// @route   GET /api/products/group-orders
// @access  Private (Vendor)
router.get('/group-orders/available', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await User.findById(req.user.id);
    const vendorLocation = vendor.profile?.address?.coordinates;

    if (!vendorLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please update your location to see group orders'
      });
    }

    // Find active group orders nearby (mock data for now)
    const groupOrders = [
      {
        id: 'GRP001',
        product: { name: 'Fresh Onions', id: '1' },
        currentParticipants: 3,
        minParticipants: 4,
        discount: 12,
        minQuantity: 50,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        location: { city: 'Mumbai', area: 'Andheri' }
      },
      {
        id: 'GRP002',
        product: { name: 'Fresh Potatoes', id: '3' },
        currentParticipants: 2,
        minParticipants: 3,
        discount: 8,
        minQuantity: 30,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        location: { city: 'Mumbai', area: 'Bandra' }
      }
    ];

    res.status(200).json({
      success: true,
      data: groupOrders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group orders'
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// Helper function to get emoji for category
function getCategoryEmoji(category) {
  const emojis = {
    vegetables: '🥕',
    fruits: '🍎',
    grains: '🌾',
    oils: '🛢️',
    spices: '🌶️',
    dairy: '🥛',
    meat: '🥩',
    seafood: '🐟',
    other: '📦'
  };
  return emojis[category] || '📦';
}

module.exports = router;
