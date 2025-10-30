import express from 'express';
import { chatService } from '../services/chatService';

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const response = await chatService.generateResponse(message);
    
    res.json({
      response: response.content,
      timestamp: response.timestamp,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate chat response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as chatRouter };
