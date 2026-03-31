import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { jobApplicationsApi } from '../api/jobApplications';
import type { JobApplication } from '../types';
import type { CreateJobApplicationRequest } from '../api/jobApplications';

const statusColors: Record<string, string> = {
  APPLIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  INTERVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  OFFER: 'bg-green-500/10 text-green-400 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const Dashboard = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState('ALL');
  const { logout } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const emptyForm: CreateJobApplicationRequest = {
    company: '',
    role: '',
    status: 'APPLIED',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
    jobLink: '',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchApplications = async () => {
    try {
      const res = await jobApplicationsApi.getAll();
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
        await jobApplicationsApi.update(editingApp.id, form);
      } else {
        await jobApplicationsApi.create(form);
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
    await jobApplicationsApi.delete(id);
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">JobTrackr</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hey, {profile?.username || 'User'}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, color: 'text-white' },
            { label: 'Interviews', value: stats.interview, color: 'text-yellow-400' },
            { label: 'Offers', value: stats.offer, color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditingApp(null); setForm(emptyForm); setShowModal(true); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ml-2"
          >
            + Add Application
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No applications yet. Add one!</div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Company</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Role</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date Applied</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr key={app.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{app.company}</div>
                        {app.jobLink && (
                          <a href={app.jobLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                            View posting
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{app.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{app.dateApplied}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(app)} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="text-sm text-red-400 hover:text-red-300 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-5">
              {editingApp ? 'Edit Application' : 'Add Application'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date Applied</label>
                  <input
                    type="date"
                    value={form.dateApplied}
                    onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Job Link</label>
                <input
                  type="url"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  rows={3}
                  placeholder="Any notes about this application..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingApp(null); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition"
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