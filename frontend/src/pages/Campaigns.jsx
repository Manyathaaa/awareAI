import { useEffect, useState } from 'react';
import { campaignAPI } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';

const statusColor = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

const empty = { name: '', description: '', type: 'phishing', status: 'draft', emailTemplate: '', phishingUrl: '' };

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => {
    setLoading(true);
    campaignAPI.getAll()
      .then((r) => setCampaigns(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await campaignAPI.create(form);
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await campaignAPI.remove(id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage phishing & awareness campaigns</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">+ New Campaign</button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📣</div>
          <p>No campaigns yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div key={c._id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                    {c.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 capitalize">
                    {c.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{c.description || 'No description'}</p>
                <div className="flex gap-6 text-xs text-gray-400">
                  <span>📤 Sent: <strong>{c.stats?.sent ?? 0}</strong></span>
                  <span>👁️ Opened: <strong>{c.stats?.opened ?? 0}</strong></span>
                  <span>🖱️ Clicked: <strong>{c.stats?.clicked ?? 0}</strong></span>
                  <span>🚨 Reported: <strong>{c.stats?.reported ?? 0}</strong></span>
                </div>
              </div>
              <button
                onClick={() => remove(c._id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">New Campaign</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" required value={form.name} onChange={handle} className="input" placeholder="Q2 Phishing Simulation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handle} className="input" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handle} className="input">
                    <option value="phishing">Phishing</option>
                    <option value="training">Training</option>
                    <option value="awareness">Awareness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handle} className="input">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phishing URL</label>
                <input name="phishingUrl" value={form.phishingUrl} onChange={handle} className="input" placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating…' : 'Create Campaign'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
