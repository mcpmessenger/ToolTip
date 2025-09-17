import { useState, useEffect } from "react";
import { Message } from "@/components/ui/glass-card";
import DataVisualization from "./DataVisualization";
import { Activity, Users, Zap, Clock, TrendingUp, Brain } from "lucide-react";

interface DashboardProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

interface Analytics {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageResponseTime: number;
  mostActiveHour: number;
  messageTypes: { label: string; value: number; color: string }[];
  hourlyActivity: { label: string; value: number }[];
}

const Dashboard = ({ messages, isOpen, onClose }: DashboardProps) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      calculateAnalytics();
    }
  }, [messages]);

  const calculateAnalytics = () => {
    const totalMessages = messages.length;
    const userMessages = messages.filter(m => m.type === 'user').length;
    const aiMessages = messages.filter(m => m.type === 'ai').length;

    // Calculate average response time (simplified)
    const responseTimes: number[] = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].type === 'user' && messages[i + 1].type === 'ai') {
        const timeDiff = messages[i + 1].timestamp.getTime() - messages[i].timestamp.getTime();
        responseTimes.push(timeDiff / 1000); // Convert to seconds
      }
    }
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Calculate most active hour
    const hourCounts = new Array(24).fill(0);
    messages.forEach(message => {
      const hour = message.timestamp.getHours();
      hourCounts[hour]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Message types analysis
    const messageTypes = [
      { label: 'Questions', value: messages.filter(m => m.content.includes('?')).length, color: '#3B82F6' },
      { label: 'Search Queries', value: messages.filter(m => 
        m.content.toLowerCase().includes('search') || 
        m.content.toLowerCase().includes('find')
      ).length, color: '#10B981' },
      { label: 'File Uploads', value: messages.filter(m => m.content.includes('📎')).length, color: '#F59E0B' },
      { label: 'General Chat', value: messages.length - messages.filter(m => 
        m.content.includes('?') || 
        m.content.toLowerCase().includes('search') || 
        m.content.toLowerCase().includes('find') ||
        m.content.includes('📎')
      ).length, color: '#8B5CF6' }
    ];

    // Hourly activity (last 24 hours)
    const now = new Date();
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
      const hour = (now.getHours() - 23 + i + 24) % 24;
      const count = messages.filter(m => m.timestamp.getHours() === hour).length;
      return {
        label: `${hour.toString().padStart(2, '0')}:00`,
        value: count
      };
    });

    setAnalytics({
      totalMessages,
      userMessages,
      aiMessages,
      averageResponseTime,
      mostActiveHour,
      messageTypes,
      hourlyActivity
    });
  };

  if (!isOpen || !analytics) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {analytics.totalMessages}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">Total Messages</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {analytics.userMessages}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300">User Messages</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {analytics.averageResponseTime.toFixed(1)}s
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-300">Avg Response Time</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {analytics.mostActiveHour}:00
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-300">Most Active Hour</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataVisualization
              data={analytics.messageTypes}
              title="Message Types"
              type="pie"
            />
            <DataVisualization
              data={analytics.hourlyActivity}
              title="Activity by Hour"
              type="bar"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {messages.slice(-10).reverse().map((message) => (
                <div key={message.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-500 dark:text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {message.content.substring(0, 50)}
                    {message.content.length > 50 ? '...' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

