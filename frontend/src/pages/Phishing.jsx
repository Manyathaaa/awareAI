import { useEffect, useState } from 'react';
import { phishingAPI } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';

const eventBadge = {
  sent:      'bg-gray-100 text-gray-600',
  opened:    'bg-blue-100 text-blue-700',
  clicked:   'bg-orange-100 text-orange-700',
  submitted: 'bg-red-100 text-red-700',
  reported:  'bg-green-100 text-green-700',
};

const Phishing = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    phishingAPI.getEvents()
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const visible = filter ? events.filter((e) => e.eventType === filter) : events;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Phishing Events</h1>
        <p className="text-sm text-gray-500 mt-1">Track user interactions with simulated phishing campaigns</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'sent', 'opened', 'clicked', 'submitted', 'reported'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filter === t
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
            }`}
          >
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🎣</div>
          <p>No phishing events recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Campaign</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800">{e.user?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{e.campaign?.name ?? '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${eventBadge[e.eventType]}`}>
                      {e.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">{e.user?.department || '—'}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Phishing;
