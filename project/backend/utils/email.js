const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email OTP
 * @param {string} email - Email address
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 * @returns {boolean} - Success status
 */
const sendEmailOTP = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"Street Food Vendor Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Login - Street Food Vendor Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🍛 Street Food Vendor</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Supply Chain Platform</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Your One-Time Password (OTP) for login is:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0;">
              <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold;">
                ${otp}
              </h1>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 0 5px 5px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⏰ This OTP is valid for 10 minutes only</strong><br>
                🔒 Do not share this code with anyone
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you didn't request this OTP, please ignore this email or contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Happy cooking! 👨‍🍳<br>
                <strong>Street Food Vendor Platform Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name}!\n\nYour OTP for Street Food Vendor Platform login is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.\n\nIf you didn't request this, please ignore this email.\n\nHappy cooking!\nStreet Food Vendor Platform Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email OTP sent successfully:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
};

/**
 * Send welcome email
 * @param {string} email - Email address
 * @param {string} name - User's name
 * @param {string} role - User's role
 * @returns {boolean} - Success status
 */
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const mailOptions = {
      from: `"Street Food Vendor Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to Street Food Vendor Platform, ${name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Street Food Vendor Platform</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🍛 Welcome to Street Food Vendor Platform!</h1>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Welcome to the Street Food Vendor Platform! We're excited to have you join our community as a <strong>${role}</strong>.
            </p>
            
            ${role === 'vendor' ? `
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #0066cc; margin-top: 0;">🚀 Get Started as a Vendor:</h3>
              <ul style="color: #333; padding-left: 20px;">
                <li>Browse products from nearby suppliers</li>
                <li>Compare prices and ratings</li>
                <li>Get AI-powered price insights</li>
                <li>Join group orders to save money</li>
                <li>Track your orders in real-time</li>
              </ul>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h4 style="color: #333; margin-top: 0;">📞 Need Help?</h4>
              <p style="margin: 0; color: #666;">
                Our support team is here to help you get the most out of our platform. 
                Reach out to us anytime at <a href="mailto:support@streetfoodvendor.com">support@streetfoodvendor.com</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Happy cooking! 👨‍🍳<br>
                <strong>Street Food Vendor Platform Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send order confirmation email
 * @param {string} email - Email address
 * @param {object} orderData - Order details
 * @returns {boolean} - Success status
 */
const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    const itemsList = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${item.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.totalPrice}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Street Food Vendor Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmed - ${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order #${orderData.orderNumber}</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Your order has been confirmed and is being processed.</strong>
              </p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 20px;">Order Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                  <th style="padding: 15px 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td colspan="2" style="padding: 15px 10px; text-align: right;">Total:</td>
                  <td style="padding: 15px 10px; text-align: right;">₹${orderData.total}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 0 5px 5px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📅 Estimated Delivery:</strong> ${orderData.estimatedTime}
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${orderData.id}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Thank you for choosing us! 🙏<br>
                <strong>Street Food Vendor Platform Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendEmailOTP,
  sendWelcomeEmail,
  sendOrderConfirmationEmail
};
