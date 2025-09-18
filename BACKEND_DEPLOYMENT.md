# Backend Deployment Options

## 🎯 Recommended: AWS Lambda + API Gateway

**Best for**: Serverless, cost-effective, auto-scaling

### Option 1: AWS Lambda (Recommended)

#### Prerequisites
- AWS CLI installed and configured
- Serverless Framework installed: `npm install -g serverless`

#### Setup
1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   npm install --save-dev serverless-offline
   ```

2. **Create serverless.yml**:
   ```yaml
   service: tooltip-backend
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       NODE_ENV: production
       SUPABASE_URL: ${env:SUPABASE_URL}
       SUPABASE_ANON_KEY: ${env:SUPABASE_ANON_KEY}
       OPENAI_API_KEY: ${env:OPENAI_API_KEY}
   
   functions:
     api:
       handler: dist/index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
         - http:
             path: /
             method: ANY
             cors: true
   
   plugins:
     - serverless-offline
   ```

3. **Deploy**:
   ```bash
   cd backend
   serverless deploy
   ```

---

## 🚀 Alternative: Railway

**Best for**: Simple deployment, good for Node.js apps

### Option 2: Railway

1. **Go to**: [railway.app](https://railway.app)
2. **Connect GitHub**: Select your repository
3. **Set Root Directory**: `backend`
4. **Add Environment Variables**:
   - `NODE_ENV=production`
   - `SUPABASE_URL=your_url`
   - `SUPABASE_ANON_KEY=your_key`
   - `OPENAI_API_KEY=your_key`
5. **Deploy**: Railway auto-deploys on git push

---

## 🐳 Alternative: Docker + Any Cloud

**Best for**: Full control, works anywhere

### Option 3: Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --only=production
   
   # Copy built application
   COPY dist/ ./dist/
   
   # Expose port
   EXPOSE 3001
   
   # Start application
   CMD ["node", "dist/index.js"]
   ```

2. **Build and Deploy**:
   ```bash
   cd backend
   docker build -t tooltip-backend .
   docker run -p 3001:3001 tooltip-backend
   ```

---

## 🔧 Quick Setup: Railway (Easiest)

Let me create the Railway configuration for you:
