const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
router.get('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: vendor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile'
    });
  }
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
router.put('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const {
      name,
      email,
      profile: {
        businessName,
        businessType,
        address,
        documents
      },
      preferences
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (businessName) updateData['profile.businessName'] = businessName;
    if (businessType) updateData['profile.businessType'] = businessType;
    if (address) updateData['profile.address'] = address;
    if (documents) updateData['profile.documents'] = documents;
    if (preferences) updateData.preferences = preferences;

    const vendor = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile'
    });
  }
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private (Vendor)
router.get('/dashboard', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get order statistics
    const totalOrders = await Order.countDocuments({ vendor: vendorId });
    const activeOrders = await Order.countDocuments({ 
      vendor: vendorId, 
      status: { $in: ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit'] }
    });

    // Calculate total spent
    const spentResult = await Order.aggregate([
      { $match: { vendor: vendorId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalSpent = spentResult[0]?.total || 0;

    // Calculate average rating (mock for now)
    const avgRating = 4.8;

    // Calculate savings (mock calculation)
    const savings = totalSpent * 0.15;

    // Recent orders
    const recentOrders = await Order.find({ vendor: vendorId })
      .populate([
        { path: 'items.product', select: 'name category' },
        { path: 'items.supplier', select: 'name profile.businessName' }
      ])
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent orders
    const formattedOrders = recentOrders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      supplier: order.items[0]?.supplier?.name || order.items[0]?.supplier?.profile?.businessName || 'Unknown',
      items: order.items.map(item => item.product?.name).join(', '),
      status: order.status,
      date: order.createdAt.toISOString().split('T')[0],
      amount: `₹${order.pricing.total.toLocaleString()}`
    }));

    const stats = [
      { 
        label: 'Active Orders', 
        value: activeOrders.toString(), 
        icon: 'Package', 
        color: 'text-blue-600', 
        bg: 'bg-blue-100' 
      },
      { 
        label: 'Total Spent', 
        value: `₹${Math.round(totalSpent).toLocaleString()}`, 
        icon: 'ShoppingCart', 
        color: 'text-green-600', 
        bg: 'bg-green-100' 
      },
      { 
        label: 'Avg Rating', 
        value: avgRating.toString(), 
        icon: 'Star', 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100' 
      },
      { 
        label: 'Savings', 
        value: `₹${Math.round(savings).toLocaleString()}`, 
        icon: 'TrendingUp', 
        color: 'text-purple-600', 
        bg: 'bg-purple-100' 
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentOrders: formattedOrders,
        insights: [
          {
            type: 'savings',
            message: `You've saved ₹${Math.round(savings).toLocaleString()} by using our platform!`,
            icon: '💰'
          },
          {
            type: 'efficiency',
            message: 'Your ordering frequency has increased by 25% this month',
            icon: '📈'
          }
        ]
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @desc    Get nearby vendors (for group orders)
// @route   GET /api/vendors/nearby
// @access  Private (Vendor)
router.get('/nearby', protect, authorize('vendor'), async (req, res) => {
  try {
    const { radius = 5 } = req.query; // radius in km
    const vendor = await User.findById(req.user.id);
    
    if (!vendor.profile?.address?.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Please update your location to find nearby vendors'
      });
    }

    const nearbyVendors = await User.find({
      role: 'vendor',
      _id: { $ne: req.user.id },
      isActive: true,
      'profile.address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              vendor.profile.address.coordinates.lng,
              vendor.profile.address.coordinates.lat
            ]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('name profile.businessName profile.address stats');

    res.status(200).json({
      success: true,
      count: nearbyVendors.length,
      data: nearbyVendors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby vendors'
    });
  }
});

// @desc    Get vendor's order history analytics
// @route   GET /api/vendors/analytics
// @access  Private (Vendor)
router.get('/analytics', protect, authorize('vendor'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const vendorId = req.user.id;

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Order trends
    const orderTrends = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Category-wise spending
    const categorySpending = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSpent: { $sum: '$items.finalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Top suppliers
    const topSuppliers = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'users',
          localField: 'items.supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $group: {
          _id: '$items.supplier',
          name: { $first: '$supplierInfo.name' },
          businessName: { $first: '$supplierInfo.profile.businessName' },
          totalSpent: { $sum: '$items.finalPrice' },
          orderCount: { $sum: 1 },
          avgRating: { $first: '$supplierInfo.stats.rating' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        orderTrends,
        categorySpending,
        topSuppliers,
        summary: {
          totalOrders: orderTrends.reduce((sum, day) => sum + day.orders, 0),
          totalRevenue: orderTrends.reduce((sum, day) => sum + day.revenue, 0),
          avgOrderValue: orderTrends.length > 0 
            ? orderTrends.reduce((sum, day) => sum + day.revenue, 0) / 
              orderTrends.reduce((sum, day) => sum + day.orders, 0)
            : 0
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
});

module.exports = router;
