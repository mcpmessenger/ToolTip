# 🚀 ToolTip Backend Setup Guide

Complete guide to set up the real backend services with Playwright web crawling and OpenAI integration.

## 📋 Prerequisites

- Node.js 18+
- OpenAI API key
- Supabase account (optional but recommended)

## 🛠️ Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Supabase Configuration (OPTIONAL)
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# CORS Configuration
FRONTEND_URL=http://localhost:8082
```

### 3. Set Up Database (Optional)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL from `backend/supabase-schema.sql`
4. Copy your project URL and anon key to `.env`

### 4. Start the Backend

```bash
npm run dev
```

The backend will start on `http://localhost:3001`

## 🎨 Frontend Setup

The frontend is already configured to use the backend APIs. Just make sure it's running:

```bash
# In the root directory
npm run dev
```

The frontend will start on `http://localhost:8082`

## 🚀 Quick Start Scripts

### Windows (PowerShell)
```powershell
.\start-dev.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🧪 Testing the Setup

### 1. Test Backend Health
Visit `http://localhost:3001/health` - should return:
```json
{
  "status": "OK",
  "timestamp": "2025-01-17T...",
  "service": "ToolTip Backend API"
}
```

### 2. Test Chat API
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### 3. Test Crawl API
```bash
curl -X POST http://localhost:3001/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"query": "react tutorials", "numPages": 2}'
```

### 4. Test Frontend Integration
1. Open `http://localhost:8082`
2. Type "search for react tutorials" in the chat
3. Watch real web crawling happen!
4. Type regular messages for AI chat

## 🔧 Configuration Options

### Backend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 3001 | No |
| `NODE_ENV` | Environment mode | development | No |
| `OPENAI_API_KEY` | OpenAI API key | - | **Yes** |
| `SUPABASE_URL` | Supabase project URL | - | No |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8082 | No |

### Frontend Configuration

The frontend automatically connects to `http://localhost:3001` for the backend API.

## 🐛 Troubleshooting

### Backend Won't Start
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`
- Check environment variables are set correctly

### OpenAI API Errors
- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure the key has the right permissions

### Web Crawling Issues
- Playwright browsers are installed automatically
- Check your internet connection
- Some sites may block automated requests

### Frontend Can't Connect to Backend
- Ensure backend is running on port 3001
- Check CORS configuration in backend
- Verify frontend is running on port 8082

## 📊 What's Working Now

✅ **Real Web Crawling** - Playwright crawls actual websites  
✅ **AI Chat** - OpenAI GPT-3.5-turbo integration  
✅ **Database Storage** - Supabase for data persistence  
✅ **Error Handling** - Graceful fallbacks when services are unavailable  
✅ **API Endpoints** - RESTful API for frontend integration  
✅ **Development Scripts** - Easy startup for both services  

## 🚀 Next Steps

1. **Set up your OpenAI API key** in the backend `.env` file
2. **Start both services** using the quick start scripts
3. **Test the integration** by trying web searches and chat
4. **Set up Supabase** for data persistence (optional)
5. **Deploy to production** when ready!

## 📝 API Documentation

### Chat Endpoint
- **POST** `/api/chat`
- **Body**: `{"message": "your message"}`
- **Response**: `{"response": "AI response", "timestamp": "...", "usage": {...}}`

### Crawl Endpoint
- **POST** `/api/crawl`
- **Body**: `{"query": "search term", "numPages": 2}`
- **Response**: `{"results": [...], "query": "...", "numPages": 2, "timestamp": "..."}`

### Health Check
- **GET** `/health`
- **Response**: `{"status": "OK", "timestamp": "...", "service": "..."}`

---

🎉 **You're all set!** The ToolTip Companion now has a fully functional backend with real web crawling and AI capabilities!
