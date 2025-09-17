# ToolTip Companion

A beautiful 3D glass card interface with AI-powered chat functionality and intelligent web crawling capabilities.

![ToolTip Companion](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan)

## ✨ Features

- **3D Glass Card Interface** - Stunning 3D hover effects with glass morphism design
- **AI-Powered Chat** - Intelligent conversations with OpenAI integration
- **Web Crawling** - Smart web crawling with mock API (ready for backend integration)
- **Real-time Data Storage** - Supabase integration for persistent data
- **Responsive Design** - Works seamlessly across all devices
- **Modern UI/UX** - Built with Shadcn UI and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mcpmessenger/ToolTip.git
   cd ToolTip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **Frontend (.env in root directory):**
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_API_BASE_URL=http://localhost:3001
   ```
   
   **Backend (backend/.env):**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8082
   ```

4. **Start both servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8082` (or the port shown in terminal)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **AI**: OpenAI GPT API (real implementation)
- **Web Crawling**: Playwright backend integration
- **Database**: Supabase (real implementation)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   └── ui/
│       ├── glass-card.tsx      # Main 3D glass card component
│       └── ...                 # Other UI components
├── lib/
│   ├── openai.ts              # OpenAI API configuration
│   ├── supabase.ts            # Supabase client
│   ├── crawler.ts             # Web crawling logic
│   └── utils.ts               # Utility functions
├── pages/
│   └── Index.tsx              # Main page component
└── assets/
    └── spider.png             # Spider logo
```

## 🎨 Components

### GlassCard Component

The main component featuring:
- 3D hover animations
- Integrated chat interface
- Message history display
- Input handling with keyboard shortcuts

```tsx
<GlassCard 
  onSendMessage={handleSendMessage}
  messages={messages}
  isLoading={isLoading}
/>
```

## 🔧 Configuration

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### Supabase Setup (Optional)

1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and anon key
3. Add them to your `.env` file

### Playwright Setup

Playwright is automatically configured for web crawling. The crawler supports:
- Search query processing
- Multi-page crawling
- Content extraction and analysis
- Data storage and retrieval

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify

1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Deploy automatically on push to main

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [OpenAI](https://openai.com/) for AI capabilities
- [Playwright](https://playwright.dev/) for web automation
- [Supabase](https://supabase.com/) for backend services

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

Made with ❤️ by [mcpmessenger](https://github.com/mcpmessenger)