import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useClerkContext } from '../../context/ClerkContext';
import { useFearch } from '../../hooks/useFearch';
import { 
  Key, Terminal, Sliders, BookOpen, LogOut, 
  Copy, Plus, Trash, Eye, EyeOff, Search, Sparkles, Globe, 
  Check, RefreshCw, Layers, Cpu, Moon, 
  Github, Twitter, Mail, HelpCircle, X, CreditCard,
  LayoutDashboard, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useClerkContext();
  
  // Get user ID from Clerk
  const userId = user?.id || user?.emailAddresses?.[0]?.emailAddress || 'anonymous';
  
  // Fearch API hook
  const fearch = useFearch({ 
    userId,
    // Admin secret would come from environment or auth context
    adminSecret: import.meta.env.VITE_FEARCH_ADMIN_SECRET 
  });

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Playground State
  const [playgroundQuery, setPlaygroundQuery] = useState('');
  const [playgroundType, setPlaygroundType] = useState<'search' | 'scrape'>('search');
  const [limitCount, setLimitCount] = useState(5);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [recipeLang, setRecipeLang] = useState<'curl' | 'node' | 'python'>('curl');

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'playground'>('overview');

  // Load data on mount
  useEffect(() => {
    if (userId) {
      fearch.fetchUsage();
      fearch.fetchBilling();
    }
  }, [userId]);

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create Key handler
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    const result = await fearch.createKey(newKeyName.trim());
    if (result) {
      setNewKeyName('');
      setShowCreateModal(false);
      fearch.fetchUsage(); // Refresh usage
    }
  };

  // Playground Submit
  const handlePlaygroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundQuery.trim()) return;
    
    setPlaygroundLoading(true);
    setPlaygroundResult(null);

    try {
      if (playgroundType === 'search') {
        const result = await fearch.search(playgroundQuery, limitCount);
        if (result) setPlaygroundResult(result);
      } else {
        const result = await fearch.scrape(playgroundQuery);
        if (result) setPlaygroundResult(result);
      }
    } catch (err) {
      console.error('Playground error:', err);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Get usage stats
  const totalUsage = fearch.userUsage?.summary.total_requests || '0';
  const maxRequests = fearch.billing?.max_requests || 5000;
  const usagePercent = fearch.getUsagePercentage();
  const tierName = fearch.billing?.tier || 'free';

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 font-jakarta flex select-none ${
      isDarkMode ? 'bg-[#0b0c10] text-[#dedede]' : 'bg-[#FAF9F5] text-[#2d2c2a]'
    }`}>
      
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 h-screen shrink-0 sticky top-0 border-r z-20 transition-colors p-4 justify-between ${
        isDarkMode ? 'bg-[#0d0f17] border-[#202433]' : 'bg-white border-[#efeee9]'
      }`}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
            isDarkMode ? 'bg-[#151821] border-[#222735]' : 'bg-[#faf9f5] border-[#efeee9]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="bg-[rgba(30,50,90,0.8)] w-7 h-7 rounded-md flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                  Fearch Console
                </span>
                <span className={`text-[9px] ${isDarkMode ? 'text-[#8b949e]' : 'text-[#8a8984]'}`}>
                  {tierName}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-5 px-1.5">
            <div className="flex flex-col gap-1.5">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 ${
                isDarkMode ? 'text-[#5E6470]' : 'text-[#8a8984]'
              }`}>
                Platform
              </span>
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                  { id: 'keys', icon: Key, label: 'API Keys' },
                  { id: 'playground', icon: Terminal, label: 'Playground' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer text-left w-full ${
                      activeTab === id
                        ? isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-[#faf9f5] text-[#2d2c2a] shadow-sm border border-[#efeee9]'
                        : isDarkMode ? 'text-[#8b949e] hover:bg-white/5 hover:text-white' : 'text-[#6d6c67] hover:bg-[#faf9f5] hover:text-[#2d2c2a]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
          isDarkMode ? 'bg-[#151821]/40 border-[#202433]' : 'bg-[#faf9f5]/60 border-[#efeee9]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[rgba(30,50,90,0.2)] flex items-center justify-center text-xs font-semibold">
              {user?.firstName?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                {user?.fullName || 'User'}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-[#8b949e]' : 'text-[#8a8984]'}`}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm("Log out?")) {
                await signOut();
                navigate('/signin');
              }
            }}
            className="p-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col gap-6 items-center overflow-y-auto h-screen">
        <div className="w-full max-w-[1000px] flex flex-col gap-6">
          
          {/* Header */}
          <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col">
              <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-[#8b949e]' : 'text-[#8a8984]'}`}>
                {activeTab}
              </span>
              <h1 className={`text-3xl font-semibold tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                {activeTab === 'overview' ? 'Overview' : activeTab === 'keys' ? 'API Keys' : 'Playground'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm border ${
                isDarkMode ? 'bg-[#151821] border-[#222735] text-emerald-400' : 'bg-white border-[#efeee9] text-[#2d2c2a]'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operational</span>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-full shadow-sm border transition-all ${
                  isDarkMode ? 'bg-[#151821] border-[#222735] text-amber-400' : 'bg-white border-[#efeee9] text-[#8a8984]'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Error Display */}
          {fearch.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
              {fearch.error}
              <button onClick={fearch.clearError} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Plan Card */}
                <div className={`w-full p-6 sm:p-8 rounded-[1.8rem] border shadow-sm flex flex-col gap-6 ${
                  isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md w-fit ${
                        isDarkMode ? 'bg-white/5 text-[#8b949e]' : 'bg-[#e9e8e2] text-[#6d6c67]'
                      }`}>
                        CURRENT PLAN
                      </span>
                      <span className={`text-4xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                        {fearch.getTierDisplayName(tierName)}
                      </span>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <span className={isDarkMode ? 'text-[#8b949e]' : 'text-[#6d6c67]'}>Monthly Usage</span>
                      <span className={isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}>
                        {totalUsage} / {fearch.getTierMaxRequestsDisplay(maxRequests)} Credits
                      </span>
                    </div>

                    <div className={`w-full h-3.5 rounded-full overflow-hidden border ${
                      isDarkMode ? 'bg-black/40 border-[#202433]' : 'bg-[#efeee9] border-[#e9e8e2]'
                    }`}>
                      <div 
                        className="h-full bg-[rgba(30,50,90,0.8)] rounded-full transition-all duration-500" 
                        style={{ width: `${usagePercent}%` }} 
                      />
                    </div>

                    {fearch.isLimitExceeded() && (
                      <div className="text-xs text-rose-500 font-semibold">
                        ⚠️ Usage limit exceeded. Upgrade your plan to continue.
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-6 rounded-[1.8rem] border shadow-sm flex flex-col gap-2 ${
                    isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                  }`}>
                    <Key className="w-5 h-5 text-[rgba(30,50,90,0.8)]" />
                    <span className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                      {fearch.userUsage?.summary.total_keys || '0'}
                    </span>
                    <span className="text-xs text-[#8a8984]">Active API Keys</span>
                  </div>
                  <div className={`p-6 rounded-[1.8rem] border shadow-sm flex flex-col gap-2 ${
                    isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                  }`}>
                    <Search className="w-5 h-5 text-[rgba(30,50,90,0.8)]" />
                    <span className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                      {totalUsage}
                    </span>
                    <span className="text-xs text-[#8a8984]">Total Requests</span>
                  </div>
                  <div className={`p-6 rounded-[1.8rem] border shadow-sm flex flex-col gap-2 ${
                    isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                  }`}>
                    <Sparkles className="w-5 h-5 text-[rgba(30,50,90,0.8)]" />
                    <span className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                      {fearch.userUsage?.keys.length || 0}
                    </span>
                    <span className="text-xs text-[#8a8984]">Keys Created</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KEYS TAB */}
            {activeTab === 'keys' && (
              <motion.div
                key="keys"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <div className={`p-6 rounded-[1.8rem] border shadow-sm ${
                  isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                      API Keys
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#2d2c2a] text-white hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Key
                    </button>
                  </div>

                  {/* Keys Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`border-b text-[10px] font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'border-[#202433] text-[#8b949e]' : 'border-[#efeee9] text-[#8a8984]'
                        }`}>
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Prefix</th>
                          <th className="py-3 px-2 text-center">Usage</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#efeee9]/60">
                        {fearch.userUsage?.keys.map((k) => (
                          <tr key={k.id}>
                            <td className="py-4 px-2 font-semibold">{k.name}</td>
                            <td className="py-4 px-2 font-mono text-xs">{k.key_prefix}</td>
                            <td className="py-4 px-2 text-center">{k.total_requests}</td>
                            <td className="py-4 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                k.status === 'active' 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {k.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-xs text-[#8a8984]">
                              {new Date(k.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {(!fearch.userUsage?.keys.length) && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-[#8a8984]">
                              No API keys found. Create one to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PLAYGROUND TAB */}
            {activeTab === 'playground' && (
              <motion.div
                key="playground"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <div className={`p-6 rounded-[1.8rem] border shadow-sm ${
                  isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
                }`}>
                  <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
                    API Playground
                  </h2>

                  <form onSubmit={handlePlaygroundSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      {(['search', 'scrape'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPlaygroundType(type)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                            playgroundType === type
                              ? 'bg-[#2d2c2a] text-white'
                              : isDarkMode ? 'bg-white/5 text-[#8b949e]' : 'bg-[#faf9f5] text-[#6d6c67]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={playgroundQuery}
                      onChange={(e) => setPlaygroundQuery(e.target.value)}
                      placeholder={playgroundType === 'search' ? 'Search query...' : 'URL to scrape...'}
                      className={`w-full border rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#2d2c2a] ${
                        isDarkMode ? 'bg-black/45 border-[#202433] text-white' : 'bg-[#faf9f5] border-[#efeee9] text-[#2d2c2a]'
                      }`}
                    />

                    {playgroundType === 'search' && (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={limitCount}
                        onChange={(e) => setLimitCount(parseInt(e.target.value) || 5)}
                        className={`w-32 border rounded-lg py-2 px-3 text-sm ${
                          isDarkMode ? 'bg-black/45 border-[#202433] text-white' : 'bg-[#faf9f5] border-[#efeee9] text-[#2d2c2a]'
                        }`}
                      />
                    )}

                    <button
                      type="submit"
                      disabled={playgroundLoading}
                      className="bg-[#2d2c2a] text-white hover:bg-black font-semibold text-xs py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {playgroundLoading ? 'Loading...' : 'Execute'}
                    </button>
                  </form>

                  {/* Results */}
                  {playgroundResult && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-[#1a1d29] bg-[#0c0d12]">
                      <div className="px-4 py-2 border-b border-[#1b1f2e] flex justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#8b949e]">Response</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(playgroundResult, null, 2), 'result')}
                          className="text-[#8b949e] hover:text-white text-xs"
                        >
                          {copiedId === 'result' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-4 text-xs text-[#85e89d] overflow-auto max-h-96">
                        {JSON.stringify(playgroundResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl border shadow-lg ${
              isDarkMode ? 'bg-[#11131c] border-[#202433]' : 'bg-white border-[#efeee9]'
            }`}
          >
            <button onClick={() => setShowCreateModal(false)} className="absolute right-4 top-4">
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#2d2c2a]'}`}>
              Create API Key
            </h3>
            <form onSubmit={handleCreateKey} className="flex flex-col gap-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. production)"
                className={`w-full border rounded-lg py-2.5 px-3 text-sm ${
                  isDarkMode ? 'bg-black/45 border-[#202433] text-white' : 'bg-[#faf9f5] border-[#efeee9] text-[#2d2c2a]'
                }`}
              />
              <button
                type="submit"
                disabled={fearch.loading}
                className="bg-[#2d2c2a] text-white hover:bg-black font-semibold text-xs py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {fearch.loading ? 'Creating...' : 'Create Key'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
