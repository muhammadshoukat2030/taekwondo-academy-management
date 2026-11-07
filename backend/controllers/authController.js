import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

// Helper to sign JWT token
const generateToken = (admin) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment variables');
  }
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

// Helper for cookie options
const getCookieOptions = () => {
  const isSecure =
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevents XSS theft
    secure: isSecure, // HTTPS in production
    sameSite: isSecure ? 'none' : 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };
};

/**
 * @desc    Authenticate admin & obtain session cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find admin by email (case-insensitive) and explicitly include password field
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // Generic error for non-existent account (prevents user enumeration)
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check account status
    if (admin.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'This administrator account has been deactivated. Please contact the Head Instructor.'
      });
    }

    // Validate password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate JWT and set HTTP-only cookie
    const token = generateToken(admin);
    res.cookie('tkd_token', token, getCookieOptions());

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ [Auth Login Error]:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * @desc    Get currently authenticated admin session
 * @route   GET /api/auth/me
 * @access  Private (Admin)
 */
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        status: req.admin.status,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ [Auth GetMe Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session'
    });
  }
};

/**
 * @desc    Sign out admin & invalidate cookie
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
export const logout = async (req, res) => {
  try {
    const isSecure =
      process.env.COOKIE_SECURE === 'true' ||
      process.env.NODE_ENV === 'production';

    res.cookie('tkd_token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax'
    });

    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('❌ [Auth Logout Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign out'
    });
  }
};
