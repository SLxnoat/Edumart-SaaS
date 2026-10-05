import ChatbotService from '../services/chatbotService.js';
import ChatbotInteraction from '../models/ChatbotInteraction.js';

/**
 * Send a message to the chatbot and get a response
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user.id : null; // Get user ID from JWT if authenticated

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and sessionId are required',
      });
    }

    // Process the message through our chatbot service
    const result = await ChatbotService.processMessage({
      message,
      sessionId,
      userId
    });

    // Save the interaction to database
    const interaction = await ChatbotInteraction.create({
      userId,
      sessionId: result.sessionId,
      message: result.message,
      response: result.response,
      intent: result.intent,
      confidenceScore: result.confidence,
      isHelpful: null // Will be updated when user provides feedback
    });

    res.status(200).json({
      success: true,
      data: {
        id: interaction.id,
        message: interaction.message,
        response: interaction.response,
        intent: interaction.intent,
        confidenceScore: interaction.confidenceScore,
        createdAt: interaction.createdAt
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chatbot message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get chat history for a user or session
 */
export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user ? req.user.id : null; // Get user ID from JWT if authenticated
    const { limit = 50, offset = 0 } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    // Get chat history from database
    const interactions = await ChatbotInteraction.findAll({
      where: {
        sessionId,
        ...(userId ? { userId } : { userId: null }) // For guest users, userId is null
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions.map(interaction => ({
        id: interaction.id,
        message: interaction.message,
        response: interaction.response,
        intent: interaction.intent,
        confidenceScore: interaction.confidenceScore,
        isHelpful: interaction.isHelpful,
        createdAt: interaction.createdAt
      }))
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Submit feedback on a chatbot response
 */
export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean value',
      });
    }

    // Find the interaction
    const interaction = await ChatbotInteraction.findByPk(id);
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot interaction not found',
      });
    }

    // Verify ownership (optional - you might want to allow feedback on any interaction)
    // For now, we'll allow feedback on any interaction (in production, you might want to restrict this)

    // Update the interaction with feedback
    await interaction.update({ isHelpful });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: interaction.id,
        isHelpful: interaction.isHelpful,
        updatedAt: interaction.updatedAt
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  sendMessage,
  getHistory,
  submitFeedback
};
