# AWS Amplify Deployment Guide

This project is configured for deployment on AWS Amplify with both frontend and backend services.

## Project Structure

```
├── src/                    # React frontend source
├── backend/               # Node.js backend source
├── dist/                  # Build output (created during build)
├── amplify.yml           # Amplify build configuration
├── build.ps1             # PowerShell build script
├── build.sh              # Bash build script (Linux/Mac)
└── dist/server.js        # Combined server entry point
```

## Build Process

The build process combines both frontend and backend:

1. **Frontend Build**: React app built with Vite
2. **Backend Build**: TypeScript compiled to JavaScript
3. **Combined Server**: Express server serves both static files and API routes

## Amplify Configuration

The `amplify.yml` file configures the build process:

- **Pre-build**: Installs all dependencies
- **Build**: Runs the combined build script
- **Post-build**: Prepares artifacts for deployment

## Environment Variables

Set these in your Amplify console:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

## API Endpoints

Once deployed, the following endpoints will be available:

- `GET /` - React frontend
- `GET /api/health` - Health check
- `POST /api/chat` - AI chat endpoint
- `POST /api/crawl` - Web crawling endpoint
- `POST /api/gif-crawl` - GIF generation endpoint
- `POST /api/scan` - Page scanning endpoint

## Local Development

```bash
# Install dependencies
npm ci
cd backend && npm ci && cd ..

# Start development servers
npm run dev          # Frontend (port 3000)
cd backend && npm run dev  # Backend (port 3001)
```

## Production Build

```bash
# Build for production
npm run build:amplify

# Start production server
npm start
```

## Troubleshooting

1. **Build fails**: Check that all dependencies are installed
2. **API not working**: Verify backend compiled successfully
3. **Static files not serving**: Check that frontend build completed
4. **Environment variables**: Ensure all required env vars are set in Amplify

## GitHub Integration

This project is configured to automatically deploy when changes are pushed to the main branch. The build process will:

1. Install dependencies
2. Build frontend and backend
3. Create combined server
4. Deploy to AWS Amplify
