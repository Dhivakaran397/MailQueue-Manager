import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, RotateCw, Clock, Send, Star, ChevronDown, Plus, LogOut, Loader2, ExternalLink 
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ComposeModal from './UploadModal.jsx';
import EmailDetail from './EmailDetail.jsx';
import MetricsBar from './MetricsBar.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'SCHEDULED', or 'SENT'
  const [recipients, setRecipients] = useState([]);
  const [counts, setCounts] = useState({ total: 0, sent: 0, pending: 0, failed: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      let statusParam = statusFilter;
      if (activeTab === 'SCHEDULED') statusParam = 'PENDING';
      if (activeTab === 'SENT') statusParam = 'SENT';

      const response = await api.get('/recipients', {
        params: { search, status: statusParam, page, limit: 15 }
      });
      
      const { recipients: recipientData, pagination, counts: countsData } = response.data;
      setRecipients(recipientData || []);
      setTotalPages(pagination?.totalPages || 1);
      setCounts(countsData || { total: 0, sent: 0, pending: 0, failed: 0 });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const userName = user?.email ? user.email.split('@')[0] : 'Oliver Brown';
  const userDisplayEmail = user?.email || 'oliver.brown@domain.io';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* LEFT SIDEBAR matching Screenshots 1 & 2 */}
      <aside className="w-64 border-r border-gray-100 flex flex-col p-5 bg-white justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 px-1">
            <span className="font-black text-2xl tracking-tighter text-gray-900 font-mono">MIE</span>
          </div>

          {/* User Profile Card */}
          <div className="bg-[#F4F5F7] p-2.5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-200/60 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-900 truncate capitalize">{userName}</p>
                <p className="text-[10px] text-gray-400 truncate">{userDisplayEmail}</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-1" />
          </div>

          {/* Blue Outline Compose Button */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full py-2.5 px-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            Compose
          </button>

          {/* Navigation CORE section */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-2">CORE</p>
            
            <button
              onClick={() => { setActiveTab('ALL'); setSelectedRecipient(null); setPage(1); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'ALL' 
                  ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Plus className="h-4 w-4" />
                <span>All Emails</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === 'ALL' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                {counts.total ?? 0}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('SCHEDULED'); setSelectedRecipient(null); setPage(1); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'SCHEDULED' 
                  ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4" />
                <span>Scheduled</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === 'SCHEDULED' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                {counts.pending ?? 0}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('SENT'); setSelectedRecipient(null); setPage(1); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'SENT' 
                  ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="h-4 w-4" />
                <span>Sent</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === 'SENT' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                {counts.sent ?? 0}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* MAIN RIGHT CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F4F5F7] border-0 rounded-full text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <button className="p-2 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Filter className="h-4 w-4" />
            </button>
            <button onClick={handleRefresh} className="p-2 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content View: Email Detail OR Email List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'ALL' && !selectedRecipient && (
            <MetricsBar counts={counts} />
          )}

          {selectedRecipient ? (
            <EmailDetail 
              recipient={selectedRecipient} 
              onBack={() => setSelectedRecipient(null)} 
            />
          ) : (
            <div className="space-y-2">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                  <p className="text-xs">Loading emails...</p>
                </div>
              ) : recipients.length === 0 ? (
                /* Empty state */
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    {activeTab === 'SCHEDULED' ? <Clock className="h-6 w-6" /> : <Send className="h-6 w-6" />}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    No {activeTab === 'SCHEDULED' ? 'scheduled' : 'sent'} emails found
                  </p>
                  <p className="text-xs text-gray-400">
                    Click <strong className="text-blue-600">Compose</strong> to send or schedule new emails!
                  </p>
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="mt-2 px-5 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-xs font-semibold transition-all"
                  >
                    + Compose Email
                  </button>
                </div>
              ) : (
                /* Dynamic Real DB Recipients Rows matching Screenshots 1 & 2 */
                <div className="divide-y divide-gray-50">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      onClick={() => setSelectedRecipient(recipient)}
                      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        <span className="font-semibold text-xs text-gray-900 w-36 shrink-0 truncate">
                          To: {recipient.email.split('@')[0]}
                        </span>

                        {recipient.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFEDD5] text-[#C2410C] shrink-0">
                            <Clock className="h-3 w-3" /> {new Date(recipient.campaign?.scheduledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 shrink-0">
                            Sent
                          </span>
                        )}

                        <p className="text-xs text-gray-800 truncate">
                          <strong className="font-semibold text-gray-900">{recipient.campaign?.name || 'Email Campaign'}</strong>
                          <span className="text-gray-400 font-normal"> - Click to view email details...</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {recipient.etherealPreviewUrl && (
                          <a
                            href={recipient.etherealPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1 rounded-full transition-colors shadow-2xs"
                          >
                            <ExternalLink className="h-3 w-3" /> View Mail (Ethereal)
                          </a>
                        )}
                        <Star className="h-4 w-4 text-gray-300 group-hover:text-amber-400 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Compose Modal matching Screenshot 2 */}
      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
