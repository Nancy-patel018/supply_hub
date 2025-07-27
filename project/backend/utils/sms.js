const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send SMS OTP
 * @param {string} phoneNumber - Phone number in international format
 * @param {string} otp - OTP code to send
 * @returns {boolean} - Success status
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    // Ensure phone number is in international format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const message = `Your OTP for Street Food Vendor login is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log(`SMS sent successfully: ${result.sid}`);
    return true;
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

/**
 * Send order confirmation SMS
 * @param {string} phoneNumber - Phone number
 * @param {object} orderData - Order details
 * @returns {boolean} - Success status
 */
const sendOrderConfirmationSMS = async (phoneNumber, orderData) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const message = `🍛 Order Confirmed! 
Order #${orderData.orderNumber}
Total: ₹${orderData.total}
Estimated delivery: ${orderData.estimatedTime}
Track: ${process.env.FRONTEND_URL}/orders/${orderData.id}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log(`Order SMS sent: ${result.sid}`);
    return true;
    
  } catch (error) {
    console.error('Error sending order SMS:', error);
    return false;
  }
};

/**
 * Send delivery notification SMS
 * @param {string} phoneNumber - Phone number
 * @param {object} deliveryData - Delivery details
 * @returns {boolean} - Success status
 */
const sendDeliveryNotificationSMS = async (phoneNumber, deliveryData) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const message = `🚚 Your order #${deliveryData.orderNumber} is ${deliveryData.status}! 
${deliveryData.message}
${deliveryData.trackingUrl ? `Track: ${deliveryData.trackingUrl}` : ''}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log(`Delivery SMS sent: ${result.sid}`);
    return true;
    
  } catch (error) {
    console.error('Error sending delivery SMS:', error);
    return false;
  }
};

module.exports = {
  sendOTP,
  sendOrderConfirmationSMS,
  sendDeliveryNotificationSMS
};
