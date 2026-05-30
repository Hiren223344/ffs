import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useClerkContext } from '../../context/ClerkContext';
import { useFearch } from '../../hooks/useFearch';
import { 
  Key, Terminal, BookOpen, LogOut, Copy, Plus, Trash, Eye, EyeOff, 
  Search, Sparkles, Check, RefreshCw, Cpu, Moon, Github, Twitter, 
  Mail, HelpCircle, X, CreditCard, LayoutDashboard, ShieldCheck, 
  Menu, Download, Bell, Zap, TrendingUp, Clock, AlertTriangle,
  ChevronDown, Filter, MoreHorizontal, Lock, Unlock, Wifi, WifiOff
} from 'lucide-react';

// Types
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

// Skeleton Loader Component
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

// Toast Notification Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'info' && <Zap className="w-4 h-4" />}
            {toast.message}
            <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useClerkContext();
  
  const userId = user?.id || user?.emailAddresses?.[0]?.emailAddress || 'anonymous';
  
  const fearch = useFearch({ 
    userId,
    adminSecret: import.meta.env.VITE_FEARCH_ADMIN_SECRET 
  });

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Data State
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'playground' | 'docs'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Playground State
  const [playgroundQuery, setPlaygroundQuery] = useState('');
  const [playgroundType, setPlaygroundType] = useState<'search' | 'scrape' | 'crawl'>('search');
  const [limitCount, setLimitCount] = useState(5);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundHistory, setPlaygroundHistory] = useState<any[]>([]);
  const [recipeLang, setRecipeLang] = useState<'curl' | 'node' | 'python'>('curl');

  // Refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast helper
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('success', 'Connection restored');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('error', 'Connection lost');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Auto-refresh data
  const refreshData = useCallback(async () => {
    if (!isOnline) return;
    await Promise.all([
      fearch.fetchUsage(),
      fearch.fetchBilling()
    ]);
    setLastRefreshed(new Date());
  }, [fearch, isOnline]);

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    refreshTimerRef.current = setInterval(refreshData, 30000);
    
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [refreshData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      // Ctrl/Cmd + R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
        addToast('info', 'Data refreshed');
      }
      // Ctrl/Cmd + N for new key
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData, addToast]);

  // Copy handler
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }, [addToast]);

  // Create Key handler
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      addToast('error', 'Key name is required');
      return;
    }
    
    const result = await fearch.createKey(newKeyName.trim());
    if (result) {
      setNewKeyName('');
      setShowCreateModal(false);
      addToast('success', `API key "${result.name}" created successfully`);
      await fearch.fetchUsage();
      
      // Add notification
      const notif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New API Key Created',
        message: `Key "${result.name}" was created successfully`,
        read: false,
        timestamp: new Date()
      };
      setNotifications(prev => [notif, ...prev]);
    } else {
      addToast('error', fearch.error || 'Failed to create key');
    }
  };

  // Export data
  const handleExport = useCallback(() => {
    const data = {
      userId,
      usage: fearch.userUsage,
      billing: fearch.billing,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fearch-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Data exported successfully');
  }, [userId, fearch.userUsage, fearch.billing, addToast]);

  // Playground Submit
  const handlePlaygroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundQuery.trim()) {
      addToast('error', 'Please enter a query');
      return;
    }
    
    setPlaygroundLoading(true);
    setPlaygroundResult(null);

    const startTime = performance.now();

    try {
      let result;
      if (playgroundType === 'search') {
        result = await fearch.search(playgroundQuery, limitCount);
      } else if (playgroundType === 'scrape') {
        result = await fearch.scrape(playgroundQuery);
      } else {
        addToast('error', 'Crawl not implemented yet');
        return;
      }

      if (result) {
        const latency = Math.round(performance.now() - startTime);
        setPlaygroundResult({ ...result, _latency: latency });
        setPlaygroundHistory(prev => [{ 
          query: playgroundQuery, 
          type: playgroundType, 
          timestamp: new Date(),
          latency 
        }, ...prev].slice(0, 50));
        addToast('success', `Request completed in ${latency}ms`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Request failed');
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Get usage stats
  const totalUsage = parseInt(fearch.userUsage?.summary.total_requests || '0');
  const maxRequests = fearch.billing?.max_requests || 5000;
  const usagePercent = maxRequests === -1 ? 0 : Math.min((totalUsage / maxRequests) * 100, 100);
  const tierName = fearch.billing?.tier || 'free';
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Theme classes
  const theme = {
    bg: isDarkMode ? 'bg-[#0b0c10]' : 'bg-[#FAF9F5]',
    text: isDarkMode ? 'text-[#dedede]' : 'text-[#2d2c2a]',
    card: isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]',
    sidebar: isDarkMode ? 'bg-[#0d0f17] border-[#202433]' : 'bg-white border-[#efeee9]',
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]',
    muted: isDarkMode ? 'text-[#8b949e]' : 'text-[#8a8984]',
    input: isDarkMode ? 'bg-black/45 border-[#202433] text-white' : 'bg-[#faf9f5] border-[#efeee9] text-[#2d2c2a]',
  };

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', shortcut: '1' },
    { id: 'keys', icon: Key, label: 'API Keys', shortcut: '2' },
    { id: 'playground', icon: Terminal, label: 'Playground', shortcut: '3' },
    { id: 'docs', icon: BookOpen, label: 'Documentation', shortcut: '4' },
  ] as const;

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 font-jakarta flex ${theme.bg} ${theme.text}`}>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 left-0 z-50 md:z-20 flex flex-col w-72 h-screen shrink-0 border-r transition-transform duration-300 ${theme.sidebar}`}>
        <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto">
          {/* Header */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.card}`}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Fearch Console</span>
              <span className={`text-[10px] font-medium ${theme.muted}`}>
                {fearch.getTierDisplayName(tierName)} Plan
              </span>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="font-medium">{isOnline ? 'Connected' : 'Offline'}</span>
            <span className="ml-auto text-[10px] opacity-70">
              {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 mb-1 ${theme.muted}`}>
              Navigation
            </span>
            {tabs.map(({ id, icon: Icon, label, shortcut }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id as any); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : `${theme.muted} ${theme.hover}`
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="flex-1 text-left">{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  ⌘{shortcut}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          {fearch.userUsage && (
            <div className={`p-3 rounded-xl border ${theme.card}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.muted}`}>
                Quick Stats
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-lg font-bold">{fearch.userUsage.summary.total_keys}</div>
                  <div className={`text-[10px] ${theme.muted}`}>API Keys</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{totalUsage}</div>
                  <div className={`text-[10px] ${theme.muted}`}>Requests</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${theme.hover} transition-colors`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.fullName || 'User'}</div>
              <div className={`text-xs truncate ${theme.muted}`}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm('Log out?')) {
                  await signOut();
                  navigate('/signin');
                }
              }}
              className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className={`flex items-center justify-between px-4 py-3 border-b ${theme.card}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className={`text-xs ${theme.muted}`}>
                {activeTab === 'overview' && 'Monitor your API usage and performance'}
                {activeTab === 'keys' && 'Manage your API keys'}
                {activeTab === 'playground' && 'Test API endpoints'}
                {activeTab === 'docs' && 'API documentation and guides'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                id="global-search"
                type="text"
                placeholder="Search... (⌘K)"
                className="bg-transparent border-none outline-none w-32 lg:w-48 text-sm"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => { refreshData(); addToast('info', 'Data refreshed'); }}
              className={`p-2 rounded-lg transition-colors ${theme.hover}`}
              title="Refresh (⌘R)"
            >
              <RefreshCw className={`w-4 h-4 ${fearch.loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${theme.hover}`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Export</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-colors relative ${theme.hover}`}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl ${theme.card} z-50`}
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <span className="font-semibold text-sm">Notifications</span>
                      <button
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`p-4 text-center text-sm ${theme.muted}`}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3 border-b border-gray-100 dark:border-gray-800 ${
                              !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="font-medium text-sm">{notif.title}</div>
                            <div className={`text-xs mt-0.5 ${theme.muted}`}>{notif.message}</div>
                            <div className={`text-[10px] mt-1 ${theme.muted}`}>
                              {notif.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${theme.hover}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Error Display */}
            {fearch.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {fearch.error}
                <button onClick={fearch.clearError} className="ml-auto underline">Dismiss</button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {fearch.loading ? (
                      <>
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                      </>
                    ) : (
                      <>
                        <div className={`p-5 rounded-2xl border ${theme.card}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold uppercase ${theme.muted}`}>Total Requests</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="text-3xl font-bold">{totalUsage.toLocaleString()}</div>
                          <div className={`text-xs mt-1 ${theme.muted}`}>
                            {fearch.userUsage?.summary.last_used_at 
                              ? `Last used ${new Date(fearch.userUsage.summary.last_used_at).toLocaleDateString()}`
                              : 'No usage yet'}
                          </div>
                        </div>

                        <div className={`p-5 rounded-2xl border ${theme.card}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold uppercase ${theme.muted}`}>API Keys</span>
                            <Key className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="text-3xl font-bold">{fearch.userUsage?.summary.total_keys || 0}</div>
                          <div className={`text-xs mt-1 ${theme.muted}`}>
                            {fearch.userUsage?.summary.active_keys || 0} active
                          </div>
                        </div>

                        <div className={`p-5 rounded-2xl border ${theme.card}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold uppercase ${theme.muted}`}>Plan Limit</span>
                            <Zap className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="text-3xl font-bold">
                            {maxRequests === -1 ? '∞' : maxRequests.toLocaleString()}
                          </div>
                          <div className={`text-xs mt-1 ${theme.muted}`}>
                            {fearch.getTierDisplayName(tierName)} tier
                          </div>
                        </div>

                        <div className={`p-5 rounded-2xl border ${theme.card}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold uppercase ${theme.muted}`}>Usage</span>
                            <Clock className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="text-3xl font-bold">{usagePercent.toFixed(1)}%</div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                usagePercent > 90 ? 'bg-rose-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    {fearch.userUsage?.keys.length === 0 ? (
                      <EmptyState
                        icon={Clock}
                        title="No activity yet"
                        description="Start using your API keys to see activity here"
                      />
                    ) : (
                      <div className="space-y-3">
                        {fearch.userUsage?.keys.slice(0, 5).map(key => (
                          <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <div className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{key.name}</div>
                              <div className={`text-xs ${theme.muted}`}>{key.key_prefix}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">{key.total_requests} reqs</div>
                              <div className={`text-xs ${theme.muted}`}>
                                {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never used'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* KEYS TAB */}
              {activeTab === 'keys' && (
                <motion.div
                  key="keys"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold">API Keys</h2>
                        <p className={`text-sm ${theme.muted}`}>Manage your API keys and monitor their usage</p>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Create Key
                      </button>
                    </div>

                    {fearch.loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                      </div>
                    ) : fearch.userUsage?.keys.length === 0 ? (
                      <EmptyState
                        icon={Key}
                        title="No API keys"
                        description="Create your first API key to start using the Fearch API"
                        action={
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Create Key
                          </button>
                        }
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                              isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'
                            }`}>
                              <th className="text-left py-3 px-4">Name</th>
                              <th className="text-left py-3 px-4">Key</th>
                              <th className="text-center py-3 px-4">Usage</th>
                              <th className="text-center py-3 px-4">Status</th>
                              <th className="text-right py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {fearch.userUsage?.keys.map((key) => (
                              <tr key={key.id} className={`${theme.hover} transition-colors`}>
                                <td className="py-4 px-4">
                                  <div className="font-medium">{key.name}</div>
                                  <div className={`text-xs ${theme.muted}`}>
                                    Created {new Date(key.created_at).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <code className={`px-2 py-1 rounded text-xs font-mono ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                  }`}>
                                    {key.key_prefix}••••••••
                                  </code>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <div className="font-semibold">{key.total_requests}</div>
                                  <div className={`text-xs ${theme.muted}`}>requests</div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    key.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      key.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />
                                    {key.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleCopy(key.key_prefix, key.id)}
                                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                      title="Copy prefix"
                                    >
                                      {copiedId === key.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PLAYGROUND TAB */}
              {activeTab === 'playground' && (
                <motion.div
                  key="playground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h2 className="text-xl font-bold mb-4">API Playground</h2>
                    
                    <form onSubmit={handlePlaygroundSubmit} className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        {(['search', 'scrape', 'crawl'] as const).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPlaygroundType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                              playgroundType === type
                                ? 'bg-blue-600 text-white'
                                : isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playgroundQuery}
                          onChange={(e) => setPlaygroundQuery(e.target.value)}
                          placeholder={playgroundType === 'search' ? 'Enter search query...' : 'Enter URL...'}
                          className={`flex-1 border rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${theme.input}`}
                        />
                        {playgroundType === 'search' && (
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={limitCount}
                            onChange={(e) => setLimitCount(parseInt(e.target.value) || 5)}
                            className={`w-20 border rounded-lg py-3 px-3 text-sm text-center ${theme.input}`}
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={playgroundLoading || !isOnline}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        {playgroundLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-4 h-4" />
                            Execute Request
                          </>
                        )}
                      </button>
                    </form>

                    {/* Results */}
                    {playgroundResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Response</span>
                          {playgroundResult._latency && (
                            <span className={`text-xs ${theme.muted}`}>
                              {playgroundResult._latency}ms
                            </span>
                          )}
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0c0d12]">
                          <pre className="p-4 text-xs text-emerald-400 overflow-auto max-h-96 font-mono">
                            {JSON.stringify(playgroundResult, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    )}

                    {/* History */}
                    {playgroundHistory.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-3">Recent Requests</h3>
                        <div className="space-y-2">
                          {playgroundHistory.slice(0, 5).map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                            }`}>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.type}
                              </span>
                              <span className="flex-1 truncate">{item.query}</span>
                              <span className={`text-xs ${theme.muted}`}>{item.latency}ms</span>
                              <span className={`text-xs ${theme.muted}`}>
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* DOCS TAB */}
              {activeTab === 'docs' && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h2 className="text-xl font-bold mb-4">API Documentation</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                        <p className={`text-sm mb-4 ${theme.muted}`}>
                          All API requests require authentication using your API key in the Authorization header.
                        </p>
                        <div className="rounded-lg overflow-hidden bg-[#0c0d12] border border-gray-800">
                          <pre className="p-4 text-xs text-emerald-400 font-mono">
{`Authorization: Bearer fx_your_api_key_here`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Base URL</h3>
                        <p className={`text-sm mb-4 ${theme.muted}`}>
                          All API requests should be made to the following base URL:
                        </p>
                        <div className="rounded-lg overflow-hidden bg-[#0c0d12] border border-gray-800">
                          <pre className="p-4 text-xs text-emerald-400 font-mono">
{`https://search.frenix.sh/v1`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Search Endpoint</h3>
                        <p className={`text-sm mb-4 ${theme.muted}`}>
                          Perform web searches and get structured results.
                        </p>
                        <div className="rounded-lg overflow-hidden bg-[#0c0d12] border border-gray-800">
                          <pre className="p-4 text-xs text-emerald-400 font-mono">
{`POST /v1/search
Content-Type: application/json

{
  "query": "your search query",
  "limit": 5
}`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Scrape Endpoint</h3>
                        <p className={`text-sm mb-4 ${theme.muted}`}>
                          Extract content from any URL in markdown format.
                        </p>
                        <div className="rounded-lg overflow-hidden bg-[#0c0d12] border border-gray-800">
                          <pre className="p-4 text-xs text-emerald-400 font-mono">
{`POST /v1/scrape
Content-Type: application/json

{
  "url": "https://example.com"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${theme.card}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Create API Key</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateKey} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. production, development"
                    className={`w-full border rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${theme.input}`}
                    autoFocus
                  />
                  <p className={`text-xs mt-1.5 ${theme.muted}`}>
                    Give your key a descriptive name to identify its purpose.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fearch.loading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {fearch.loading ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
