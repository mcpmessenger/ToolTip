import express from 'express';
import { crawlService } from '../services/crawlService';

const router = express.Router();

// POST /api/crawl
router.post('/', async (req, res) => {
  try {
    const { query, numPages = 2 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }

    if (numPages && (typeof numPages !== 'number' || numPages < 1 || numPages > 10)) {
      return res.status(400).json({ 
        error: 'numPages must be a number between 1 and 10' 
      });
    }

    const results = await crawlService.searchAndCrawl(query, numPages);
    
    res.json({
      results,
      query,
      numPages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crawl error:', error);
    res.status(500).json({ 
      error: 'Failed to crawl web pages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/crawl/health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Crawl Service',
    timestamp: new Date().toISOString()
  });
});

export { router as crawlRouter };
