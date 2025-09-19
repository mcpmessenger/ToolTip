import React, { useState } from 'react';
import { GlassCard } from './ui/glass-card';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Play, 
  Globe, 
  Settings, 
  Zap, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MousePointer,
  Image
} from 'lucide-react';

/**
 * Example component demonstrating the enhanced ToolTip Companion
 * with proactive scraping capabilities integrated into the existing GlassCard popup
 */
export const ToolTipCompanionExample: React.FC = () => {
  const [showCompanion, setShowCompanion] = useState(true);
  const [useProactiveMode, setUseProactiveMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai' as const,
      content: '🎯 Welcome to the enhanced ToolTip Companion! I now have proactive scraping capabilities built right into this popup. Toggle proactive mode and watch me automatically detect and preview all clickable elements on this page.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: `I understand you said: "${message}". The proactive scraping system is ${useProactiveMode ? 'enabled' : 'disabled'}. Try toggling proactive mode to see the difference!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (file: File) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai' as const,
      content: `📁 File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🎯 Enhanced ToolTip Companion
          </h1>
          <p className="text-xl text-white/80">
            Proactive scraping capabilities built into the existing popup interface
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Proactive Scraping
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Globe className="w-3 h-3 mr-1" />
              Universal Element Detection
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              <Image className="w-3 h-3 mr-1" />
              Real-time Previews
            </Badge>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Proactive Mode
              </CardTitle>
              <CardDescription className="text-white/70">
                Automatically detects and scrapes all clickable elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Status</span>
                  <Badge variant={useProactiveMode ? "default" : "secondary"}>
                    {useProactiveMode ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Button
                  onClick={() => setUseProactiveMode(!useProactiveMode)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {useProactiveMode ? "Disable" : "Enable"} Proactive Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Smart Detection
              </CardTitle>
              <CardDescription className="text-white/70">
                Uses 6 different strategies to match elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Exact selector matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Text content matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Attribute matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Partial selector matching</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-400" />
                Real-time Previews
              </CardTitle>
              <CardDescription className="text-white/70">
                Shows actual click results, not current page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-3 h-3 text-blue-400" />
                  <span>Hover for instant preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-green-400" />
                  <span>Automatic caching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-purple-400" />
                  <span>Full-page screenshots</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Buttons */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-white">Try the Enhanced Companion</h2>
          <p className="text-white/70">
            Click the button below to open the enhanced ToolTip Companion with proactive scraping
          </p>
          <Button
            onClick={() => setShowCompanion(!showCompanion)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {showCompanion ? 'Hide' : 'Show'} Enhanced Companion
          </Button>
        </div>

        {/* Demo Elements for Testing */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Test Elements</CardTitle>
              <CardDescription className="text-white/70">
                These elements will be detected by the proactive scraping system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" title="Primary Action">
                Primary Button
              </Button>
              <Button variant="outline" className="w-full" title="Secondary Action">
                Secondary Button
              </Button>
              <Button variant="ghost" className="w-full" title="Ghost Action">
                Ghost Button
              </Button>
              <a 
                href="#test" 
                className="block w-full text-center py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                title="Test Link"
              >
                Test Link
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Instructions</CardTitle>
              <CardDescription className="text-white/70">
                How to use the enhanced ToolTip Companion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">1</div>
                <span>Open the companion by clicking the button above</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">2</div>
                <span>Toggle proactive mode using the switch in the header</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">3</div>
                <span>Click the Globe icon to see the scraping panel</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">4</div>
                <span>Watch as elements are automatically detected and scraped</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">5</div>
                <span>Hover over detected elements to see real previews</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced ToolTip Companion */}
      {showCompanion && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="w-96 h-[500px]">
            <GlassCard
              onSendMessage={handleSendMessage}
              messages={messages}
              isLoading={isLoading}
              onFileUpload={handleFileUpload}
              onSearchClick={() => console.log('Search clicked')}
              className="w-full h-full"
              // Proactive scraping props
              targetUrl={window.location.href}
              enableProactiveMode={useProactiveMode}
              apiBaseUrl="http://localhost:3001"
              onScrapingStart={(url) => {
                console.log('Proactive scraping started for:', url);
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  type: 'ai',
                  content: `🚀 Starting proactive scraping for ${url}...`,
                  timestamp: new Date()
                }]);
              }}
              onScrapingComplete={(results) => {
                console.log('Proactive scraping completed:', results);
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  type: 'ai',
                  content: `✅ Proactive scraping completed! Found ${results.totalElements} elements with ${results.successfulPreviews} previews generated.`,
                  timestamp: new Date()
                }]);
              }}
              onScrapingError={(error) => {
                console.error('Proactive scraping error:', error);
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  type: 'ai',
                  content: `❌ Proactive scraping failed: ${error}`,
                  timestamp: new Date()
                }]);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolTipCompanionExample;
