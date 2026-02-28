import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { riskAPI, trainingAPI, campaignAPI } from '../api/index.js';
import StatCard from '../components/StatCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Safe id comparison — handles ObjectId objects and plain strings
const sameId = (a, b) => String(a) === String(b);

const Dashboard = () => {
  const { user } = useAuth();
  const [risk, setRisk]           = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      riskAPI.getUser(user._id).catch(() => null),
      trainingAPI.getAll(),
      campaignAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([r, t, c]) => {
      setRisk(r?.data ?? null);
      setTrainings(t.data);
      setCampaigns(c.data);
    }).finally(() => setLoading(false));
  }, [user._id]);

  if (loading) return <Spinner />;

  const isDone = (t) => t.completedBy?.some((c) => sameId(c.user, user._id));
  const completedCount = trainings.filter(isDone).length;

  const chartData = campaigns.slice(0, 5).map((c) => ({
    name: c.name.slice(0, 14),
    clicked: c.stats?.clicked ?? 0,
    reported: c.stats?.reported ?? 0,
  }));

  const riskColor = {
    brand: 'brand', low: 'green', medium: 'yellow', high: 'orange', critical: 'red',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your security overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Risk Score" icon="⚠️"
          color={riskColor[risk?.level] ?? 'brand'}
          value={risk ? `${risk.score}/100` : '—'}
          sub={risk ? `Level: ${risk.level}` : 'Not calculated yet'}
        />
        <StatCard
          label="Trainings Done" icon="📚" color="green"
          value={`${completedCount} / ${trainings.length}`}
          sub="modules completed"
        />
        <StatCard
          label="Campaigns" icon="📣" color="brand"
          value={campaigns.length} sub="total campaigns"
        />
        <StatCard
          label="Role" icon="👤" color="yellow"
          value={user.role} sub={user.department || 'No department'}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Campaign — Clicks vs Reports</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="clicked"  name="Clicked"  fill="#f97316" radius={[4,4,0,0]} />
              <Bar dataKey="reported" name="Reported" fill="#22c55e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent trainings */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Training Modules</h2>
        {trainings.length === 0 ? (
          <p className="text-sm text-gray-400">No trainings assigned yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {trainings.slice(0, 6).map((t) => (
              <li key={t._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{t.category} · {t.durationMinutes} min</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isDone(t) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isDone(t) ? '✓ Done' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;