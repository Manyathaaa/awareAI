import { useState, useEffect } from 'react';
import { trainingAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const CATEGORY_META = {
  phishing:             { icon: '🎣', label: 'Phishing',           color: 'bg-orange-100 text-orange-700' },
  password:             { icon: '🔑', label: 'Passwords',          color: 'bg-blue-100   text-blue-700'   },
  'social-engineering': { icon: '🎭', label: 'Social Engineering', color: 'bg-purple-100 text-purple-700' },
  'data-privacy':       { icon: '🏛️', label: 'Data Privacy',       color: 'bg-green-100  text-green-700'  },
  general:              { icon: '📚', label: 'General Security',   color: 'bg-gray-100   text-gray-700'   },
};

const FILTERS = ['All', 'Pending', 'Completed'];

function completionForUser(training, userId) {
  if (!training.completedBy) return null;
  return training.completedBy.find((c) => String(c.user) === String(userId)) || null;
}

/* ── Markdown-lite renderer ───────────────────────────────────────────────── */
function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## '))
          return <h3 key={i} className="text-base font-bold text-gray-900 mt-4 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith('### '))
          return <h4 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-0.5">{line.slice(4)}</h4>;
        if (/^[-•✅]/.test(line))
          return (
            <p key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="shrink-0">{/^✅/.test(line) ? '✅' : '•'}</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(line.replace(/^[-•✅]\s*/, '')) }} />
            </p>
          );
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: boldify(line) }} />;
      })}
    </div>
  );
}
const boldify = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/* ── Create Module Modal ─────────────────────────────────────────────────── */
function CreateModal({ onClose, onCreated }) {
  const EMPTY_Q = { question: '', options: ['', '', '', ''], correctIndex: 0 };
  const [form, setForm] = useState({
    title: '', description: '', category: 'general',
    durationMinutes: 15, passingScore: 70, content: '',
    questions: [{ ...EMPTY_Q, options: [...EMPTY_Q.options] }],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setQ = (qi, key, val) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, [key]: val } : q) }));
  const setOpt = (qi, oi, val) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => j === oi ? val : o) }
      ),
    }));
  const addQ = () =>
    setForm((f) => ({ ...f, questions: [...f.questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }] }));
  const removeQ = (qi) =>
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setSaving(true);
    try {
      const { data } = await trainingAPI.create(form);
      onCreated(data); onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to create module');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center py-8 px-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Create Training Module</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.title} onChange={(e) => setField('title', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.category} onChange={(e) => setField('category', e.target.value)}>
                {Object.entries(CATEGORY_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (mins)</label>
              <input type="number" min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.durationMinutes} onChange={(e) => setField('durationMinutes', +e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <textarea rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Lesson Content (Markdown supported)</label>
              <textarea rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.content} onChange={(e) => setField('content', e.target.value)}
                placeholder="## Introduction&#10;Write lesson content here..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Passing Score (%)</label>
              <input type="number" min="1" max="100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.passingScore} onChange={(e) => setField('passingScore', +e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">Quiz Questions</h3>
              <button type="button" onClick={addQ} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Add Question</button>
            </div>
            {form.questions.map((q, qi) => (
              <div key={qi} className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Q{qi + 1}</span>
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => removeQ(qi)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  )}
                </div>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Question text" value={q.question}
                  onChange={(e) => setQ(qi, 'question', e.target.value)} required />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi}
                      onChange={() => setQ(qi, 'correctIndex', oi)} className="accent-green-600"
                      title="Mark as correct answer" />
                    <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder={`Option ${oi + 1}`} value={opt}
                      onChange={(e) => setOpt(qi, oi, e.target.value)} required />
                  </div>
                ))}
                <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Training Detail / Quiz View ─────────────────────────────────────────── */
function TrainingDetail({ trainingId, userId, onBack, onCompleted }) {
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lesson'); // 'lesson' | 'quiz' | 'result'
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    trainingAPI.getOne(trainingId)
      .then(({ data }) => { setTraining(data); setAnswers(new Array(data.questions?.length || 0).fill(-1)); })
      .catch(() => setErr('Failed to load training'))
      .finally(() => setLoading(false));
  }, [trainingId]);

  const submitQuiz = async () => {
    if (answers.some((a) => a === -1)) { setErr('Please answer all questions before submitting.'); return; }
    setErr(''); setSubmitting(true);
    try {
      const { data } = await trainingAPI.submit(training._id, { answers });
      setResult(data); setView('result'); onCompleted?.();
    } catch (e) {
      setErr(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const retake = () => { setAnswers(new Array(training.questions.length).fill(-1)); setResult(null); setView('lesson'); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
  if (!training) return <div className="text-center py-20 text-gray-500">{err || 'Training not found'}</div>;

  const meta = CATEGORY_META[training.category] || CATEGORY_META.general;
  const completion = completionForUser(training, userId);
  const answeredCount = answers.filter((a) => a !== -1).length;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        ← Back to modules
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Title bar */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{training.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                <span className="text-xs text-gray-400">⏱ {training.durationMinutes} min</span>
                <span className="text-xs text-gray-400">📋 {training.questions?.length || 0} questions</span>
                <span className="text-xs text-gray-400">🏁 Pass: {training.passingScore}%</span>
                {completion && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    completion.score >= training.passingScore ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>Previous: {completion.score}%</span>
                )}
              </div>
            </div>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-1 mt-4">
            {['lesson', 'quiz'].map((tab) => (
              <button key={tab} onClick={() => { if (view !== 'result') setView(tab); setErr(''); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab === 'lesson' ? '📖 Lesson' : `📝 Quiz (${training.questions?.length || 0})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* LESSON */}
          {view === 'lesson' && (
            <div>
              <p className="text-gray-600 text-sm mb-6">{training.description}</p>
              {training.content ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <Markdown text={training.content} />
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">No lesson content provided for this module.</p>
              )}
              {training.contentUrl && (
                <a href={training.contentUrl} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  🔗 External resource
                </a>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={() => setView('quiz')}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Start Quiz →
                </button>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {view === 'quiz' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{answeredCount} / {training.questions.length} answered</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${training.questions.length ? (answeredCount / training.questions.length) * 100 : 0}%` }} />
                </div>
              </div>

              {training.questions.map((q, qi) => (
                <div key={qi} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    <span className="text-blue-500 mr-2">Q{qi + 1}.</span>{q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button key={oi} type="button"
                        onClick={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                          answers[qi] === oi
                            ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'
                        }`}>
                        <span className="font-semibold mr-2 text-gray-400">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

              <div className="flex justify-between items-center pt-2">
                <button onClick={() => setView('lesson')} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back to lesson
                </button>
                <button onClick={submitQuiz} disabled={submitting}
                  className="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Submitting…' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          )}

          {/* RESULT */}
          {view === 'result' && result && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 text-center ${
                result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-5xl mb-2">{result.passed ? '🏆' : '📚'}</div>
                <div className={`text-4xl font-black mb-1 ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
                  {result.score}%
                </div>
                <p className={`text-sm font-semibold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
                  {result.passed ? 'Passed!' : 'Not passed — review the lesson and try again'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.correct} of {result.total} correct · Pass mark: {training.passingScore}%
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700">Answer Breakdown</h3>
                {result.feedback.map((f, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${
                    f.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{f.correct ? '✅' : '❌'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{f.question}</p>
                        {!f.correct && (
                          <p className="text-xs text-gray-600 mt-1">
                            Your answer:{' '}
                            <span className="text-red-600 font-medium">
                              {training.questions[i]?.options?.[f.chosen] || 'Not answered'}
                            </span>
                            <br />
                            Correct:{' '}
                            <span className="text-green-700 font-medium">
                              {training.questions[i]?.options?.[f.correctIndex]}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center pt-2">
                {!result.passed && (
                  <button onClick={retake}
                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Retake Quiz
                  </button>
                )}
                <button onClick={onBack}
                  className="px-5 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  Back to modules
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
const Training = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const canManage = ['admin', 'manager'].includes(user?.role);

  const fetchTrainings = () => {
    setLoading(true);
    trainingAPI.getAll()
      .then(({ data }) => setTrainings(data))
      .catch(() => setErr('Failed to load training modules'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainings(); }, []);

  if (selectedId) {
    return (
      <div className="p-6">
        <TrainingDetail
          trainingId={selectedId}
          userId={user?._id}
          userRole={user?.role}
          onBack={() => { setSelectedId(null); fetchTrainings(); }}
          onCompleted={fetchTrainings}
        />
      </div>
    );
  }

  const filtered = trainings.filter((t) => {
    const completion = completionForUser(t, user?._id);
    const passed = completion && completion.score >= t.passingScore;
    if (filter === 'Completed' && !passed) return false;
    if (filter === 'Pending' && passed) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = trainings.filter((t) => {
    const c = completionForUser(t, user?._id);
    return c && c.score >= t.passingScore;
  }).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => setTrainings((prev) => [t, ...prev])}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Training</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} of {trainings.length} modules completed
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            + New Module
          </button>
        )}
      </div>

      {/* Overall progress */}
      {trainings.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((completedCount / trainings.length) * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / trainings.length) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {Object.entries(CATEGORY_META).map(([k, v]) => {
              const total = trainings.filter((t) => t.category === k).length;
              if (total === 0) return null;
              const done = trainings.filter((t) => {
                if (t.category !== k) return false;
                const c = completionForUser(t, user?._id);
                return c && c.score >= t.passingScore;
              }).length;
              return (
                <div key={k} className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{v.icon}</span>
                  <span>{done}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{f}</button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={() => setCategoryFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            categoryFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>All Topics</button>
        {Object.entries(CATEGORY_META).map(([k, v]) => (
          <button key={k} onClick={() => setCategoryFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === k ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{v.icon} {v.label}</button>
        ))}
      </div>

      {err && <div className="text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">{err}</div>}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No modules found</h3>
          <p className="text-gray-400 text-sm">
            {filter !== 'All' || categoryFilter !== 'All'
              ? 'Try a different filter'
              : canManage
                ? 'Click "+ New Module" to create the first training module'
                : 'No training modules are available yet'}
          </p>
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const meta = CATEGORY_META[t.category] || CATEGORY_META.general;
          const completion = completionForUser(t, user?._id);
          const passed = completion && completion.score >= t.passingScore;

          return (
            <div key={t._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="px-5 pt-5 pb-3 flex-1">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                      {passed && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">✅ Passed</span>}
                      {completion && !passed && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                          {completion.score}% — Retry
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">{t.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{t.description}</p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>⏱ {t.durationMinutes} min</span>
                  <span>📋 {t.questions?.length || 0} q</span>
                  <span>🏁 {t.passingScore}%</span>
                </div>

                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    passed ? 'bg-green-500' : completion ? 'bg-yellow-400' : 'bg-gray-200'
                  }`} style={{ width: passed ? '100%' : completion ? `${completion.score}%` : '0%' }} />
                </div>
              </div>

              <div className="px-5 pb-4 pt-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">{t.completedBy?.length || 0} completed</span>
                <button onClick={() => setSelectedId(t._id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    passed
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  {passed ? 'Review' : completion ? 'Retake' : 'Start →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Training;

