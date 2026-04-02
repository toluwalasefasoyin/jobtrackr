import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import SearchFilter from '../components/SearchFilter';
import type { JobApplication } from '../types';

const statusColors: Record<string, string> = {
  APPLIED: 'bg-primary/20 text-primary border border-primary/40 font-semibold',
  INTERVIEW: 'bg-tertiary/20 text-tertiary border border-tertiary/40 font-semibold',
  OFFER: 'bg-success-container text-on-success-container border border-success/40 font-semibold',
  REJECTED: 'bg-error-container text-on-error-container border border-error/40 font-semibold',
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

  // Apply all filters: status, search, and date range
  const filtered = applications.filter((app) => {
    // Status filter
    if (filter !== 'ALL' && app.status !== filter) return false;

    // Search filter (company or role)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !app.company.toLowerCase().includes(query) &&
        !app.role.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Date range filter
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
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    offer: applications.filter(a => a.status === 'OFFER').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-inverse-surface px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-headline font-bold text-on-surface dark:text-inverse-on-surface text-4xl mb-2">Dashboard</h1>
          <p className="text-on-surface-variant font-body text-base">Track and manage all your job applications in one place.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, colorClass: 'text-primary', icon: 'assignment', filterValue: 'ALL' },
            { label: 'Interviews', value: stats.interview, colorClass: 'text-tertiary', icon: 'chat', filterValue: 'INTERVIEW' },
            { label: 'Offers', value: stats.offer, colorClass: 'text-success', icon: 'check_circle', filterValue: 'OFFER' },
            { label: 'Rejected', value: stats.rejected, colorClass: 'text-error', icon: 'cancel', filterValue: 'REJECTED' },
          ].map((stat) => (
            <div 
              key={stat.label} 
              onClick={() => setFilter(stat.filterValue)}
              className={`bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 hover:bg-surface-container dark:hover:bg-surface-container-highest cursor-pointer transition-all ${
                filter === stat.filterValue ? 'ring-2 ring-primary shadow-md' : ''
              }`}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">{stat.label}</p>
                <span className="material-symbols-outlined text-on-surface-variant">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${stat.colorClass}`}>{stat.value}</p>
            </div>
          ))}
        </div>

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

        {/* Filter Buttons and Add Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-label font-semibold transition-all ${
                  filter === s
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditingApp(null); setForm(emptyForm); setShowModal(true); }}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline font-bold transition-all hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            + New Application
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-on-surface-variant py-20 text-lg font-body">Loading your applications...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-on-surface-variant py-20 text-lg font-body">No applications yet. Add one to get started!</div>
        ) : (
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="text-left text-on-surface font-headline text-sm font-bold px-6 py-4">Company</th>
                  <th className="text-left text-on-surface font-headline text-sm font-bold px-6 py-4">Role</th>
                  <th className="text-left text-on-surface font-headline text-sm font-bold px-6 py-4">Status</th>
                  <th className="text-left text-on-surface font-headline text-sm font-bold px-6 py-4">Date Applied</th>
                  <th className="text-left text-on-surface font-headline text-sm font-bold px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-body font-semibold text-on-surface">{app.company}</div>
                      {app.jobLink && (
                        <a href={app.jobLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-body">
                          View posting →
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 font-body text-on-surface-variant">{app.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs inline-block font-label ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body text-on-surface-variant text-sm">{app.dateApplied}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button onClick={() => handleEdit(app)} className="text-xs text-primary hover:underline font-body font-semibold">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="text-xs text-error hover:underline font-body font-semibold">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="font-headline font-bold text-on-surface dark:text-inverse-on-surface text-2xl mb-6">
              {editingApp ? 'Edit Application' : 'Add Application'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Date Applied</label>
                  <input
                    type="date"
                    value={form.dateApplied}
                    onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Job Link</label>
                <input
                  type="url"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                  rows={3}
                  placeholder="Any notes about this application..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingApp(null); }}
                  className="flex-1 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface py-3 rounded-lg font-headline font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-headline font-bold transition-all hover:shadow-md active:scale-95"
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

