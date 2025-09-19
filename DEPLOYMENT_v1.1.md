# 🚀 ToolTip Companion v1.1 - Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Unit tests passing
- [ ] Integration tests completed
- [ ] Performance benchmarks met

### **Documentation**
- [ ] README updated with v1.1 features
- [ ] API documentation complete
- [ ] Changelog finalized
- [ ] Deployment guide ready
- [ ] Troubleshooting guide updated

### **Dependencies**
- [ ] Frontend dependencies updated
- [ ] Backend dependencies updated
- [ ] Security vulnerabilities patched
- [ ] Version numbers incremented
- [ ] Lock files committed

## 🔧 **Amplify Configuration**

### **Build Settings (amplify.yml)**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing frontend dependencies..."
        - npm ci
        - echo "Installing backend dependencies..."
        - cd backend && npm ci
    build:
      commands:
        - echo "Building frontend..."
        - npm run build
        - echo "Building backend..."
        - cd backend && npm run build
        - echo "Copying backend to dist..."
        - cp -r backend/dist dist/backend
        - cp backend/package.json dist/backend/
        - cp -r backend/node_modules dist/backend/
    postBuild:
      commands:
        - echo "Build completed successfully"
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - backend/node_modules/**/*
```

### **Environment Variables**
```bash
# Frontend Environment Variables
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=https://your-api-domain.com

# Backend Environment Variables
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### **Build Commands**
```json
{
  "scripts": {
    "build": "vite build",
    "build:backend": "cd backend && npm run build",
    "build:all": "npm run build && npm run build:backend",
    "preview": "vite preview",
    "deploy": "npm run build:all && aws s3 sync dist/ s3://your-bucket-name"
  }
}
```

## 🌐 **GitHub Actions CI/CD**

### **Workflow File (.github/workflows/deploy.yml)**
```yaml
name: Deploy to AWS Amplify

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
      
      - name: Run tests
        run: |
          npm test
          cd backend && npm test
      
      - name: Run linting
        run: |
          npm run lint
          cd backend && npm run lint
      
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: cd backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
      
      - name: Build application
        run: |
          npm run build
          cd backend && npm run build
      
      - name: Deploy to Amplify
        uses: aws-actions/amplify-deploy@v1
        with:
          app-id: ${{ secrets.AMPLIFY_APP_ID }}
          branch: main
          artifact-path: dist
```

## 📦 **Package.json Updates**

### **Frontend Package.json**
```json
{
  "name": "tooltip-companion",
  "version": "1.1.0",
  "description": "Proactive scraping tooltip system for React",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@tanstack/react-query": "^5.0.0",
    "sonner": "^1.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0"
  }
}
```

### **Backend Package.json**
```json
{
  "name": "tooltip-companion-backend",
  "version": "1.1.0",
  "description": "Backend API for proactive scraping system",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "playwright": "^1.40.0",
    "openai": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "uuid": "^9.0.0",
    "node-cache": "^5.1.2",
    "canvas": "^2.11.0",
    "gifencoder": "^2.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/uuid": "^9.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

## 🔐 **Security Configuration**

### **CORS Settings**
```typescript
// backend/src/index.ts
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'https://your-frontend-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);
```

### **Security Headers**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📊 **Monitoring & Logging**

### **Health Check Endpoint**
```typescript
app.get('/health', (req, res) => {
  res.json({
    service: 'ToolTip Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    uptime: process.uptime()
  });
});
```

### **Error Logging**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🚀 **Deployment Steps**

### **1. Pre-Deployment**
```bash
# Update version numbers
npm version patch  # or minor/major

# Run tests
npm test
cd backend && npm test

# Build everything
npm run build
cd backend && npm run build

# Commit changes
git add .
git commit -m "Release v1.1.0 - Proactive Scraping System"
git tag v1.1.0
git push origin main --tags
```

### **2. Amplify Deployment**
```bash
# Deploy to Amplify
aws amplify start-deployment \
  --app-id your-app-id \
  --branch main \
  --source-url https://github.com/your-username/ToolTip.git
```

### **3. Post-Deployment**
```bash
# Verify deployment
curl https://your-api-domain.com/health

# Test proactive scraping
curl -X POST https://your-api-domain.com/api/proactive-scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-frontend-domain.com"}'

# Check frontend
open https://your-frontend-domain.com
```

## 🔍 **Post-Deployment Testing**

### **Automated Tests**
```bash
# Run smoke tests
npm run test:smoke

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### **Manual Testing Checklist**
- [ ] Frontend loads correctly
- [ ] Proactive mode toggle works
- [ ] Element detection works
- [ ] Preview generation works
- [ ] Caching works
- [ ] Error handling works
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 📈 **Performance Monitoring**

### **Key Metrics**
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 2 seconds
- **Preview Generation**: < 5 seconds
- **Cache Hit Rate**: > 90%
- **Error Rate**: < 1%

### **Monitoring Tools**
- **AWS CloudWatch**: Application metrics
- **Sentry**: Error tracking
- **Google Analytics**: User behavior
- **Lighthouse**: Performance scores

## 🚨 **Rollback Plan**

### **If Issues Arise**
1. **Immediate**: Disable proactive mode in frontend
2. **Short-term**: Rollback to v1.0 deployment
3. **Long-term**: Fix issues and redeploy

### **Rollback Commands**
```bash
# Rollback to previous version
aws amplify start-deployment \
  --app-id your-app-id \
  --branch main \
  --source-url https://github.com/your-username/ToolTip.git \
  --commit-id previous-commit-id
```

## 📞 **Support & Maintenance**

### **Monitoring Alerts**
- **High Error Rate**: > 5% errors
- **Slow Response Time**: > 10 seconds
- **Memory Usage**: > 80% of limit
- **Disk Space**: > 90% full

### **Maintenance Schedule**
- **Daily**: Check error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

---

**Deployment Version**: v1.1.0  
**Deployment Date**: September 19, 2025  
**Next Review**: October 19, 2025
