import { useState } from "react";
import GlassCard, { Message } from "@/components/ui/glass-card";
import { Instagram, Twitter, Github, ChevronDown } from "lucide-react";
import { crawlWeb } from "@/api/crawler";
import { chatWithAI } from "@/api/chat";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I can help you browse the web intelligently. Ask me to search for information or crawl specific websites.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4">
      <div className="relative">
        <GlassCard 
          onSendMessage={handleSendMessage} 
          messages={messages}
          isLoading={isLoading}
        />
        
        {/* Social buttons below the glass card */}
        <div className="flex justify-center gap-4 mt-6">
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
