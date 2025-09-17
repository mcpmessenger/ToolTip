import { useState } from "react";
import { X, Keyboard, Mouse, Zap, Search, Settings, BarChart3, Upload, Download } from "lucide-react";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'features' | 'tips'>('shortcuts');

  if (!isOpen) return null;

  const shortcuts = [
    { keys: 'Enter', description: 'Send message' },
    { keys: 'Ctrl + /', description: 'Open help panel' },
    { keys: 'Ctrl + K', description: 'Open search panel' },
    { keys: 'Ctrl + ,', description: 'Open settings' },
    { keys: 'Ctrl + D', description: 'Open dashboard' },
    { keys: 'Escape', description: 'Close current panel' },
    { keys: 'Ctrl + U', description: 'Upload file' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Search the web, documents, images, videos, and audio with intelligent filtering.',
      color: 'text-blue-500'
    },
    {
      icon: Upload,
      title: 'File Upload',
      description: 'Drag and drop files or click to upload. Supports text, PDF, and document files.',
      color: 'text-green-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'View detailed analytics about your conversations and usage patterns.',
      color: 'text-purple-500'
    },
    {
      icon: Settings,
      title: 'Customizable Settings',
      description: 'Personalize your experience with themes, sounds, and display options.',
      color: 'text-orange-500'
    },
    {
      icon: Zap,
      title: 'AI-Powered Chat',
      description: 'Intelligent conversations with context awareness and smart responses.',
      color: 'text-yellow-500'
    },
    {
      icon: Download,
      title: 'Export & Share',
      description: 'Export your conversations and share insights with others.',
      color: 'text-indigo-500'
    }
  ];

  const tips = [
    'Use specific keywords in your search queries for better results',
    'Upload files by dragging them directly onto the input area',
    'Click on the sparkles button to access quick actions',
    'Use the dashboard to track your conversation patterns',
    'Try asking "search for" or "find" to trigger web crawling',
    'Press Escape to quickly close any open panel',
    'Use keyboard shortcuts for faster navigation',
    'The AI remembers context from your previous messages'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
            { id: 'features', label: 'Features', icon: Zap },
            { id: 'tips', label: 'Tips', icon: Mouse }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <feature.icon className={`h-6 w-6 ${feature.color} flex-shrink-0 mt-1`} />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pro Tips
              </h3>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;

