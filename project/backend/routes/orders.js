const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SupplierProduct = require('../models/SupplierProduct');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendOrderNotification } = require('../utils/notifications');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Vendor)
router.post('/', protect, authorize('vendor'), async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod,
      notes,
      isGroupOrder = false,
      groupOrderId
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate and calculate pricing
    let subtotal = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      const supplierProduct = await SupplierProduct.findById(item.supplierProductId)
        .populate('product')
        .populate('supplier');

      if (!supplierProduct) {
        return res.status(404).json({
          success: false,
          message: `Supplier product not found: ${item.supplierProductId}`
        });
      }

      if (!supplierProduct.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${supplierProduct.product.name} is not available from ${supplierProduct.supplier.name}`
        });
      }

      if (item.quantity > supplierProduct.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${supplierProduct.product.name}. Available: ${supplierProduct.stock}`
        });
      }

      if (item.quantity < supplierProduct.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${supplierProduct.product.name} is ${supplierProduct.minOrderQuantity}`
        });
      }

      const unitPrice = supplierProduct.price;
      const totalPrice = unitPrice * item.quantity;
      
      // Calculate discount
      const bulkDiscount = supplierProduct.getBulkDiscount(item.quantity);
      const discountAmount = (totalPrice * bulkDiscount) / 100;
      const finalPrice = totalPrice - discountAmount;

      processedItems.push({
        product: supplierProduct.product._id,
        supplier: supplierProduct.supplier._id,
        supplierProduct: supplierProduct._id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        discount: discountAmount,
        finalPrice
      });

      subtotal += finalPrice;
      totalDiscount += discountAmount;
    }

    // Calculate delivery charges (simplified)
    const deliveryCharge = subtotal > 500 ? 0 : 50;
    
    // Calculate tax (simplified)
    const tax = subtotal * 0.05; // 5% tax
    
    const total = subtotal + deliveryCharge + tax;

    // Create order
    const order = new Order({
      vendor: req.user.id,
      items: processedItems,
      pricing: {
        subtotal,
        discount: totalDiscount,
        deliveryCharge,
        tax,
        total
      },
      deliveryAddress,
      paymentMethod,
      notes: {
        vendor: notes
      },
      groupOrder: isGroupOrder ? {
        isGroupOrder: true,
        groupId: groupOrderId
      } : undefined
    });

    await order.save();

    // Update supplier product stock
    for (const item of processedItems) {
      await SupplierProduct.findByIdAndUpdate(
        item.supplierProduct,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate order details
    await order.populate([
      { path: 'items.product', select: 'name category images' },
      { path: 'items.supplier', select: 'name profile.businessName profile.address' }
    ]);

    // Send notifications to suppliers
    const io = req.app.get('io');
    for (const item of processedItems) {
      sendOrderNotification(io, item.supplier, 'new_order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        vendorName: req.user.name,
        productName: item.product.name,
        quantity: item.quantity
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// @desc    Get vendor orders
// @route   GET /api/orders
// @access  Private (Vendor)
router.get('/', protect, authorize('vendor'), async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { vendor: req.user.id };
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate([
        { path: 'items.product', select: 'name category images' },
        { path: 'items.supplier', select: 'name profile.businessName profile.address' }
      ])
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Vendor)
router.get('/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.id
    }).populate([
      { path: 'items.product', select: 'name category images specifications' },
      { path: 'items.supplier', select: 'name profile phone email stats' },
      { path: 'delivery.transporter', select: 'name phone profile' }
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Vendor)
router.put('/:id/cancel', protect, authorize('vendor'), async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.updateStatus('cancelled', reason || 'Cancelled by vendor', req.user.id);
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await SupplierProduct.findByIdAndUpdate(
        item.supplierProduct,
        { $inc: { stock: item.quantity } }
      );
    }

    // Send notifications to suppliers
    const io = req.app.get('io');
    const uniqueSuppliers = [...new Set(order.items.map(item => item.supplier.toString()))];
    
    for (const supplierId of uniqueSuppliers) {
      sendOrderNotification(io, supplierId, 'order_cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        vendorName: req.user.name,
        reason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private (Vendor)
router.get('/:id/track', protect, authorize('vendor'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.id
    }).populate([
      { path: 'items.supplier', select: 'name profile.businessName' },
      { path: 'delivery.transporter', select: 'name phone profile' }
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate estimated delivery time if not set
    if (!order.delivery.estimatedTime && order.status === 'confirmed') {
      order.delivery.estimatedTime = order.calculateEstimatedDelivery();
      await order.save();
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      estimatedDelivery: order.delivery.estimatedTime,
      actualDelivery: order.delivery.actualTime,
      transporter: order.delivery.transporter,
      trackingNumber: order.delivery.trackingNumber,
      currentLocation: null, // Mock location tracking
      suppliers: order.items.map(item => ({
        name: item.supplier.name || item.supplier.profile?.businessName,
        status: order.status, // In real app, this would be item-specific
        product: item.product
      }))
    };

    // Mock real-time location (in production, integrate with GPS tracking)
    if (order.status === 'in_transit') {
      trackingInfo.currentLocation = {
        lat: 19.0760 + Math.random() * 0.01,
        lng: 72.8777 + Math.random() * 0.01,
        address: 'On route to delivery address',
        timestamp: new Date()
      };
    }

    res.status(200).json({
      success: true,
      data: trackingInfo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order'
    });
  }
});

// @desc    Rate order (after delivery)
// @route   POST /api/orders/:id/rate
// @access  Private (Vendor)
router.post('/:id/rate', protect, authorize('vendor'), async (req, res) => {
  try {
    const { rating, comment, supplierRatings } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered before rating'
      });
    }

    if (order.feedback.vendor.rating) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been rated'
      });
    }

    // Update order feedback
    order.feedback.vendor = {
      rating: rating,
      comment: comment,
      submittedAt: new Date()
    };

    await order.save();

    // Update supplier ratings if provided
    if (supplierRatings && Array.isArray(supplierRatings)) {
      for (const supplierRating of supplierRatings) {
        const supplier = await User.findById(supplierRating.supplierId);
        if (supplier) {
          // Update supplier's overall rating (simplified calculation)
          const currentRating = supplier.stats.rating || 0;
          const currentReviews = supplier.stats.reviewCount || 0;
          const newRating = ((currentRating * currentReviews) + supplierRating.rating) / (currentReviews + 1);
          
          supplier.stats.rating = Math.round(newRating * 10) / 10;
          supplier.stats.reviewCount = currentReviews + 1;
          await supplier.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: order.feedback.vendor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating'
    });
  }
});

// @desc    Join group order
// @route   POST /api/orders/group/:groupId/join
// @access  Private (Vendor)
router.post('/group/:groupId/join', protect, authorize('vendor'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { productId, quantity } = req.body;

    // Mock group order logic (in production, implement proper group order management)
    const groupOrder = {
      id: groupId,
      product: await Product.findById(productId),
      participants: [
        { vendor: req.user.id, quantity, status: 'joined' }
      ],
      discount: 12,
      minQuantity: 50,
      currentQuantity: quantity,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    };

    // In production, save to GroupOrder collection
    // await GroupOrder.findByIdAndUpdate(groupId, {
    //   $push: { participants: { vendor: req.user.id, quantity, status: 'joined' } },
    //   $inc: { currentQuantity: quantity }
    // });

    res.status(200).json({
      success: true,
      message: 'Successfully joined group order',
      data: groupOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error joining group order'
    });
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (Vendor)
router.get('/stats/dashboard', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get basic stats
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

    // Calculate savings (mock calculation)
    const savings = totalSpent * 0.15; // Assume 15% average savings

    // Recent orders
    const recentOrders = await Order.find({ vendor: vendorId })
      .populate([
        { path: 'items.product', select: 'name' },
        { path: 'items.supplier', select: 'name profile.businessName' }
      ])
      .sort({ createdAt: -1 })
      .limit(5);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: { vendor: vendorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          activeOrders,
          totalSpent: Math.round(totalSpent),
          savings: Math.round(savings)
        },
        recentOrders,
        statusDistribution
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
});

module.exports = router;
