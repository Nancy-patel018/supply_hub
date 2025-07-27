const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../utils/sms');
const { sendWhatsAppOTP } = require('../utils/whatsapp');
const { sendEmailOTP } = require('../utils/email');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user (Send OTP)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, role, verificationMethod = 'phone' } = req.body;

    // Validation
    if (!name || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, and role'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create user (unverified)
    const user = await User.create({
      name,
      phone,
      email,
      role,
      verificationMethod,
      isVerified: false
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP based on verification method
    let otpSent = false;
    let otpMethod = '';

    if (verificationMethod === 'whatsapp') {
      otpSent = await sendWhatsAppOTP(phone, otp);
      otpMethod = 'WhatsApp';
    } else if (verificationMethod === 'email' && email) {
      otpSent = await sendEmailOTP(email, otp, name);
      otpMethod = 'Email';
    } else {
      otpSent = await sendOTP(phone, otp);
      otpMethod = 'SMS';
    }

    if (!otpSent) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via ${otpMethod}`
      });
    }

    res.status(201).json({
      success: true,
      message: `OTP sent to your ${otpMethod.toLowerCase()}`,
      data: {
        userId: user._id,
        phone: user.phone,
        verificationMethod,
        expiresAt: user.otp.expiresAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and OTP'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.verifyOTP(otp);
    if (!verification.success) {
      await user.save(); // Save the attempt count
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// @desc    Login user (Send OTP for phone/WhatsApp, or password for email)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password, loginMethod = 'phone' } = req.body;

    let user;

    if (loginMethod === 'phone' || loginMethod === 'whatsapp') {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide phone number'
        });
      }

      user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this phone number'
        });
      }

      // Generate and send OTP
      const otp = user.generateOTP();
      await user.save();

      let otpSent = false;
      if (loginMethod === 'whatsapp') {
        otpSent = await sendWhatsAppOTP(phone, otp);
      } else {
        otpSent = await sendOTP(phone, otp);
      }

      if (!otpSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP'
        });
      }

      res.status(200).json({
        success: true,
        message: `OTP sent to your ${loginMethod === 'whatsapp' ? 'WhatsApp' : 'phone'}`,
        data: {
          userId: user._id,
          loginMethod,
          expiresAt: user.otp.expiresAt
        }
      });

    } else {
      // Email + Password login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordCorrect = await user.matchPassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          }
        }
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Verify login OTP
// @route   POST /api/auth/verify-login-otp
// @access  Public
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and OTP'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.verifyOTP(otp);
    if (!verification.success) {
      await user.save();
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.otp = undefined; // Clear OTP
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login verification'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, method = 'phone' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    let otpSent = false;
    if (method === 'whatsapp') {
      otpSent = await sendWhatsAppOTP(user.phone, otp);
    } else if (method === 'email' && user.email) {
      otpSent = await sendEmailOTP(user.email, otp, user.name);
    } else {
      otpSent = await sendOTP(user.phone, otp);
    }

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        expiresAt: user.otp.expiresAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP resend'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.profile,
          preferences: user.preferences,
          stats: user.stats,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
