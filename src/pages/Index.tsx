import { useState } from "react";
import GlassCard, { Message } from "@/components/ui/glass-card";
import SettingsPanel from "@/components/SettingsPanel";
import SearchPanel from "@/components/SearchPanel";
import Dashboard from "@/components/Dashboard";
import HelpPanel from "@/components/HelpPanel";
import NotificationContainer from "@/components/NotificationContainer";
import { useNotifications } from "@/hooks/useNotifications";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Instagram, Twitter, Github, ChevronDown } from "lucide-react";
import { crawlWeb } from "@/api/crawler";
import { chatWithAI } from "@/api/chat";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I can help you browse the web intelligently. Ask me to search for information, crawl specific websites, or upload files for analysis.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  const handleSendMessage = async (message: string) => {
    console.log('Message received:', message);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if message contains search/crawl intent
      const isSearchQuery = message.toLowerCase().includes('search') || 
                           message.toLowerCase().includes('find') || 
                           message.toLowerCase().includes('crawl') ||
                           message.toLowerCase().includes('web');

      if (isSearchQuery) {
        // Use web crawler API for search queries
        const results = await crawlWeb(message, 2);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `I found ${results.length} results for "${message}":\n\n${results.map(r => `• ${r.title}\n  ${r.url}\n  ${r.summary || 'No summary available'}`).join('\n\n')}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Use AI chat API for regular messages
        const response = await chatWithAI(message);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        showSuccess("Message sent", "AI response received successfully");
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error processing your message. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      showError("Error", "Failed to process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name);
    
    // Add user message about file upload
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `📎 Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I've received your file "${file.name}". I can analyze text files, PDFs, and other documents. What would you like me to do with this file?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      showSuccess("File uploaded", `Successfully processed ${file.name}`);
    } catch (error) {
      console.error('Error processing file:', error);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error processing your file. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      showError("File Error", "Failed to process your file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked!");
    setShowSettings(!showSettings);
    showInfo("Settings", "Opening settings panel");
  };

  const handleSearchClick = () => {
    console.log("Search button clicked!");
    setShowSearch(!showSearch);
    showInfo("Search", "Opening advanced search");
  };

  const handleDashboardClick = () => {
    console.log("Dashboard button clicked!");
    setShowDashboard(!showDashboard);
    showInfo("Dashboard", "Opening analytics dashboard");
  };

  const handleHelpClick = () => {
    console.log("Help button clicked!");
    setShowHelp(!showHelp);
    showInfo("Help", "Opening help panel");
  };

  const handleAdvancedSearch = (query: string, type: string) => {
    const searchMessage = `Search ${type}: ${query}`;
    handleSendMessage(searchMessage);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '/',
      ctrlKey: true,
      action: () => setShowHelp(!showHelp),
      description: 'Open help panel'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => setShowSearch(!showSearch),
      description: 'Open search panel'
    },
    {
      key: ',',
      ctrlKey: true,
      action: () => setShowSettings(!showSettings),
      description: 'Open settings'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => setShowDashboard(!showDashboard),
      description: 'Open dashboard'
    },
    {
      key: 'Escape',
      action: () => {
        setShowHelp(false);
        setShowSearch(false);
        setShowSettings(false);
        setShowDashboard(false);
      },
      description: 'Close all panels'
    }
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4">
      <div className="relative">
        <GlassCard 
          onSendMessage={handleSendMessage} 
          messages={messages}
          isLoading={isLoading}
          onFileUpload={handleFileUpload}
          onSettingsClick={handleSettingsClick}
          onSearchClick={handleSearchClick}
          onDashboardClick={handleDashboardClick}
          onHelpClick={handleHelpClick}
        />
        
        {/* Settings Panel */}
        <SettingsPanel 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
        
        {/* Search Panel */}
        <SearchPanel 
          isOpen={showSearch} 
          onClose={() => setShowSearch(false)}
          onSearch={handleAdvancedSearch}
        />
        
        {/* Dashboard */}
        <Dashboard 
          messages={messages}
          isOpen={showDashboard} 
          onClose={() => setShowDashboard(false)}
        />
        
        {/* Help Panel */}
        <HelpPanel 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)}
        />
        
        {/* Notification Container */}
        <NotificationContainer 
          notifications={notifications}
          onRemove={removeNotification}
        />
        
        {/* Navigation and Social buttons below the glass card */}
        <div className="flex flex-col items-center gap-4 mt-6">
          {/* Dashboard Navigation */}
          <a 
            href="/dashboard" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          >
            🚀 Open Tooltip Library Dashboard
          </a>
          <p className="text-slate-400 text-sm text-center max-w-md">
            Manage API keys, configure settings, and monitor your tooltip library usage
          </p>
          
          <div className="flex gap-3">
            {[
              { icon: Instagram, delay: "400ms" },
              { icon: Twitter, delay: "600ms" },
              { icon: Github, delay: "800ms" },
            ].map(({ icon: Icon, delay }, index) => (
              <button
                key={index}
                className="group/social grid h-[40px] w-[40px] place-content-center rounded-full border-none bg-white/90 dark:bg-zinc-800/90 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-110 hover:bg-black hover:text-white active:bg-yellow-400"
                style={{ transitionDelay: delay }}
              >
                <Icon className="h-5 w-5 stroke-current transition-colors" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button className="text-sm font-bold text-foreground hover:text-blue-600 transition-colors">
              View more
            </button>
            <ChevronDown className="h-4 w-4 stroke-current" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
