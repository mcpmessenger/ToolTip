# AWS Backend Deployment Guide

## 🚀 Deploy Your Backend to AWS Lambda

Your backend is now configured for AWS Lambda deployment using the Serverless Framework.

### ✅ What's Ready

- ✅ **Lambda Handler**: `lambda.ts` - Express app wrapped for Lambda
- ✅ **Serverless Config**: `serverless.yml` - AWS deployment configuration
- ✅ **Build Script**: `deploy-aws.ps1` - One-click deployment
- ✅ **Dependencies**: All packages installed and ready

### 🔧 Prerequisites

1. **AWS CLI Configured**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Key, and Region
   ```

2. **Serverless Framework** (auto-installed by script):
   ```bash
   npm install -g serverless
   ```

### 🚀 Quick Deploy

#### Option 1: One-Click Deploy (Windows)
```powershell
cd backend
.\deploy-aws.ps1
```

#### Option 2: Manual Deploy
```bash
cd backend
npm run build
serverless deploy
```

### 🔑 Environment Variables

Before deploying, set these in your AWS Lambda console or use the Serverless Framework:

1. **Go to AWS Lambda Console**
2. **Find your function**: `tooltip-backend-dev-api`
3. **Go to Configuration → Environment Variables**
4. **Add these variables**:

```
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

### 📊 After Deployment

1. **Get API Endpoint**: The deployment will show your API Gateway URL
2. **Update Frontend**: Update `src/api/crawler.ts` with your new API URL
3. **Test Endpoints**:
   - `GET /health` - Health check
   - `POST /api/chat` - AI chat
   - `POST /api/crawl` - Web crawling
   - `POST /api/gif-crawl` - GIF generation
   - `POST /api/scan` - Page scanning

### 🔄 Update Frontend

Once deployed, update your frontend API URL:

```typescript
// In src/api/crawler.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-gateway-url.amazonaws.com/dev'  // Your actual URL
  : 'http://localhost:3001';
```

### 🛠️ Troubleshooting

#### Common Issues:

1. **"Access Denied"**: Check AWS credentials and permissions
2. **"Function not found"**: Ensure you're in the correct AWS region
3. **"Timeout"**: Increase timeout in `serverless.yml` (currently 30s)
4. **"Memory exceeded"**: Increase memory in `serverless.yml` (currently 1024MB)

#### Debug Commands:

```bash
# Check AWS identity
aws sts get-caller-identity

# View Lambda logs
serverless logs -f api

# Test locally
serverless offline
```

### 📈 Monitoring

- **AWS CloudWatch**: View logs and metrics
- **AWS X-Ray**: Trace requests (if enabled)
- **Serverless Dashboard**: Monitor deployments

### 💰 Cost Optimization

- **Lambda**: Pay per request (very cheap for low traffic)
- **API Gateway**: Pay per request
- **CloudWatch**: Free tier includes 5GB logs/month

### 🔄 Redeployment

To update your backend:
```bash
cd backend
npm run build
serverless deploy
```

### 🎯 Next Steps

1. **Deploy Backend**: Run the deployment script
2. **Update Frontend**: Change API URL in frontend
3. **Test Integration**: Verify all features work
4. **Deploy Frontend**: Push to GitHub for Amplify deployment

Your backend will be serverless, auto-scaling, and cost-effective! 🚀
