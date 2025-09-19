import express from 'express';
import { SimpleAfterCapture } from '../services/simpleAfterCapture';

const router = express.Router();
const capturer = new SimpleAfterCapture();

// Proactive capture after screenshots for a page
router.post('/capture', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    console.log(`🚀 Starting proactive after capture for: ${url}`);
    console.log(`📝 Request body:`, req.body);
    
    const result = await capturer.capturePage(url);
    
    console.log(`🎉 Proactive capture completed!`);
    console.log(`📊 Success: ${result.success}, Elements found: ${result.totalElements}`);
    console.log(`✅ Successful captures: ${result.successfulResults}`);
    console.log(`❌ Failed captures: ${result.failedResults}`);
    
    res.json({
      success: result.success,
      data: result,
      error: result.error
    });

  } catch (error) {
    console.error('❌ Capture error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get capture status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    capturing: capturer['isCapturing'],
    timestamp: new Date().toISOString()
  });
});

// Clear stuck processing state
router.post('/clear', (req, res) => {
  try {
    capturer.clearProcessingState();
    res.json({
      success: true,
      message: 'Processing state cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear all cache and force fresh scan
router.post('/fresh-scan', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    console.log('🧹 Starting fresh scan for:', url);
    
    // Clear any existing processing state
    capturer.clearProcessingState();
    
    // Perform fresh capture
    const result = await capturer.capturePage(url);
    
    res.json({
      success: true,
      message: 'Fresh scan completed',
      data: result
    });
  } catch (error) {
    console.error('Fresh scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fresh scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
