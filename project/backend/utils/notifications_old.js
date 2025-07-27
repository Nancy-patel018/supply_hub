const { sendOTP, sendOrderConfirmationSMS, sendDeliveryNotificationSMS } = require('./sms');
const { sendWhatsAppOTP, sendWhatsAppOrderConfirmation, sendWhatsAppDeliveryNotification } = require('./whatsapp');
const { sendEmailOTP } = require('./email');

/**
 * Send order notification to supplier via Socket.IO
 */
const sendOrderNotification = (io, supplierId, type, data) => {
  try {
    io.to(`supplier-${supplierId}`).emit('orderNotification', {
      type,
      data,
      timestamp: new Date()
    });
    
    console.log(`Order notification sent to supplier ${supplierId}:`, type);
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

/**
 * Send real-time order update to vendor
 */
const sendOrderUpdate = (io, vendorId, orderData) => {
  try {
    io.to(`vendor-${vendorId}`).emit('orderUpdate', {
      orderId: orderData.id,
      status: orderData.status,
      message: orderData.message,
      timestamp: new Date()
    });
    
    console.log(`Order update sent to vendor ${vendorId}`);
  } catch (error) {
    console.error('Error sending order update:', error);
  }
};

/**
 * Send price alert to vendor
 */
const sendPriceAlert = async (vendor, productData) => {
  try {
    const alertData = {
      productName: productData.name,
      currentPrice: productData.price,
      previousPrice: productData.previousPrice,
      unit: productData.unit,
      trend: productData.trend,
      bestSupplier: productData.bestSupplier,
      recommendation: productData.recommendation,
      productId: productData.id
    };

    // Send via preferred notification method
    if (vendor.preferences?.notifications?.sms && vendor.phone) {
      // For SMS, we'll use a simpler message format
      const message = `🔔 Price Alert: ${productData.name} is now ₹${productData.price}/${productData.unit}. ${productData.recommendation}`;
      // You could implement sendPriceAlertSMS here
    }

    if (vendor.preferences?.notifications?.whatsapp && vendor.phone) {
      await sendWhatsAppPriceAlert(vendor.phone, alertData);
    }

    console.log(`Price alert sent to vendor ${vendor._id}`);
    return true;
    
  } catch (error) {
    console.error('Error sending price alert:', error);
    return false;
  }
};

/**
 * Send group order invitation
 */
const sendGroupOrderInvitation = (io, vendorIds, groupOrderData) => {
  try {
    vendorIds.forEach(vendorId => {
      io.to(`vendor-${vendorId}`).emit('groupOrderInvitation', {
        groupId: groupOrderData.id,
        product: groupOrderData.product,
        discount: groupOrderData.discount,
        currentParticipants: groupOrderData.currentParticipants,
        minParticipants: groupOrderData.minParticipants,
        expiresAt: groupOrderData.expiresAt,
        timestamp: new Date()
      });
    });
    
    console.log(`Group order invitation sent to ${vendorIds.length} vendors`);
  } catch (error) {
    console.error('Error sending group order invitation:', error);
  }
};

/**
 * Send comprehensive order confirmation
 */
const sendOrderConfirmation = async (vendor, order) => {
  try {
    const orderData = {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unit: item.product?.unit || 'unit',
        totalPrice: item.finalPrice
      })),
      total: order.pricing.total,
      estimatedTime: order.delivery?.estimatedTime 
        ? new Date(order.delivery.estimatedTime).toLocaleString('en-IN')
        : '2-4 hours',
      id: order._id
    };

    let confirmationSent = false;

    // Try WhatsApp first if enabled
    if (vendor.preferences?.notifications?.whatsapp && vendor.phone) {
      confirmationSent = await sendWhatsAppOrderConfirmation(vendor.phone, orderData);
    }

    // Fallback to SMS if WhatsApp failed or not enabled
    if (!confirmationSent && vendor.preferences?.notifications?.sms && vendor.phone) {
      confirmationSent = await sendOrderConfirmationSMS(vendor.phone, orderData);
    }

    console.log(`Order confirmation sent to vendor ${vendor._id}: ${confirmationSent}`);
    return confirmationSent;
    
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return false;
  }
};

/**
 * Send delivery status update
 */
const sendDeliveryUpdate = async (vendor, deliveryData) => {
  try {
    let updateSent = false;

    // Try WhatsApp first
    if (vendor.preferences?.notifications?.whatsapp && vendor.phone) {
      updateSent = await sendWhatsAppDeliveryNotification(vendor.phone, deliveryData);
    }

    // Fallback to SMS
    if (!updateSent && vendor.preferences?.notifications?.sms && vendor.phone) {
      updateSent = await sendDeliveryNotificationSMS(vendor.phone, deliveryData);
    }

    console.log(`Delivery update sent to vendor ${vendor._id}: ${updateSent}`);
    return updateSent;
    
  } catch (error) {
    console.error('Error sending delivery update:', error);
    return false;
  }
};

/**
 * Send bulk notifications to multiple users
 */
const sendBulkNotification = async (users, message, type = 'general') => {
  try {
    const results = {
      success: 0,
      failed: 0,
      total: users.length
    };

    for (const user of users) {
      try {
        let sent = false;

        if (type === 'sms' && user.phone) {
          // Implement bulk SMS sending
          // sent = await sendBulkSMS(user.phone, message);
        } else if (type === 'whatsapp' && user.phone) {
          // sent = await sendWhatsAppMessage(user.phone, message);
        }

        if (sent) {
          results.success++;
        } else {
          results.failed++;
        }
        
      } catch (error) {
        console.error(`Failed to send notification to user ${user._id}:`, error);
        results.failed++;
      }
    }

    console.log(`Bulk notification results:`, results);
    return results;
    
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return { success: 0, failed: users.length, total: users.length };
  }
};

/**
 * Create notification record in database
 */
const createNotification = async (userId, title, message, type = 'info', data = {}) => {
  try {
    // In production, you'd save this to a Notifications collection
    const notification = {
      user: userId,
      title,
      message,
      type, // 'info', 'success', 'warning', 'error'
      data,
      read: false,
      createdAt: new Date()
    };

    // await Notification.create(notification);
    console.log(`Notification created for user ${userId}:`, title);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Send push notification (mock implementation)
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // In production, integrate with Firebase Cloud Messaging or similar service
    console.log(`Push notification sent to user ${userId}:`, { title, body, data });
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

module.exports = {
  sendOrderNotification,
  sendOrderUpdate,
  sendPriceAlert,
  sendGroupOrderInvitation,
  sendOrderConfirmation,
  sendDeliveryUpdate,
  sendBulkNotification,
  createNotification,
  sendPushNotification
};
