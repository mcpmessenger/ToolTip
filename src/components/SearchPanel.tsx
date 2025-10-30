import { useState } from "react";
import { X, Search, Globe, FileText, Image, Video, Music } from "lucide-react";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, type: string) => void;
}

const SearchPanel = ({ isOpen, onClose, onSearch }: SearchPanelProps) => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("web");

  const searchTypes = [
    { id: "web", label: "Web Search", icon: Globe, description: "Search the internet" },
    { id: "documents", label: "Documents", icon: FileText, description: "Search uploaded files" },
    { id: "images", label: "Images", icon: Image, description: "Find images online" },
    { id: "videos", label: "Videos", icon: Video, description: "Search video content" },
    { id: "audio", label: "Audio", icon: Music, description: "Find audio files" }
  ];

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), searchType);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Advanced Search</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Search Query
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your search query..."
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Search Type Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Search Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchTypes.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => setSearchType(id)}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors text-left ${
                    searchType === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Quick Searches
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "Latest AI news",
                "React tutorials",
                "Web development trends",
                "JavaScript frameworks",
                "CSS animations",
                "TypeScript tips"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;

