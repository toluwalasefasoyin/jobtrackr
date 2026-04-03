import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import SearchFilter from '../components/SearchFilter';
import type { JobApplication } from '../types';

const statusStyles: Record<string, { badge: string; dot: string; label: string }> = {
  APPLIED: {
    badge: 'bg-primary-container/10 text-primary border border-primary/20',
    dot: 'bg-primary shadow-[0_0_8px_rgba(192,193,255,0.4)]',
    label: 'Applied',
  },
  INTERVIEW: {
    badge: 'bg-tertiary-container/10 text-tertiary border border-tertiary/20',
    dot: 'bg-tertiary shadow-[0_0_8px_rgba(255,183,131,0.4)]',
    label: 'Interview',
  },
  OFFER: {
    badge: 'bg-secondary-container/10 text-secondary border border-secondary/20 shadow-[0_0_15px_rgba(192,193,255,0.1)]',
    dot: 'bg-secondary shadow-[0_0_8px_rgba(192,193,255,0.4)]',
    label: 'Offer',
  },
  REJECTED: {
    badge: 'bg-error-container/10 text-error/60 border border-error/20',
    dot: 'bg-error/60',
    label: 'Rejected',
  },
};

const Dashboard = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [scrapeRole, setScrapeRole] = useState('');
  const [scrapedJobs, setScrapedJobs] = useState<{title: string, company: string, link: string}[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const { logout, username, token } = useAuth();
  const navigate = useNavigate();

  interface AppForm {
    company: string;
    role: string;
    status: string;
    dateApplied: string;
    interviewDate?: string;
    notes: string;
    jobLink: string;
  }

  const emptyForm: AppForm = {
    company: '',
    role: '',
    status: 'APPLIED',
    dateApplied: new Date().toISOString().split('T')[0],
    interviewDate: '',
    notes: '',
    jobLink: '',
  };
  const [form, setForm] = useState(emptyForm);

  useWebSocket({ username, token });

  const fetchApplications = async () => {
    try {
      const res = await api.get<JobApplication[]>('/applications');
      setApplications(res.data);
    } catch {
      logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.put(`/applications/${editingApp.id}`, form);
      } else {
        await api.post('/applications', form);
      }
      setShowModal(false);
      setEditingApp(null);
      setForm(emptyForm);
      fetchApplications();
    } catch (err) {
      // Suppress error in console
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application?')) return;
    await api.delete(`/applications/${id}`);
    fetchApplications();
  };

  const handleScrapeJobs = async () => {
    if (!scrapeRole.trim()) return;
    setIsScraping(true);
    setScrapeError('');
    try {
      const res = await api.get(`/jobs/scrape?role=${encodeURIComponent(scrapeRole)}`);
      setScrapedJobs(res.data);
    } catch (err) {
      setScrapeError('Failed to fetch jobs.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      dateApplied: app.dateApplied,
      notes: app.notes || '',
      jobLink: app.jobLink || '',
    });
    setShowModal(true);
  };

  const filtered = applications.filter((app) => {
    if (filter !== 'ALL' && app.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !app.company.toLowerCase().includes(query) &&
        !app.role.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (startDate && app.dateApplied < startDate) return false;
    if (endDate && app.dateApplied > endDate) return false;
    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilter('ALL');
  };

  const stats = {
    total: applications.length,
    interview: applications.filter((a) => a.status === 'INTERVIEW').length,
    offer: applications.filter((a) => a.status === 'OFFER').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="px-6 lg:px-12 py-8 pb-12">
      {/* Header & Breadcrumb */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">
          <span>Overview</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Dashboard</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          Application Pipeline
        </h1>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* Total Applied */}
        <div
          onClick={() => setFilter('ALL')}
          className={`bg-surface-container p-6 rounded-xl ghost-border relative overflow-hidden group cursor-pointer transition-all ${
            filter === 'ALL' ? 'ring-1 ring-primary/40' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity group-hover:opacity-100"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Total Applied
            </span>
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <div className="text-5xl font-black tracking-tighter text-white mb-2">
            {stats.total}
          </div>
        </div>

        {/* Interviews */}
        <div
          onClick={() => setFilter('INTERVIEW')}
          className={`bg-surface-container p-6 rounded-xl ghost-border relative overflow-hidden group cursor-pointer transition-all ${
            filter === 'INTERVIEW' ? 'ring-1 ring-tertiary/40' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Interviews
            </span>
            <span className="material-symbols-outlined text-tertiary">videocam</span>
          </div>
          <div className="text-5xl font-black tracking-tighter text-tertiary mb-2">
            {String(stats.interview).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="text-tertiary font-bold">Live Stage</span>
          </div>
        </div>

        {/* Offers */}
        <div
          onClick={() => setFilter('OFFER')}
          className={`bg-surface-container p-6 rounded-xl ghost-border relative overflow-hidden group cursor-pointer transition-all ${
            filter === 'OFFER' ? 'ring-1 ring-secondary/40' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Offers
            </span>
            <span className="material-symbols-outlined text-secondary">verified_user</span>
          </div>
          <div className="text-5xl font-black tracking-tighter text-secondary mb-2">
            {String(stats.offer).padStart(2, '0')}
          </div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setFilter('REJECTED')}
          className={`bg-surface-container p-6 rounded-xl ghost-border relative overflow-hidden group cursor-pointer transition-all ${
            filter === 'REJECTED' ? 'ring-1 ring-error/40' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Rejected
            </span>
            <span className="material-symbols-outlined text-error/60">cancel</span>
          </div>
          <div className="text-5xl font-black tracking-tighter text-error/40 mb-2">
            {String(stats.rejected).padStart(2, '0')}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onReset={handleResetFilters}
      />

      {/* Filter Bar & Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg w-fit ghost-border">
          {['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
                filter === s
                  ? 'bg-white/5 text-white'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingApp(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed px-6 py-3 rounded-xl font-bold text-sm tracking-tight hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Application
        </button>
      </section>

      {/* Applications Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl mb-4">progress_activity</span>
          <p className="text-sm">Loading your applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-4">work_outline</span>
          <p className="text-sm">No applications found. Add one to get started!</p>
        </div>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden ghost-border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Company
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Role
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Date
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((app) => {
                  const style = statusStyles[app.status] || statusStyles.APPLIED;
                  return (
                    <tr
                      key={app.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ghost-border">
                            <span className="material-symbols-outlined text-white/50">
                              domain
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white tracking-tight">
                              {app.company}
                            </div>
                            {app.jobLink && (
                              <a
                                href={app.jobLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-primary hover:underline decoration-primary/30 underline-offset-4"
                              >
                                View posting →
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-on-surface-variant">
                          {app.role}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">
                        {formatDate(app.dateApplied)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(app)}
                            className="text-on-surface-variant/60 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-on-surface-variant/60 hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant/50">
              Showing {filtered.length} of {applications.length} total applications
            </p>
            <button
               onClick={() => setShowDiscoverModal(true)}
               className="flex items-center gap-2 px-5 py-2.5 bg-tertiary/10 text-tertiary rounded-xl ghost-border hover:bg-tertiary/20 transition-all font-bold text-xs uppercase tracking-widest min-w-fit"
            >
               <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
               Discover Jobs
            </button>
          </footer>
        </section>
      )}

      {/* Discover Jobs Modal */}
      {showDiscoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-low ghost-border rounded-2xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col max-h-[80vh]">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center ghost-border">
                   <span className="material-symbols-outlined text-tertiary">search_insights</span>
                 </div>
                 <h2 className="text-xl font-bold font-headline text-white tracking-tight">Auto-Discover Roles</h2>
               </div>
               <button
                onClick={() => setShowDiscoverModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors"
               >
                <span className="material-symbols-outlined text-[20px]">close</span>
               </button>
            </div>

            <div className="p-6 flex-shrink-0">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="e.g., Senior React Developer"
                  className="flex-1 bg-surface-container-lowest ghost-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-tertiary/80 transition-all"
                  value={scrapeRole}
                  onChange={(e) => setScrapeRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrapeJobs()}
                />
                <button
                  onClick={handleScrapeJobs}
                  disabled={isScraping || !scrapeRole.trim()}
                  className="bg-gradient-to-br from-tertiary to-tertiary-container flex items-center gap-2 px-6 py-3 rounded-xl text-on-primary-fixed font-bold disabled:opacity-50 ghost-border hover:brightness-110 shadow-[0_0_15px_rgba(255,183,131,0.2)] transition-all"
                >
                  {isScraping ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Search'}
                </button>
              </div>
              {scrapeError && <p className="text-error text-xs font-bold uppercase tracking-widest mt-4 pl-1">{scrapeError}</p>}
            </div>
            
            <div className="p-6 pt-0 overflow-y-auto custom-scrollbar flex-1">
              {!isScraping && scrapedJobs.length === 0 && !scrapeError && (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">wifi_tethering</span>
                  <p className="text-on-surface-variant text-sm font-medium">Initialize a scan to fetch active remote roles directly from external hubs.</p>
                </div>
              )}
              
              <div className="space-y-3">
                {scrapedJobs.map((job, idx) => (
                  <div key={idx} className="bg-surface-container-lowest ghost-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-surface-container/50 transition-colors">
                    <div>
                      <h4 className="text-white text-sm font-bold tracking-tight mb-1 group-hover:text-tertiary transition-colors">{job.title}</h4>
                      <p className="text-on-surface-variant text-xs">{job.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={job.link} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors ghost-border">
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                      <button 
                        onClick={() => {
                          setEditingApp(null);
                          setForm({ ...emptyForm, company: job.company, role: job.title, jobLink: job.link });
                          setShowDiscoverModal(false);
                          setShowModal(true);
                        }}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors ghost-border min-w-max flex items-center gap-1.5"
                      >
                         <span className="material-symbols-outlined text-[14px]">add</span>
                        Add Intention
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-low ghost-border rounded-2xl p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <h2 className="font-bold text-white text-xl mb-6 tracking-tight">
              {editingApp ? 'Edit Application' : 'New Application'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-surface-container-lowest ghost-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
                    placeholder="Company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-surface-container-lowest ghost-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
                    placeholder="Position title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    Status
                  </label>
                  <select
                    className="w-full bg-surface-container-low ghost-border rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all appearance-none"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Date</label>
                  <input
                    className="w-full bg-surface-container-low ghost-border rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all [color-scheme:dark]"
                    type="date"
                    required
                    value={form.dateApplied}
                    onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    Interview Date
                  </label>
                  <input
                    className="w-full bg-surface-container-low ghost-border rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all [color-scheme:dark] placeholder:text-outline/50"
                    type="date"
                    value={form.interviewDate || ''}
                    onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                  />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  Job Link
                </label>
                <input
                  type="url"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                  className="w-full bg-surface-container-lowest ghost-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface-container-lowest ghost-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all resize-none"
                  rows={3}
                  placeholder="Any notes about this application..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingApp(null);
                  }}
                  className="flex-1 bg-surface-container ghost-border hover:bg-surface-bright text-on-surface py-3 rounded-lg font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed py-3 rounded-lg font-bold transition-all hover:brightness-110 active:scale-[0.98] text-sm shadow-lg shadow-indigo-500/20"
                >
                  {editingApp ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
