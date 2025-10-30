import express from 'express';
import { SimplePageScanner } from '../services/simplePageScanner';

const router = express.Router();
const scanner = new SimplePageScanner();

// Scan a page for clickable elements
router.post('/scan', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    console.log(`Starting scan for: ${url}`);
    console.log(`Request body:`, req.body);
    
    const result = await scanner.scanPage(url);
    
    console.log(`Scan completed. Success: ${result.success}, Elements found: ${result.totalElements}`);
    
    res.json({
      success: result.success,
      data: result,
      error: result.error
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scan status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    scanning: scanner['isScanning'],
    timestamp: new Date().toISOString()
  });
});

export default router;
