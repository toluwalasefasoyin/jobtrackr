import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import axios from '../api/axios';
import Navbar from '../components/Navbar';

interface DailyStats {
  date: string;
  count: number;
}

interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

interface MonthlyStats {
  month: string;
  applications: number;
}

const Analytics: React.FC = () => {
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [statusData, setStatusData] = useState<StatusBreakdown[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/applications');
        const applications = res.data;

        // Calculate status breakdown
        const statusCounts = {
          APPLIED: applications.filter((a: any) => a.status === 'APPLIED').length,
          INTERVIEW: applications.filter((a: any) => a.status === 'INTERVIEW').length,
          OFFER: applications.filter((a: any) => a.status === 'OFFER').length,
          REJECTED: applications.filter((a: any) => a.status === 'REJECTED').length,
        };

        const status: StatusBreakdown[] = [
          { name: 'Applied', value: statusCounts.APPLIED, color: '#3b82f6' },
          { name: 'Interview', value: statusCounts.INTERVIEW, color: '#f59e0b' },
          { name: 'Offer', value: statusCounts.OFFER, color: '#10b981' },
          { name: 'Rejected', value: statusCounts.REJECTED, color: '#ef4444' },
        ];

        // Group applications by date
        const dateMap = new Map<string, number>();
        applications.forEach((app: any) => {
          const date = new Date(app.dateApplied).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });
        const daily: DailyStats[] = Array.from(dateMap, ([date, count]) => ({
          date,
          count,
        })).slice(-7); // Last 7 days

        // Group by month
        const monthMap = new Map<string, number>();
        applications.forEach((app: any) => {
          const month = new Date(app.dateApplied).toLocaleDateString('en-US', {
            month: 'short',
          });
          monthMap.set(month, (monthMap.get(month) || 0) + 1);
        });
        const monthly: MonthlyStats[] = Array.from(monthMap, ([month, applications]) => ({
          month,
          applications,
        }));

        setDailyData(daily);
        setStatusData(status);
        setMonthlyData(monthly);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate metrics
  const totalApplications = statusData.reduce((sum, item) => sum + item.value, 0);
  const successRate =
    totalApplications > 0
      ? (
          ((statusData.find((s) => s.name === 'Offer')?.value || 0) /
            totalApplications) *
          100
        ).toFixed(1)
      : '0';
  const interviewRate =
    totalApplications > 0
      ? (
          (((statusData.find((s) => s.name === 'Interview')?.value || 0) +
            (statusData.find((s) => s.name === 'Offer')?.value || 0)) /
            totalApplications) *
          100
        ).toFixed(1)
      : '0';

  if (loading)
    return <div className="text-center text-white p-8">Loading analytics...</div>;
  if (error) return <div className="text-center text-red-400 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your job application metrics and trends</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
            <div className="text-gray-400 text-sm font-medium mb-2">Total Applications</div>
            <div className="text-3xl font-bold text-white">{totalApplications}</div>
            <p className="text-gray-500 text-xs mt-2">All time</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
            <div className="text-gray-400 text-sm font-medium mb-2">Interview Rate</div>
            <div className="text-3xl font-bold text-amber-400">{interviewRate}%</div>
            <p className="text-gray-500 text-xs mt-2">Interviews to Applications</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
            <div className="text-gray-400 text-sm font-medium mb-2">Success Rate</div>
            <div className="text-3xl font-bold text-green-400">{successRate}%</div>
            <p className="text-gray-500 text-xs mt-2">Offers to Applications</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
            <div className="text-gray-400 text-sm font-medium mb-2">Pending</div>
            <div className="text-3xl font-bold text-blue-400">
              {statusData.find((s) => s.name === 'Applied')?.value || 0}
            </div>
            <p className="text-gray-500 text-xs mt-2">Awaiting Response</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Applications Chart */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Applications This Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Pie Chart */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar
                dataKey="applications"
                fill="#a78bfa"
                radius={[8, 8, 0, 0]}
                name="Applications"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
