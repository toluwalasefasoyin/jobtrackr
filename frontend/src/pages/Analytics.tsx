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
          { name: 'Applied', value: statusCounts.APPLIED, color: '#0040a1' },
          { name: 'Interview', value: statusCounts.INTERVIEW, color: '#663f00' },
          { name: 'Offer', value: statusCounts.OFFER, color: '#2e7d32' },
          { name: 'Rejected', value: statusCounts.REJECTED, color: '#ba1a1a' },
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
    return <div className="text-center text-on-surface dark:text-inverse-on-surface p-8 font-body">Loading analytics...</div>;
  if (error) return <div className="text-center text-error p-8 font-body">{error}</div>;

  return (
    <div className="min-h-screen bg-surface dark:bg-inverse-surface py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-headline text-on-surface dark:text-inverse-on-surface mb-2">Analytics</h1>
          <p className="text-on-surface-variant font-body">Track your job application metrics and trends</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 hover:bg-surface-container transition">
            <div className="text-on-surface-variant font-label text-[11px] uppercase tracking-widest font-semibold mb-2">Total Applications</div>
            <div className="text-3xl font-bold font-headline text-on-surface dark:text-inverse-on-surface">{totalApplications}</div>
            <p className="text-on-surface-variant text-xs mt-2 font-body">All time</p>
          </div>

          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 hover:bg-surface-container transition">
            <div className="text-on-surface-variant font-label text-[11px] uppercase tracking-widest font-semibold mb-2">Interview Rate</div>
            <div className="text-3xl font-bold font-headline text-tertiary">{interviewRate}%</div>
            <p className="text-on-surface-variant text-xs mt-2 font-body">Interviews to Applications</p>
          </div>

          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 hover:bg-surface-container transition">
            <div className="text-on-surface-variant font-label text-[11px] uppercase tracking-widest font-semibold mb-2">Success Rate</div>
            <div className="text-3xl font-bold font-headline text-success">{successRate}%</div>
            <p className="text-on-surface-variant text-xs mt-2 font-body">Offers to Applications</p>
          </div>

          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 hover:bg-surface-container transition">
            <div className="text-on-surface-variant font-label text-[11px] uppercase tracking-widest font-semibold mb-2">Pending</div>
            <div className="text-3xl font-bold font-headline text-primary">
              {statusData.find((s) => s.name === 'Applied')?.value || 0}
            </div>
            <p className="text-on-surface-variant text-xs mt-2 font-body">Awaiting Response</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Applications Chart */}
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline text-on-surface dark:text-inverse-on-surface mb-4">Applications This Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" stroke="#0040a1" />
                <YAxis stroke="#0040a1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--primary))',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0040a1"
                  strokeWidth={2}
                  dot={{ fill: '#0040a1', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Pie Chart */}
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline text-on-surface dark:text-inverse-on-surface mb-4">Status Distribution</h2>
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
        <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
          <h2 className="text-xl font-bold font-headline text-on-surface dark:text-inverse-on-surface mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="month" stroke="#0040a1" />
              <YAxis stroke="#0040a1" />
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
                fill="#0040a1"
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
