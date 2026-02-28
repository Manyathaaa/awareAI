import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { riskAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

// ─── helpers ─────────────────────────────────────────────────────────────────
const LEVEL_CLASS = {
  low:      'badge-low',
  medium:   'badge-medium',
  high:     'badge-high',
  critical: 'badge-critical',
};

const LEVEL_COLOR = {
  low:      '#22c55e',
  medium:   '#eab308',
  high:     '#f97316',
  critical: '#ef4444',
};

const LEVEL_BG = {
  low:      'bg-green-50  border-green-200',
  medium:   'bg-yellow-50 border-yellow-200',
  high:     'bg-orange-50 border-orange-200',
  critical: 'bg-red-50    border-red-200',
};

const levelFromScore = (s) => {
  if (s >= 75) return 'critical';
  if (s >= 55) return 'high';
  if (s >= 30) return 'medium';
  return 'low';
};

// Semi-circular gauge component (SVG)
const ScoreGauge = ({ score }) => {
  const level = levelFromScore(score ?? 0);
  const color = LEVEL_COLOR[level];
  // Arc: 0 = left end, 180° sweep
  const pct   = (score ?? 0) / 100;
  const R     = 70;
  const cx    = 90, cy = 90;
  const startX = cx - R, startY = cy;
  const endAngle = Math.PI * pct; // 0..π
  const endX  = cx - R * Math.cos(endAngle);
  const endY  = cy - R * Math.sin(endAngle);
  const large = pct > 0.5 ? 1 : 0;

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[200px] mx-auto">
      {/* Background track */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"
      />
      {/* Coloured arc */}
      {score > 0 && (
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 ${large} 1 ${endX} ${endY}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        />
      )}
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
        {score ?? '—'}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#6b7280">
        out of 100
      </text>
      {/* Labels */}
      <text x={cx - R + 2} y={cy + 18} fontSize="9" fill="#9ca3af">0</text>
      <text x={cx + R - 10} y={cy + 18} fontSize="9" fill="#9ca3af">100</text>
    </svg>
  );
};

// Factor row
const FactorRow = ({ icon, label, value, sub, good }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
    <span className={`text-sm font-semibold ${good ? 'text-green-600' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Risk = () => {
  const { user } = useAuth();
  const isPrivileged = ['admin', 'manager'].includes(user.role);

  const [scores,   setScores]   = useState([]);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [recalcing, setRecalcing] = useState(null); // userId being recalculated
  const [autoCalced, setAutoCalced] = useState(false);

  // ── Load org scores ──
  const loadScores = useCallback(async () => {
    setLoading(true);
    try {
      const r = await riskAPI.getAll();
      setScores(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load own history ──
  const loadHistory = useCallback(async () => {
    try {
      const r = await riskAPI.getHistory(user._id);
      setHistory(r.data.reverse()); // oldest → newest for chart
    } catch { /* ignore if no history yet */ }
  }, [user._id]);

  useEffect(() => {
    loadScores();
    loadHistory();
  }, [loadScores, loadHistory]);

  // ── Auto-calculate if user has no score ──
  useEffect(() => {
    if (!loading && !autoCalced) {
      const mine = scores.find((s) => String(s.user?._id ?? s.user) === String(user._id));
      if (!mine) {
        setAutoCalced(true);
        riskAPI.recalculate(user._id).then(() => { loadScores(); loadHistory(); });
      }
    }
  }, [loading, scores, autoCalced, user._id, loadScores, loadHistory]);

  // ── Recalculate handler ──
  const recalculate = async (userId) => {
    setRecalcing(userId);
    try {
      await riskAPI.recalculate(userId);
      await loadScores();
      if (String(userId) === String(user._id)) await loadHistory();
    } finally {
      setRecalcing(null);
    }
  };

  if (loading) return <Spinner />;

  const myScore = scores.find((s) => String(s.user?._id ?? s.user) === String(user._id));
  const level   = myScore ? levelFromScore(myScore.score) : 'low';

  const chartData = history.map((h) => ({
    date: new Date(h.calculatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    score: h.score,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Scores</h1>
          <p className="text-sm text-gray-500 mt-1">Security risk assessment — lower score is better</p>
        </div>
        <button
          onClick={() => recalculate(user._id)}
          disabled={!!recalcing}
          className="btn-secondary text-sm"
        >
          {recalcing === user._id ? '⏳ Recalculating…' : '🔄 Recalculate My Score'}
        </button>
      </div>

      {/* ── My score panel ── */}
      <div className={`card border-2 mb-8 ${myScore ? LEVEL_BG[level] : 'border-gray-200'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gauge */}
          <div className="flex flex-col items-center justify-center">
            <ScoreGauge score={myScore?.score ?? null} />
            <div className="mt-2 flex items-center gap-2">
              <span className={LEVEL_CLASS[level]}>{level}</span>
              <span className="text-xs text-gray-500">risk level</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {myScore
                ? `Last updated ${new Date(myScore.calculatedAt).toLocaleString()}`
                : 'Calculating your score…'}
            </p>
          </div>

          {/* Factor breakdown */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-3">📊 Score Factors</h2>
            <FactorRow
              icon="🎣"
              label="Phishing Clicks"
              sub="last 30 days — increases score"
              value={myScore?.factors?.phishingClicks ?? 0}
              good={myScore?.factors?.phishingClicks === 0}
            />
            <FactorRow
              icon="🔓"
              label="Credentials Submitted"
              sub="on phishing pages — high penalty"
              value={myScore?.factors?.credentialsSubmitted ?? 0}
              good={myScore?.factors?.credentialsSubmitted === 0}
            />
            <FactorRow
              icon="🚨"
              label="Threats Reported"
              sub="last 30 days — decreases score"
              value={myScore?.factors?.reportedThreats ?? 0}
              good={(myScore?.factors?.reportedThreats ?? 0) > 0}
            />
            <FactorRow
              icon="📚"
              label="Training Completion"
              sub="percentage of assigned modules done"
              value={`${myScore?.factors?.trainingCompletion ?? 0}%`}
              good={(myScore?.factors?.trainingCompletion ?? 0) === 100}
            />
            <FactorRow
              icon="⚡"
              label="Avg. Time to Report"
              sub="minutes from receipt to report"
              value={
                myScore?.factors?.timeToReport
                  ? `${myScore.factors.timeToReport} min`
                  : '—'
              }
              good={myScore?.factors?.timeToReport > 0 && myScore.factors.timeToReport < 5}
            />
          </div>
        </div>
      </div>

      {/* ── Score history chart ── */}
      {chartData.length > 1 && (
        <div className="card mb-8">
          <h2 className="font-semibold text-gray-800 mb-4">📈 My Score History</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [`${v}/100`, 'Risk Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 10, fill: '#22c55e' }} />
              <ReferenceLine y={55} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'High', fontSize: 10, fill: '#f97316' }} />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', fontSize: 10, fill: '#ef4444' }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={LEVEL_COLOR[level]}
                strokeWidth={2}
                dot={{ r: 4, fill: LEVEL_COLOR[level] }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Score tips ── */}
      <div className="card mb-8 bg-brand-50 border border-brand-100">
        <h2 className="font-semibold text-brand-800 mb-3">💡 How to Improve Your Score</h2>
        <ul className="space-y-1.5 text-sm text-brand-700">
          <li>✅ Complete all assigned training modules <span className="text-brand-500">(−20 pts)</span></li>
          <li>✅ Report phishing emails instead of just deleting them <span className="text-brand-500">(−8 pts each)</span></li>
          <li>✅ Report quickly — under 5 minutes earns a speed bonus <span className="text-brand-500">(−5 pts)</span></li>
          <li>❌ Never click links in simulated phishing emails <span className="text-brand-500">(+15 pts each)</span></li>
          <li>❌ Never submit credentials on a phishing page <span className="text-brand-500">(+20 pts)</span></li>
        </ul>
      </div>

      {/* ── Org leaderboard (admin / manager) ── */}
      {isPrivileged && (
        <div className="card overflow-x-auto p-0">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">🏢 Organisation Risk Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest score per user — sorted highest risk first</p>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">⚠️</div>
              <p>No risk scores calculated yet. Ask users to recalculate their scores.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Dept</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Clicks</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Training %</th>
                  <th className="px-6 py-3">Updated</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scores.map((s, idx) => {
                  const isSelf  = String(s.user?._id ?? s.user) === String(user._id);
                  const lvl     = levelFromScore(s.score);
                  const isCalcing = recalcing === String(s.user?._id ?? s.user);
                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-brand-50' : ''}`}
                    >
                      <td className="px-6 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {s.user?.name ?? '—'}
                        {isSelf && <span className="ml-1 text-xs text-brand-500">(you)</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{s.user?.department || '—'}</td>
                      <td className="px-6 py-3">
                        <span className="font-bold" style={{ color: LEVEL_COLOR[lvl] }}>
                          {s.score}
                        </span>
                        <span className="text-gray-400">/100</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={LEVEL_CLASS[lvl]}>{lvl}</span>
                      </td>
                      <td className="px-6 py-3">{s.factors?.phishingClicks ?? 0}</td>
                      <td className="px-6 py-3">{s.factors?.credentialsSubmitted ?? 0}</td>
                      <td className="px-6 py-3">{s.factors?.trainingCompletion ?? 0}%</td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {new Date(s.calculatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => recalculate(String(s.user?._id ?? s.user))}
                          disabled={!!recalcing}
                          className="text-xs text-brand-600 hover:underline disabled:opacity-40"
                        >
                          {isCalcing ? '⏳' : '↺ Recalc'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Risk;
