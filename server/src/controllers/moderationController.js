import Material from '../models/Material.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import EmailService from '../services/emailService.js';

/**
 * Get pending materials for moderation
 */
export const getPendingMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll({
      where: {
        approvalStatus: 'pending',
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error('Get pending materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending materials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Approve a material
 */
export const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    if (material.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Material is not pending approval',
      });
    }

    // Approve the material
    await material.update({
      approvalStatus: 'approved',
      isPublished: true, // publish when approved
      moderationFeedback: null,
    });

    // Notify creator
    const creator = await User.findByPk(material.createdBy);
    if (creator) {
      await Notification.create({
        userId: creator.id,
        type: 'system',
        message: `Your material "${material.title}" has been approved and is now published.`,
        relatedId: material.id,
        relatedType: 'material',
      });

      // Send email notification
      await EmailService.sendVerificationEmail(
        creator.email,
        'Material Approved',
        `Your material "${material.title}" has been approved and is now published on EduMart.`,
        `<p>Your material "<strong>${material.title}</strong>" has been approved and is now published on EduMart.</p>`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Material approved',
      material,
    });
  } catch (error) {
    console.error('Approve material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Reject a material with feedback
 */
export const rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required for rejection',
      });
    }

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    if (material.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Material is not pending approval',
      });
    }

    // Reject the material
    await material.update({
      approvalStatus: 'rejected',
      isPublished: false, // ensure not published
      moderationFeedback: feedback,
    });

    // Notify creator
    const creator = await User.findByPk(material.createdBy);
    if (creator) {
      await Notification.create({
        userId: creator.id,
        type: 'system',
        message: `Your material "${material.title}" has been rejected. Feedback: ${feedback}`,
        relatedId: material.id,
        relatedType: 'material',
      });

      // Send email notification
      await EmailService.sendVerificationEmail(
        creator.email,
        'Material Rejected',
        `Your material "${material.title}" has been rejected. Feedback: ${feedback}`,
        `<p>Your material "<strong>${material.title}</strong>" has been rejected.</p><p>Feedback: ${feedback}</p>`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Material rejected with feedback',
      material,
    });
  } catch (error) {
    console.error('Reject material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
};
