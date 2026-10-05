import { authenticate } from './auth.js';

/**
 * Middleware to ensure the user is an admin.
 * Assumes authenticate middleware has been run and req.user is set.
 */
export const admin = (req, res, next) => {
  // First, ensure the user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Check if the user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: admin privileges required',
    });
  }

  next();
};
