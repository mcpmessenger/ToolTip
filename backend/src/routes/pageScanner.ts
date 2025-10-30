import { Router } from 'express';
import { pageScanner } from '../services/pageScanner';

const router = Router();

// Scan a page for all clickable elements
router.post('/api/scan-page', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid URL to scan'
      });
    }

    console.log(`Starting page scan for: ${url}`);
    
    // Start the scan (this will cache results automatically)
    const scanResult = await pageScanner.scanPage(url);
    
    res.json({
      success: true,
      data: scanResult,
      message: `Found ${scanResult.totalElements} clickable elements`
    });

  } catch (error) {
    console.error('Page scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get cached scan results
router.get('/api/scan-results/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const decodedUrl = decodeURIComponent(url);
    
    const scanResult = await pageScanner.getScanResult(decodedUrl);
    
    if (!scanResult) {
      return res.status(404).json({ 
        error: 'No scan results found',
        message: 'No cached results found for this URL. Please scan the page first.'
      });
    }

    res.json({
      success: true,
      data: scanResult
    });

  } catch (error) {
    console.error('Get scan results error:', error);
    res.status(500).json({ 
      error: 'Failed to get scan results',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get scan status and cache stats
router.get('/api/scan-stats', async (req, res) => {
  try {
    const cacheStats = pageScanner.getCacheStats();
    
    res.json({
      success: true,
      data: {
        cache: cacheStats,
        scanner: {
          status: 'active',
          uptime: process.uptime()
        }
      }
    });

  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get scan stats',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Clear scan cache
router.delete('/api/scan-cache', async (req, res) => {
  try {
    await pageScanner.clearCache();
    
    res.json({
      success: true,
      message: 'Scan cache cleared successfully'
    });

  } catch (error) {
    console.error('Clear scan cache error:', error);
    res.status(500).json({ 
      error: 'Failed to clear scan cache',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get element preview by ID
router.get('/api/element-preview/:previewId', async (req, res) => {
  try {
    const { previewId } = req.params;
    
    // This will be handled by the existing GIF service
    // The previewId should correspond to a GIF filename
    const { gifGenerator } = await import('../services/gifGenerator');
    const gifBuffer = await gifGenerator.getGif(previewId);
    
    if (!gifBuffer) {
      return res.status(404).json({ 
        error: 'Preview not found',
        message: 'No preview found for this element'
      });
    }

    // Set proper headers for GIF
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the GIF buffer directly
    res.send(gifBuffer);

  } catch (error) {
    console.error('Get element preview error:', error);
    res.status(500).json({ 
      error: 'Failed to get element preview',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Health check for scanner service
router.get('/api/scanner-health', async (req, res) => {
  try {
    const cacheStats = pageScanner.getCacheStats();
    
    res.json({
      success: true,
      status: 'healthy',
      data: {
        scanner: 'active',
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scanner health check error:', error);
    res.status(500).json({ 
      error: 'Scanner unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export { router as pageScannerRouter };
