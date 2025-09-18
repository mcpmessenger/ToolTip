import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus, 
  Edit3,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Palette,
  MousePointer,
  Keyboard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usage: number;
  maxUsage: number;
}

interface TooltipStats {
  totalTooltips: number;
  activeTooltips: number;
  interactions: number;
  errors: number;
  avgResponseTime: number;
}

interface DashboardProps {
  onKeyChange?: (keys: ApiKey[]) => void;
  onSettingsChange?: (settings: any) => void;
}

export const TooltipDashboard: React.FC<DashboardProps> = ({ 
  onKeyChange, 
  onSettingsChange 
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'tt_live_sk_1234567890abcdef',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(),
      usage: 1250,
      maxUsage: 10000
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'tt_dev_sk_abcdef1234567890',
      isActive: false,
      createdAt: new Date('2024-01-10'),
      usage: 45,
      maxUsage: 1000
    }
  ]);

  const [stats, setStats] = useState<TooltipStats>({
    totalTooltips: 24,
    activeTooltips: 18,
    interactions: 1250,
    errors: 3,
    avgResponseTime: 12.5
  });

  const [settings, setSettings] = useState({
    theme: 'glass',
    animations: true,
    keyboardControls: true,
    accessibility: true,
    autoPositioning: true,
    collisionDetection: true,
    maxTooltips: 10,
    defaultDelay: 300
  });

  const [newKey, setNewKey] = useState({ name: '', key: '' });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  // Generate a new API key
  const generateApiKey = useCallback(() => {
    const prefix = 'tt_live_sk_';
    const randomString = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    return prefix + randomString;
  }, []);

  // Add new API key
  const handleAddKey = useCallback(() => {
    if (newKey.name.trim() && newKey.key.trim()) {
      const key: ApiKey = {
        id: Date.now().toString(),
        name: newKey.name,
        key: newKey.key,
        isActive: true,
        createdAt: new Date(),
        usage: 0,
        maxUsage: 10000
      };
      setApiKeys(prev => [...prev, key]);
      setNewKey({ name: '', key: '' });
      onKeyChange?.(apiKeys);
    }
  }, [newKey, apiKeys, onKeyChange]);

  // Generate new key
  const handleGenerateKey = useCallback(() => {
    setNewKey(prev => ({ ...prev, key: generateApiKey() }));
  }, [generateApiKey]);

  // Toggle key visibility
  const toggleKeyVisibility = useCallback((keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  }, []);

  // Copy key to clipboard
  const copyKey = useCallback(async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy key:', err);
    }
  }, []);

  // Delete key
  const deleteKey = useCallback((keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  }, []);

  // Toggle key active state
  const toggleKeyActive = useCallback((keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
  }, []);

  // Update settings
  const updateSettings = useCallback((key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      onSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [onSettingsChange]);

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        interactions: prev.interactions + Math.floor(Math.random() * 5),
        activeTooltips: Math.max(0, prev.activeTooltips + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ToolTip Library Dashboard
          </h1>
          <p className="text-white/80 text-lg">
            Manage your tooltip library, API keys, and monitor usage
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Tooltips</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTooltips}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Active Tooltips</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeTooltips}</p>
                </div>
                <Zap className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Interactions</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.interactions.toLocaleString()}</p>
                </div>
                <MousePointer className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Avg Response</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.avgResponseTime}ms</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Key Management
                  </CardTitle>
                  <CardDescription>
                    Manage your tooltip library API keys and monitor usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Key */}
                  <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Add New API Key</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="key-name" className="text-slate-300">Key Name</Label>
                        <Input
                          id="key-name"
                          value={newKey.name}
                          onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Production Key"
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="key-value" className="text-slate-300">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="key-value"
                            value={newKey.key}
                            onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                            placeholder="tt_live_sk_..."
                            className="bg-slate-600 border-slate-500 text-white"
                          />
                          <Button
                            onClick={handleGenerateKey}
                            variant="outline"
                            size="sm"
                            className="border-slate-500 text-slate-300 hover:bg-slate-600"
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleAddKey}
                      disabled={!newKey.name.trim() || !newKey.key.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add API Key
                    </Button>
                  </div>

                  {/* Existing Keys */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Existing Keys</h3>
                    {apiKeys.map((key) => (
                      <motion.div
                        key={key.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-white">{key.name}</h4>
                              <Badge variant={key.isActive ? "default" : "secondary"}>
                                {key.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {key.usage.toLocaleString()} / {key.maxUsage.toLocaleString()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm bg-slate-800 px-2 py-1 rounded text-slate-300">
                                {showKeys[key.id] ? key.key : key.key.substring(0, 20) + '...'}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="text-slate-400 hover:text-white"
                              >
                                {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyKey(key.key)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-slate-400">
                              Created: {key.createdAt.toLocaleDateString()}
                              {key.lastUsed && ` • Last used: ${key.lastUsed.toLocaleDateString()}`}
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Usage</span>
                                <span>{Math.round((key.usage / key.maxUsage) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(key.usage / key.maxUsage) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleKeyActive(key.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteKey(key.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Library Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your tooltip library behavior and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Appearance Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="theme" className="text-slate-300">Theme</Label>
                          <select
                            id="theme"
                            value={settings.theme}
                            onChange={(e) => updateSettings('theme', e.target.value)}
                            className="bg-slate-600 border-slate-500 text-white rounded px-3 py-1"
                          >
                            <option value="glass">Glass Morphism</option>
                            <option value="material">Material Design</option>
                            <option value="minimal">Minimal</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="animations" className="text-slate-300">Animations</Label>
                          <Switch
                            id="animations"
                            checked={settings.animations}
                            onCheckedChange={(checked) => updateSettings('animations', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Behavior Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Behavior
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="keyboard" className="text-slate-300">Keyboard Controls</Label>
                          <Switch
                            id="keyboard"
                            checked={settings.keyboardControls}
                            onCheckedChange={(checked) => updateSettings('keyboardControls', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="accessibility" className="text-slate-300">Accessibility</Label>
                          <Switch
                            id="accessibility"
                            checked={settings.accessibility}
                            onCheckedChange={(checked) => updateSettings('accessibility', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-positioning" className="text-slate-300">Auto Positioning</Label>
                          <Switch
                            id="auto-positioning"
                            checked={settings.autoPositioning}
                            onCheckedChange={(checked) => updateSettings('autoPositioning', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="collision" className="text-slate-300">Collision Detection</Label>
                          <Switch
                            id="collision"
                            checked={settings.collisionDetection}
                            onCheckedChange={(checked) => updateSettings('collisionDetection', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-600" />

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Advanced
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-tooltips" className="text-slate-300">Max Tooltips</Label>
                        <Input
                          id="max-tooltips"
                          type="number"
                          value={settings.maxTooltips}
                          onChange={(e) => updateSettings('maxTooltips', parseInt(e.target.value))}
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="default-delay" className="text-slate-300">Default Delay (ms)</Label>
                        <Input
                          id="default-delay"
                          type="number"
                          value={settings.defaultDelay}
                          onChange={(e) => updateSettings('defaultDelay', parseInt(e.target.value))}
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Analytics
                  </CardTitle>
                  <CardDescription>
                    Monitor tooltip usage patterns and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon...</p>
                    <p className="text-sm">Track tooltip interactions, user engagement, and performance metrics</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Monitoring
                  </CardTitle>
                  <CardDescription>
                    Monitor tooltip performance and system health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-400">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Real-time monitoring coming soon...</p>
                    <p className="text-sm">Track errors, performance metrics, and system health in real-time</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};
