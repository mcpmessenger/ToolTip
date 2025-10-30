import express from 'express';
import playwrightScreenshotService from '../services/playwrightScreenshotService';

const router = express.Router();

// Take screenshot of element after click
router.post('/api/screenshot/after', async (req, res) => {
  try {
    const { url, selector, coordinates, waitTime, width, height } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await playwrightScreenshotService.takeAfterScreenshot({
      url,
      selector,
      coordinates,
      waitTime: waitTime || 2000,
      width: width || 1200,
      height: height || 800
    });

    if (result.success && result.imageData) {
      res.json({
        success: true,
        imageData: result.imageData
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to take screenshot'
      });
    }
  } catch (error) {
    console.error('Screenshot API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Take regular screenshot
router.post('/api/screenshot', async (req, res) => {
  try {
    const { url, selector, coordinates, width, height } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await playwrightScreenshotService.takeScreenshot({
      url,
      selector,
      coordinates,
      width: width || 1200,
      height: height || 800
    });

    if (result.success && result.imageData) {
      res.json({
        success: true,
        imageData: result.imageData
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to take screenshot'
      });
    }
  } catch (error) {
    console.error('Screenshot API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
