import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import EmailService from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate verification token
 * @returns {string} UUID v4 token
 */
const generateVerificationToken = () => {
  return uuidv4();
};

/**
 * Generate reset token
 * @returns {string} UUID v4 token
 */
const generateResetToken = () => {
  return uuidv4();
};

/**
 * Register a new user with email verification
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required',
      });
    }

    // Validate role if provided
    const validRoles = ['student', 'tutor', 'admin'];
    const userRole = role ? role.toLowerCase() : 'student';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, tutor, or admin',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours expiry

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: userRole,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const emailSubject = 'Verify your EduMart account';
    const emailText = `
Hello ${firstName},

Thank you for registering with EduMart!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The EduMart Team
`;

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Verify your EduMart account</h2>
  <p>Hello ${firstName},</p>
  <p>Thank you for registering with EduMart!</p>
  <p>Please verify your email address by clicking the button below:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
  </div>
  <p>Or copy and paste this link in your browser:</p>
  <p>${verificationUrl}</p>
  <p>This link will expire in 24 hours.</p>
  <p>If you didn't create this account, please ignore this email.</p>
  <hr>
  <p>Best regards,<br>The EduMart Team</p>
</div>
`;

    await EmailService.sendVerificationEmail(email, emailSubject, emailText, emailHtml);

    // Return success response (without sensitive data)
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find user with valid verification token
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          [Op.gt]: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update user as verified
    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now active.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from user object
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  // In a more sophisticated implementation, we might add token to blacklist
  // For now, we just return success since JWT is stateless
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Get user profile (requires authentication)
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update user profile (requires authentication)
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userId = req.user.id;

    // Build update object
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) {
      // Validate email format
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }
      updateData.email = email;
    }

    // Check if email is being changed and if it's already taken by another user
    if (updateData.email) {
      const existingUser = await User.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: userId }, // Not the current user
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another account',
        });
      }
      // If email is changed, require re-verification
      updateData.isVerified = false;
      updateData.verificationToken = generateVerificationToken();
      updateData.verificationTokenExpires = new Date();
      updateData.verificationTokenExpires.setHours(updateData.verificationTokenExpires.getHours() + 24);
    }

    // Update user
    const [updatedRows] = await User.update(updateData, {
      where: { id: userId },
      returning: true, // Return the updated rows
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get the updated user (excluding sensitive fields)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    // If email was changed, send verification email
    if (updateData.email && updateData.email !== req.user.email) {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${updatedUser.verificationToken}`;
      const emailSubject = 'Verify your new email address';
      const emailText = `
Hello ${updatedUser.firstName},

You have updated your email address to ${updatedUser.email}.

Please verify your new email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't make this change, please contact support immediately.

Best regards,
The EduMart Team
`;

      const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Verify your new email address</h2>
  <p>Hello ${updatedUser.firstName},</p>
  <p>You have updated your email address to ${updatedUser.email}.</p>
  <p>Please verify your new email address by clicking the button below:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
  </div>
  <p>Or copy and paste this link in your browser:</p>
  <p>${verificationUrl}</p>
  <p>This link will expire in 24 hours.</p>
  <p>If you didn't make this change, please contact support immediately.</p>
  <hr>
  <p>Best regards,<br>The EduMart Team</p>
</div>
`;

      await EmailService.sendVerificationEmail(updatedUser.email, emailSubject, emailText, emailHtml);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Forgot password - initiate password reset
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ where: { email } });

    // Always return the same message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email is registered, you will receive a password reset link',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    // Save token to user
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires,
    });

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const emailSubject = 'Reset your EduMart password';
    const emailText = `
Hello ${user.firstName},

You have requested to reset your password.

Please reset your password by clicking the link below:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The EduMart Team
`;

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Reset your EduMart password</h2>
  <p>Hello ${user.firstName},</p>
  <p>You have requested to reset your password.</p>
  <p>Please reset your password by clicking the button below:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
  </div>
  <p>Or copy and paste this link in your browser:</p>
  <p>${resetUrl}</p>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
  <hr>
  <p>Best regards,<br>The EduMart Team</p>
</div>
`;

    await EmailService.sendVerificationEmail(email, emailSubject, emailText, emailHtml);

    res.status(200).json({
      success: true,
      message: 'If the email is registered, you will receive a password reset link',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Validate password length
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 100 characters',
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password and clear reset token
    await user.update({
      password, // Will be hashed by the beforeUpdate hook
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  register,
  verifyEmail,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
