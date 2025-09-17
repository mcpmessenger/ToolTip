# ToolTip Backend API

Backend service for ToolTip Companion with real web crawling and AI chat capabilities.

## 🚀 Features

- **Real Web Crawling** - Uses Playwright to crawl actual websites
- **AI Chat** - OpenAI GPT integration for intelligent responses
- **Database Storage** - Supabase integration for data persistence
- **RESTful API** - Clean API endpoints for frontend integration
- **Error Handling** - Robust error handling and fallbacks

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Web Crawling**: Playwright
- **AI**: OpenAI GPT-3.5-turbo
- **Database**: Supabase
- **Development**: Nodemon, ts-node

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase configuration
│   ├── routes/
│   │   ├── chat.ts              # Chat API routes
│   │   └── crawl.ts             # Web crawling API routes
│   ├── services/
│   │   ├── chatService.ts       # OpenAI chat service
│   │   └── crawlService.ts      # Playwright crawling service
│   └── index.ts                 # Main server file
├── supabase-schema.sql          # Database schema
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key
- Supabase account (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   PORT=3001
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   FRONTEND_URL=http://localhost:8082
   ```

3. **Set up database (optional)**
   - Create a Supabase project
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL editor

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Chat API
- **POST** `/api/chat` - Send a message to AI
  ```json
  {
    "message": "Hello, how are you?"
  }
  ```

### Crawl API
- **POST** `/api/crawl` - Crawl web pages
  ```json
  {
    "query": "react tutorials",
    "numPages": 2
  }
  ```
- **GET** `/api/crawl/health` - Crawl service health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `SUPABASE_URL` | Supabase project URL | No |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

### Database Schema

The backend uses two main tables:

1. **crawled_pages** - Stores web crawling results
2. **chat_messages** - Stores chat conversation history

See `supabase-schema.sql` for the complete schema.

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

Make sure to set all required environment variables in your production environment.

## 🤝 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Adding New Features

1. Create new services in `src/services/`
2. Add routes in `src/routes/`
3. Update the main server in `src/index.ts`

## 📝 License

MIT License - see the main project README for details.
