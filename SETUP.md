# Smart Web Crawler Setup Guide

This application is a smart chat web crawler that uses OpenAI, Playwright, and Supabase to provide users with a rich browsing experience.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase-schema.sql`
4. Go to Settings > API to get your project URL and anon key

### 4. Set up OpenAI

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Make sure you have credits in your OpenAI account

### 5. Environment Variables

**Frontend (.env in root directory):**
```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Application Configuration
VITE_APP_NAME=Smart Web Crawler
```

**Backend (backend/.env):**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration (REQUIRED)
# IMPORTANT: Put your API key on a single line without line breaks
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (OPTIONAL)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:8082
```

### 6. Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
npm run dev
```

The application will be available at `http://localhost:8082`

## Features

- **Smart Web Crawling**: Uses Playwright to crawl web pages and extract content
- **AI-Powered Analysis**: Uses OpenAI to analyze and summarize web content
- **Intelligent Chat**: Chat interface that can answer questions based on crawled content
- **Data Persistence**: Stores crawled pages and chat history in Supabase
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Usage

1. Open the application in your browser
2. Type a question or search query in the chat interface
3. The AI will search the web, crawl relevant pages, and provide intelligent responses
4. All crawled content is stored for future reference

## Database Schema

The application uses three main tables:

- `crawled_pages`: Stores web page content and metadata
- `chat_messages`: Stores chat conversation history
- `crawl_sessions`: Tracks crawling sessions and their status

## Troubleshooting

### Common Issues

1. **Playwright browser not found**: Run `npx playwright install`
2. **OpenAI API errors**: Check your API key and account credits
3. **Supabase connection issues**: Verify your URL and anon key
4. **CORS errors**: Make sure your Supabase project allows browser requests

### Browser Compatibility

The application works best with modern browsers that support:
- ES6+ features
- Web Workers (for Playwright)
- Fetch API

## Security Notes

- The OpenAI API key is exposed to the browser (this is normal for client-side apps)
- Consider implementing rate limiting for production use
- The Supabase anon key has limited permissions as defined in the RLS policies

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
