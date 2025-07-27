const socketIo = require('socket.io');

/**
 * Simple notification system using Socket.IO for real-time updates
 * No SMS, WhatsApp, or Email notifications
 */

/**
 * Send real-time notification to user
 */
const sendRealTimeNotification = (io, userId, notification) => {
  try {
    if (!io || !userId) {
      console.error('Invalid parameters for real-time notification');
      return false;
    }

    // Send to user-specific room
    io.to(`user-${userId}`).emit('notification', {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: new Date(),
      read: false
    });

    console.log(`Real-time notification sent to user ${userId}:`, notification.title);
    return true;
    
  } catch (error) {
    console.error('Error sending real-time notification:', error);
    return false;
  }
};

/**
 * Send notification to vendor
 */
const notifyVendor = (io, vendorId, notification) => {
  return sendRealTimeNotification(io, vendorId, {
    ...notification,
    userType: 'vendor'
  });
};

/**
 * Send notification to supplier
 */
const notifySupplier = (io, supplierId, notification) => {
  return sendRealTimeNotification(io, supplierId, {
    ...notification,
    userType: 'supplier'
  });
};

/**
 * Send notification to transporter
 */
const notifyTransporter = (io, transporterId, notification) => {
  return sendRealTimeNotification(io, transporterId, {
    ...notification,
    userType: 'transporter'
  });
};

/**
 * Notify order status change
 */
const notifyOrderStatusChange = (io, order) => {
  try {
    const notification = {
      type: 'order_update',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} is now ${order.status}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    };

    // Notify vendor
    if (order.vendor) {
      notifyVendor(io, order.vendor, notification);
    }

    // Notify supplier
    if (order.supplier) {
      notifySupplier(io, order.supplier, {
        ...notification,
        title: 'Order Status Updated',
        message: `Order #${order.orderNumber} from vendor is now ${order.status}`
      });
    }

    // Notify transporter if assigned
    if (order.transporter) {
      notifyTransporter(io, order.transporter, {
        ...notification,
        title: 'Delivery Status Updated',
        message: `Delivery for order #${order.orderNumber} is now ${order.status}`
      });
    }

    return true;
  } catch (error) {
    console.error('Error notifying order status change:', error);
    return false;
  }
};

/**
 * Notify new order received
 */
const notifyNewOrder = (io, order) => {
  try {
    // Notify supplier about new order
    if (order.supplier) {
      notifySupplier(io, order.supplier, {
        type: 'new_order',
        title: 'New Order Received',
        message: `New order #${order.orderNumber} from ${order.vendorName || 'vendor'}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          vendorName: order.vendorName,
          total: order.total
        }
      });
    }

    // Notify vendor about order confirmation
    if (order.vendor) {
      notifyVendor(io, order.vendor, {
        type: 'order_confirmation',
        title: 'Order Placed Successfully',
        message: `Your order #${order.orderNumber} has been placed`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: order.total
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error notifying new order:', error);
    return false;
  }
};

/**
 * Notify group order invitation
 */
const notifyGroupOrderInvitation = (io, vendorIds, groupOrder) => {
  try {
    const notification = {
      type: 'group_order_invitation',
      title: 'Group Order Invitation',
      message: `Join a group order for ${groupOrder.productName} and save money!`,
      data: {
        groupOrderId: groupOrder._id,
        productName: groupOrder.productName,
        currentParticipants: groupOrder.participants.length,
        maxParticipants: groupOrder.maxParticipants,
        discount: groupOrder.bulkDiscount
      }
    };

    vendorIds.forEach(vendorId => {
      notifyVendor(io, vendorId, notification);
    });

    return true;
  } catch (error) {
    console.error('Error notifying group order invitation:', error);
    return false;
  }
};

/**
 * Notify price changes
 */
const notifyPriceChange = (io, vendorIds, product, oldPrice, newPrice) => {
  try {
    const changeType = newPrice > oldPrice ? 'increased' : 'decreased';
    const changePercent = Math.abs(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1);
    
    const notification = {
      type: 'price_alert',
      title: `Price ${changeType.charAt(0).toUpperCase() + changeType.slice(1)}`,
      message: `${product.name} price ${changeType} by ${changePercent}% (₹${oldPrice} → ₹${newPrice})`,
      data: {
        productId: product._id,
        productName: product.name,
        oldPrice,
        newPrice,
        changePercent: parseFloat(changePercent),
        changeType
      }
    };

    vendorIds.forEach(vendorId => {
      notifyVendor(io, vendorId, notification);
    });

    return true;
  } catch (error) {
    console.error('Error notifying price change:', error);
    return false;
  }
};

/**
 * Notify delivery updates
 */
const notifyDeliveryUpdate = (io, order, updateType) => {
  try {
    let notification = {};

    switch (updateType) {
      case 'assigned':
        notification = {
          type: 'delivery_assigned',
          title: 'Delivery Assigned',
          message: `A transporter has been assigned to your order #${order.orderNumber}`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            transporterName: order.transporterName
          }
        };
        break;
      
      case 'picked_up':
        notification = {
          type: 'delivery_pickup',
          title: 'Order Picked Up',
          message: `Your order #${order.orderNumber} has been picked up for delivery`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            estimatedDelivery: order.estimatedDelivery
          }
        };
        break;
      
      case 'delivered':
        notification = {
          type: 'delivery_completed',
          title: 'Order Delivered',
          message: `Your order #${order.orderNumber} has been delivered successfully!`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            deliveredAt: new Date()
          }
        };
        break;
    }

    // Notify vendor
    if (order.vendor && notification.type) {
      notifyVendor(io, order.vendor, notification);
    }

    return true;
  } catch (error) {
    console.error('Error notifying delivery update:', error);
    return false;
  }
};

/**
 * Send broadcast notification to all users of a specific role
 */
const broadcastToRole = (io, role, notification) => {
  try {
    io.to(`role-${role}`).emit('notification', {
      id: Date.now().toString(),
      type: notification.type || 'broadcast',
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: new Date(),
      read: false
    });

    console.log(`Broadcast notification sent to all ${role}s:`, notification.title);
    return true;
    
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return false;
  }
};

/**
 * System maintenance notification
 */
const notifySystemMaintenance = (io, startTime, duration) => {
  try {
    const notification = {
      type: 'system_maintenance',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled from ${startTime} for ${duration}`,
      data: {
        startTime,
        duration,
        maintenanceType: 'scheduled'
      }
    };

    // Broadcast to all roles
    ['vendor', 'supplier', 'transporter', 'admin'].forEach(role => {
      broadcastToRole(io, role, notification);
    });

    return true;
  } catch (error) {
    console.error('Error notifying system maintenance:', error);
    return false;
  }
};

module.exports = {
  sendRealTimeNotification,
  notifyVendor,
  notifySupplier,
  notifyTransporter,
  notifyOrderStatusChange,
  notifyNewOrder,
  notifyGroupOrderInvitation,
  notifyPriceChange,
  notifyDeliveryUpdate,
  broadcastToRole,
  notifySystemMaintenance
};
