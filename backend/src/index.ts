import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { crawlRouter } from './routes/crawl';
import { gifCrawlRouter } from './routes/gifCrawl';
import { pageScannerRouter } from './routes/pageScanner';
import screenshotRouter from './routes/screenshot';
import elementAnalysisRouter from './routes/elementAnalysis';
import simpleScannerRouter from './routes/simpleScanner';
import simpleAfterCaptureRouter from './routes/simpleAfterCapture';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/crawl', crawlRouter);
app.use('/api', gifCrawlRouter);
// app.use('/api/proactive-scrape', proactiveScrapingRouter); // DISABLED - using simpleAfterCapture instead
// app.use('/api/gif-preview', gifPreviewRouter); // DISABLED - using simpleAfterCapture instead
app.use('/api/analyze-element', elementAnalysisRouter);
app.use('/api/simple-scanner', simpleScannerRouter);
app.use('/api/after-capture', simpleAfterCaptureRouter);
app.use('/', pageScannerRouter);
app.use('/', screenshotRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ToolTip Backend API'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 ToolTip Backend API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8082'}`);
});
