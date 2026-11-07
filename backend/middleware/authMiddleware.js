import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.tkd_token) {
    token = req.cookies.tkd_token;
  }
  // 2. Fallback to Authorization Header (Bearer <token>)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ [Auth Middleware] JWT_SECRET is not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration error'
      });
    }

    const decoded = jwt.verify(token, secret);

    // Verify admin exists and is active
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    if (admin.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account is inactive or disabled'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session token. Please sign in again.'
    });
  }
};
