import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import NotificationBell from '../components/NotificationBell';
import type { Notification } from '../hooks/useWebSocket';
import type { JobApplication } from '../types';

const statusColors: Record<string, string> = {
  APPLIED: 'bg-blue-500/25 text-blue-200 border border-blue-400/50 font-semibold',
  INTERVIEW: 'bg-amber-500/25 text-amber-200 border border-amber-400/50 font-semibold',
  OFFER: 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 font-semibold',
  REJECTED: 'bg-red-500/25 text-red-200 border border-red-400/50 font-semibold',
};

const Dashboard = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  const { logout, username, token } = useAuth();
  const navigate = useNavigate();

  const emptyForm = {
    company: '',
    role: '',
    status: 'APPLIED',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
    jobLink: '',
  };
  const [form, setForm] = useState(emptyForm);

  const handleNotification = useCallback((notification: Notification) => {
    setNewNotification(notification);
    setUnreadCount(notification.unreadCount);
  }, []);

  useWebSocket({ username, token, onNotification: handleNotification });

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

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchUnreadCount();
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
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application?')) return;
    await api.delete(`/applications/${id}`);
    fetchApplications();
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

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  const stats = {
    total: applications.length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    offer: applications.filter(a => a.status === 'OFFER').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 backdrop-blur-md border-b border-purple-500/20 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">JobTrackr</h1>
        <div className="flex items-center gap-4">
          <NotificationBell
            unreadCount={unreadCount}
            newNotification={newNotification}
            onOpen={() => setUnreadCount(0)}
          />
          <span className="text-purple-100 text-sm font-medium">Hey, {username}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-purple-200 hover:text-purple-100 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, color: 'from-blue-500/30 to-blue-600/20', textColor: 'text-blue-200', border: 'border-blue-400/40', icon: '📝', filterValue: 'ALL' },
            { label: 'Interviews', value: stats.interview, color: 'from-amber-500/30 to-amber-600/20', textColor: 'text-amber-200', border: 'border-amber-400/40', icon: '💬', filterValue: 'INTERVIEW' },
            { label: 'Offers', value: stats.offer, color: 'from-emerald-500/30 to-emerald-600/20', textColor: 'text-emerald-200', border: 'border-emerald-400/40', icon: '✓', filterValue: 'OFFER' },
            { label: 'Rejected', value: stats.rejected, color: 'from-red-500/30 to-red-600/20', textColor: 'text-red-200', border: 'border-red-400/40', icon: '✕', filterValue: 'REJECTED' },
          ].map((stat) => (
            <div 
              key={stat.label} 
              onClick={() => setFilter(stat.filterValue)}
              className={`backdrop-blur-xl bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group ${
                filter === stat.filterValue ? 'ring-2 ring-purple-400/60 shadow-lg shadow-purple-500/30' : 'hover:shadow-lg hover:shadow-purple-500/20'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100/70 text-xs tracking-widest uppercase font-semibold">{stat.label}</p>
                <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
              </div>
              <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold backdrop-blur-md transition-all duration-300 transform hover:scale-105 ${
                  filter === s
                    ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/40 scale-105'
                    : 'bg-white/5 border border-purple-300/30 text-purple-100 hover:bg-white/10 hover:border-purple-300/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditingApp(null); setForm(emptyForm); setShowModal(true); }}
            className="bg-gradient-to-r from-purple-500 via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 transform"
          >
            + Add Application
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-purple-300/60 py-20 text-lg font-medium">Loading your applications...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-purple-300/60 py-20 text-lg font-medium">No applications yet. Add one to get started!</div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 border border-purple-300/25 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:border-purple-300/40">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-300/20 bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-purple-500/15">
                  <th className="text-left text-purple-100 text-sm font-bold px-6 py-4 tracking-wide">Company</th>
                  <th className="text-left text-purple-100 text-sm font-bold px-6 py-4 tracking-wide">Role</th>
                  <th className="text-left text-purple-100 text-sm font-bold px-6 py-4 tracking-wide">Status</th>
                  <th className="text-left text-purple-100 text-sm font-bold px-6 py-4 tracking-wide">Date Applied</th>
                  <th className="text-left text-purple-100 text-sm font-bold px-6 py-4 tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-purple-300/15 last:border-0 hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-purple-50">{app.company}</div>
                      {app.jobLink && (
                        <a href={app.jobLink} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:text-blue-200 transition-colors font-medium">
                          View posting →
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-purple-100/90">{app.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-2 rounded-full text-xs inline-block backdrop-blur-sm ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-200/70 text-sm font-medium">{app.dateApplied}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button onClick={() => handleEdit(app)} className="text-xs text-blue-300 hover:text-blue-200 font-bold transition-colors hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="text-xs text-red-300 hover:text-red-200 font-bold transition-colors hover:underline">
                          Delete
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-slate-900/70 border border-purple-300/40 rounded-3xl p-8 w-full max-w-lg shadow-2xl shadow-purple-500/40">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6">
              {editingApp ? 'Edit Application' : 'Add Application'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="APPLIED" style={{ background: '#1e293b', color: '#e0e7ff' }}>Applied</option>
                    <option value="INTERVIEW" style={{ background: '#1e293b', color: '#e0e7ff' }}>Interview</option>
                    <option value="OFFER" style={{ background: '#1e293b', color: '#e0e7ff' }}>Offer</option>
                    <option value="REJECTED" style={{ background: '#1e293b', color: '#e0e7ff' }}>Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Date Applied</label>
                  <input
                    type="date"
                    value={form.dateApplied}
                    onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Job Link</label>
                <input
                  type="url"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                  className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-purple-100 mb-2 font-bold tracking-widest uppercase">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full backdrop-blur-sm bg-white/10 border border-purple-300/40 rounded-xl px-4 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-300/70 focus:bg-white/15 transition-all resize-none"
                  rows={3}
                  placeholder="Any notes about this application..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingApp(null); }}
                  className="flex-1 backdrop-blur-sm bg-white/10 border border-purple-300/40 hover:bg-white/20 text-purple-100 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:border-purple-300/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-700 hover:to-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
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