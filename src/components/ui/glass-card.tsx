import * as React from "react";
import { Instagram, Twitter, Github, ChevronDown, Send, Search } from "lucide-react";
const spiderImage = "https://automationalien.s3.us-east-1.amazonaws.com/notextwhite.png";

const ULogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 29.667 31.69"
    {...props}
  >
    <path d="M12.827,1.628A1.561,1.561,0,0,1,14.31,0h2.964a1.561,1.561,0,0,1,1.483,1.628v11.9a9.252,9.252,0,0,1-2.432,6.852q-2.432,2.409-6.963,2.409T2.4,20.452Q0,18.094,0,13.669V1.628A1.561,1.561,0,0,1,1.483,0h2.98A1.561,1.561,0,0,1,5.947,1.628V13.191a5.635,5.635,0,0,0,.85,3.451,3.153,3.153,0,0,0,2.632,1.094,3.032,3.032,0,0,0,2.582-1.076,5.836,5.836,0,0,0,.816-3.486Z" />
    <path d="M75.207,20.857a1.561,1.561,0,0,1-1.483,1.628h-2.98a1.561,1.561,0,0,1-1.483-1.628V1.628A1.561,1.561,0,0,1,70.743,0h2.98a1.561,1.561,0,0,1,1.483,1.628Z" transform="translate(-45.91 0)" />
    <path d="M0,80.018A1.561,1.561,0,0,1,1.483,78.39h26.7a1.561,1.561,0,0,1,1.483,1.628v2.006a1.561,1.561,0,0,1-1.483,1.628H1.483A1.561,1.561,0,0,1,0,82.025Z" transform="translate(0 -51.963)" />
  </svg>
);

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSendMessage?: (message: string) => void;
  messages?: Message[];
  isLoading?: boolean;
  onFileUpload?: (file: File) => void;
  onSearchClick?: () => void;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, onSendMessage, messages = [], isLoading = false, onFileUpload, onSearchClick, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
      if (inputValue.trim() && onSendMessage) {
        onSendMessage(inputValue.trim());
        setInputValue('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onFileUpload) {
        onFileUpload(file);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file && onFileUpload) {
        onFileUpload(file);
      }
    };
    return (
      <div
        ref={ref}
        className={`group h-full w-full [perspective:1000px] ${className}`}
        {...props}
      >
        <div className="relative h-full rounded-[50px] bg-gradient-to-br from-zinc-900 to-black shadow-2xl transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[box-shadow:rgba(0,0,0,0.3)_30px_50px_25px_-40px,rgba(0,0,0,0.1)_0px_25px_30px_0px] group-hover:[transform:rotate3d(1,1,0,30deg)]">
          <div className="absolute inset-2 rounded-[55px] border-b border-l border-white/20 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm [transform-style:preserve-3d] [transform:translate3d(0,0,25px)]"></div>
          <div className="absolute [transform:translate3d(0,0,26px)] h-full w-full flex flex-col">
            {/* Header */}
            <div className="px-7 pt-6 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="drag-handle cursor-move flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">
                      Tooltip Companion
                    </span>
                    <button
                      onClick={onSearchClick}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Search"
                    >
                      <Search className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Advanced scraping with Playwright
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 px-7 py-2 overflow-y-auto space-y-3 relative z-10">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-100 ml-6 border border-blue-400/20'
                      : 'bg-gradient-to-r from-white/10 to-white/5 text-white mr-6 border border-white/10'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      message.type === 'user' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <span className="font-medium">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span>•</span>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-white mr-6 border border-white/10 animate-pulse">
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="font-medium">AI Assistant</span>
                    <span>•</span>
                    <span>Thinking...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="px-7 pb-6 relative z-10">
              <div 
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:border-white/30 transition-colors relative z-20"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="text" 
                  placeholder="Fresh crawl - Enter URL or drag & drop a file..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-300 border-none outline-none relative z-30 text-left"
                  style={{ textAlign: 'left' }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.md,.json,.csv"
              />
              
              {/* Quick actions */}
              <div className="mt-2 flex gap-2 text-xs text-zinc-400">
                <span>Press Enter to crawl</span>
                <span>•</span>
                <span>Drag files to upload</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 [transform-style:preserve-3d]">
            {[
              { size: "170px", pos: "8px", z: "20px", delay: "0s" },
              { size: "140px", pos: "10px", z: "40px", delay: "0.4s" },
              { size: "110px", pos: "17px", z: "60px", delay: "0.8s" },
              { size: "80px", pos: "23px", z: "80px", delay: "1.2s" },
            ].map((circle, index) => (
              <div
                key={index}
                className="absolute aspect-square rounded-full bg-white/10 shadow-[rgba(100,100,111,0.2)_-10px_10px_20px_0px] transition-all duration-500 ease-in-out"
                style={{
                  width: circle.size,
                  top: circle.pos,
                  right: circle.pos,
                  transform: `translate3d(0, 0, ${circle.z})`,
                  transitionDelay: circle.delay,
                }}
              ></div>
            ))}
            <div
              className="absolute transition-all duration-500 ease-in-out [transform:translate3d(0,0,100px)] [transition-delay:1.6s] group-hover:[transform:translate3d(0,0,120px)]"
              style={{ top: "20px", right: "20px" }}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <img src={spiderImage} alt="Spider" className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;