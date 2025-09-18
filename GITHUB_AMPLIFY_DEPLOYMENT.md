# GitHub + AWS Amplify Deployment Guide

## 🚀 Deploy Your Full-Stack App to AWS Amplify

Your project is now configured for GitHub + Amplify deployment, which will handle both frontend and backend automatically!

### ✅ What's Ready

- ✅ **Amplify Configuration**: `amplify.yml` - Build configuration
- ✅ **GitHub Build Script**: `build-amplify.sh` - Handles both frontend and backend
- ✅ **Server Entry Point**: `dist/server.js` - Combined server with fallbacks
- ✅ **Backend Integration**: Backend routes will be included if available

### 🔧 Prerequisites

1. **GitHub Repository**: Your code is already in `mcpmessenger/ToolTip`
2. **AWS Amplify Access**: You have AWS CLI configured
3. **Node.js 18+**: Amplify will use this runtime

### 🚀 Deployment Steps

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Amplify deployment configuration"
git push origin main
```

#### Step 2: Connect to AWS Amplify

1. **Go to**: [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **Click**: "New app" → "Host web app"
3. **Connect to GitHub**: Select `mcpmessenger/ToolTip`
4. **Select branch**: `main`
5. **Amplify will auto-detect**: The `amplify.yml` configuration

#### Step 3: Configure Environment Variables

In the Amplify console, add these environment variables:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

#### Step 4: Deploy

- Amplify will automatically build and deploy
- The build process will:
  - Install frontend and backend dependencies
  - Build both frontend and backend
  - Create a combined server
  - Deploy to AWS

### 🔄 How It Works

1. **Frontend**: React app built with Vite
2. **Backend**: Node.js/Express API (if available)
3. **Combined Server**: Express serves both static files and API routes
4. **Fallback**: If backend fails to load, uses mock responses

### 📊 Build Process

The `build-amplify.sh` script will:
- ✅ Install all dependencies
- ✅ Build frontend (React)
- ✅ Build backend (TypeScript)
- ✅ Create combined server
- ✅ Package everything for deployment

### 🌐 After Deployment

Your app will be available at:
- **Frontend**: `https://your-app-id.amplifyapp.com`
- **API**: `https://your-app-id.amplifyapp.com/api`
- **Health Check**: `https://your-app-id.amplifyapp.com/api/health`

### 🔧 Features Available

- ✅ **Frontend**: Full React app with all components
- ✅ **Backend**: All API routes (chat, crawl, gif-crawl, scan)
- ✅ **Web Scraping**: Playwright-based crawling
- ✅ **AI Chat**: OpenAI integration
- ✅ **GIF Generation**: Dynamic GIF creation
- ✅ **Page Scanning**: Element detection and preview

### 🛠️ Troubleshooting

If deployment fails:
1. **Check build logs** in Amplify console
2. **Verify environment variables** are set
3. **Check GitHub repository** is accessible
4. **Ensure Node.js version** is 18+

### 📈 Benefits

- ✅ **Serverless**: Auto-scaling and cost-effective
- ✅ **Full-Stack**: Both frontend and backend in one deployment
- ✅ **Easy Updates**: Just push to GitHub
- ✅ **AWS Integration**: Works with your existing AWS setup
- ✅ **No IAM Issues**: Amplify handles permissions

### 🎯 Next Steps

1. **Push to GitHub**: `git push origin main`
2. **Connect to Amplify**: Follow the steps above
3. **Set Environment Variables**: Add your API keys
4. **Deploy**: Amplify will handle the rest!

Your full-stack app will be live and ready to use! 🚀
