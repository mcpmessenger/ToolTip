import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { crawlRouter } from './routes/crawl';
import { gifCrawlRouter } from './routes/gifCrawl';
import { pageScannerRouter } from './routes/pageScanner';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/crawl', crawlRouter);
app.use('/api/gif-crawl', gifCrawlRouter);
app.use('/api/scan', pageScannerRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'tooltip-backend-lambda'
  });
});

// Lambda handler
export const handler = serverless(app);
