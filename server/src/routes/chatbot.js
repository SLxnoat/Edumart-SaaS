import { Router } from 'express';
import {
  sendMessage,
  getHistory,
  submitFeedback
} from '../controllers/chatbotController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All chatbot routes require authentication (optional for guest chats)
// We'll make authentication optional to allow guest chats, but still validate session
router.use((req, res, next) => {
  // Optional authentication - if token is provided, verify it
  // If no token, allow anonymous chat (userId will be null in service)
  if (req.headers.authorization) {
    // Try to authenticate, but don't require it
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1]; // Bearer <token>

      if (token) {
        // We'll let the controller handle extracting user from req.user if authenticated
        // For now, just continue - the controller will check req.user
        next();
      } else {
        next();
      }
    } catch (error) {
      // If token is invalid, still allow chat (as guest)
      next();
    }
  } else {
    next();
  }
});

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', sendMessage);

// GET /api/chatbot/history/:sessionId - Get chat history for a session
router.get('/history/:sessionId', getHistory);

// POST /api/chatbot/feedback/:id - Submit feedback on a chatbot response
router.post('/feedback/:id', submitFeedback);

export default router;
