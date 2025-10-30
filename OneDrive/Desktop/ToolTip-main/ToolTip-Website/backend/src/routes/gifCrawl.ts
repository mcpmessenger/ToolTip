import express from 'express';
import { gifService, CrawlRequest } from '../services/gifService';
import { join } from 'path';
import { existsSync } from 'fs';

const router = express.Router();

// POST /api/crawl - Start a new crawl request
router.post('/', async (req, res) => {
  try {
    const { 
      url, 
      element_selector, 
      element_text, 
      coordinates, 
      wait_time = 2.0 
    } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required and must be a string' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }

    // Validate that at least one targeting method is provided
    if (!element_selector && !element_text && !coordinates) {
      return res.status(400).json({ 
        error: 'At least one targeting method must be provided (element_selector, element_text, or coordinates)' 
      });
    }

    const request: CrawlRequest = {
      url,
      element_selector,
      element_text,
      coordinates,
      wait_time
    };

    const crawlId = await gifService.startCrawl(request);
    
    res.json({
      crawl_id: crawlId,
      status: 'pending',
      message: 'Crawl started successfully'
    });
  } catch (error) {
    console.error('Crawl start error:', error);
    res.status(500).json({ 
      error: 'Failed to start crawl',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/status/{id} - Get crawl status
router.get('/status/:id', (req, res) => {
  try {
    const { id } = req.params;
    const status = gifService.getCrawlStatus(id);
    
    if (!status) {
      return res.status(404).json({ 
        error: 'Crawl not found' 
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/gif/{id} - Download generated GIF
router.get('/gif/:id', (req, res) => {
  try {
    const { id } = req.params;
    const gifPath = gifService.getGifPath(id);
    
    if (!gifPath || !existsSync(gifPath)) {
      return res.status(404).json({ 
        error: 'GIF not found or not ready' 
      });
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="crawl_${id}.gif"`);
    res.sendFile(gifPath);
  } catch (error) {
    console.error('GIF download error:', error);
    res.status(500).json({ 
      error: 'Failed to download GIF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/loading-gif/{id} - Download loading GIF
router.get('/loading-gif/:id', (req, res) => {
  try {
    const { id } = req.params;
    const loadingPath = gifService.getLoadingGifPath(id);
    
    if (!loadingPath || !existsSync(loadingPath)) {
      return res.status(404).json({ 
        error: 'Loading GIF not found' 
      });
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="loading_${id}.gif"`);
    res.sendFile(loadingPath);
  } catch (error) {
    console.error('Loading GIF download error:', error);
    res.status(500).json({ 
      error: 'Failed to download loading GIF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/elements - Get page elements for analysis
router.post('/elements', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required and must be a string' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }

    const elements = await gifService.getPageElements(url);
    
    res.json({
      elements,
      url,
      count: elements.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Elements extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract page elements',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/cache/stats - Get cache statistics
router.get('/cache/stats', (req, res) => {
  try {
    const { gifGenerator } = require('../services/gifGenerator');
    
    const cacheStats = gifGenerator.getCacheStats();
    
    res.json({
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/cache/clear - Clear cache
router.post('/cache/clear', (req, res) => {
  try {
    const { gifGenerator } = require('../services/gifGenerator');
    gifGenerator.clearCache();
    
    res.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'GIF Crawl Service',
    timestamp: new Date().toISOString()
  });
});

export { router as gifCrawlRouter };
