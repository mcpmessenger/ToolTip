import express from 'express';
import { proactiveScrapingService } from '../services/proactiveScrapingService';
import { existsSync } from 'fs';
import { join } from 'path';

const router = express.Router();

// POST /api/proactive-scrape - Start proactive scraping of a page
router.post('/', async (req, res) => {
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

    console.log(`Starting proactive scrape for: ${url}`);
    const result = await proactiveScrapingService.scrapePageProactively(url);
    
    res.json({
      success: true,
      data: result,
      message: `Proactive scraping completed. Found ${result.totalElements} elements, generated ${result.successfulPreviews} previews.`
    });
  } catch (error) {
    console.error('Proactive scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to perform proactive scraping',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/proactive-scrape/:url - Get cached proactive scrape results
router.get('/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const decodedUrl = decodeURIComponent(url);
    
    const result = proactiveScrapingService.getCachedResult(decodedUrl);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'No cached results found for this URL',
        message: 'Run proactive scraping first to generate previews'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get cached results error:', error);
    res.status(500).json({ 
      error: 'Failed to get cached results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/element-preview/:id - Get element preview image
router.get('/element-preview/:id', (req, res) => {
  try {
    const { id } = req.params;
    const previewPath = proactiveScrapingService.getElementPreview(id);
    
    if (!previewPath || !existsSync(previewPath)) {
      return res.status(404).json({ 
        error: 'Element preview not found' 
      });
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `inline; filename="preview_${id}.gif"`);
    res.sendFile(previewPath);
  } catch (error) {
    console.error('Element preview error:', error);
    res.status(500).json({ 
      error: 'Failed to get element preview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/proactive-scrape/cache - Clear proactive scraping cache
router.delete('/cache', (req, res) => {
  try {
    proactiveScrapingService.clearCache();
    
    res.json({
      success: true,
      message: 'Proactive scraping cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/proactive-scrape/stats - Get proactive scraping statistics
router.get('/stats', (req, res) => {
  try {
    // This would need to be implemented in the service
    res.json({
      success: true,
      data: {
        cachedUrls: 0, // Would need to track this
        totalPreviews: 0, // Would need to track this
        cacheSize: '0 MB' // Would need to calculate this
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as proactiveScrapingRouter };
