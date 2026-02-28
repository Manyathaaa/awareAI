import { useEffect, useState } from 'react';
import { riskAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import StatCard from '../components/StatCard.jsx';

const levelClass = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', critical: 'badge-critical' };

const Risk = () => {
  const { user } = useAuth();
  const [scores, setScores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [recalcing, setRecalcing] = useState(false);

  const load = () => {
    setLoading(true);
    riskAPI.getAll()
      .then((r) => setScores(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const recalculate = async (userId) => {
    setRecalcing(true);
    try {
      await riskAPI.recalculate(userId);
      load();
    } finally {
      setRecalcing(false);
    }
  };

  if (loading) return <Spinner />;

  const myScore = scores.find((s) => String(s.user?._id ?? s.user) === String(user._id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Risk Scores</h1>
        <p className="text-sm text-gray-500 mt-1">Security risk assessment across your organisation</p>
      </div>

      {/* My score */}
      {myScore && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="My Risk Score" icon="⚠️" color={myScore.level === 'low' ? 'green' : myScore.level === 'critical' ? 'red' : 'orange'}
            value={`${myScore.score}/100`} sub={`Level: ${myScore.level}`} />
          <StatCard label="Phishing Clicks" icon="🖱️" color="orange"
            value={myScore.factors?.phishingClicks ?? 0} sub="last 30 days" />
          <StatCard label="Training Completion" icon="📚" color="green"
            value={`${myScore.factors?.trainingCompletion ?? 0}%`} sub="of assigned modules" />
        </div>
      )}

      {/* Recalculate my score */}
      <div className="mb-6">
        <button
          onClick={() => recalculate(user._id)}
          disabled={recalcing}
          className="btn-secondary text-sm"
        >
          {recalcing ? 'Recalculating…' : '🔄 Recalculate My Score'}
        </button>
      </div>

      {/* All scores (admin/manager) */}
      {scores.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">⚠️</div>
          <p>No risk scores calculated yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Level</th>
                <th className="px-6 py-3">Clicks</th>
                <th className="px-6 py-3">Training %</th>
                <th className="px-6 py-3">Calculated</th>
                {['admin', 'manager'].includes(user.role) && <th className="px-6 py-3">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scores.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800">{s.user?.name ?? '—'}</td>
                  <td className="px-6 py-3">{s.score}/100</td>
                  <td className="px-6 py-3">
                    <span className={levelClass[s.level]}>{s.level}</span>
                  </td>
                  <td className="px-6 py-3">{s.factors?.phishingClicks ?? 0}</td>
                  <td className="px-6 py-3">{s.factors?.trainingCompletion ?? 0}%</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(s.calculatedAt).toLocaleDateString()}
                  </td>
                  {['admin', 'manager'].includes(user.role) && (
                    <td className="px-6 py-3">
                      <button
                        onClick={() => recalculate(s.user?._id)}
                        disabled={recalcing}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Recalc
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Risk;
