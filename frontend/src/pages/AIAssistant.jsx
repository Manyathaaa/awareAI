import { useEffect, useState, useRef } from 'react';
import { aiAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

/* ─── helpers ─────────────────────────────────────────────── */
const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const priorityColor = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
};

const priorityIcon = { high: '🔴', medium: '🟡', low: '🟢' };

const severityColor = {
  high:   'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  low:    'text-blue-600 bg-blue-50 border-blue-200',
};

const riskColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score < 40) return 'text-green-600';
  if (score < 70) return 'text-yellow-600';
  return 'text-red-600';
};

const SUGGESTIONS = [
  'How do I spot a phishing email?',
  'What is MFA and why does it matter?',
  'How do I create a strong password?',
  'What should I do if I clicked a suspicious link?',
  'Explain ransomware and how to prevent it',
  'What is social engineering?',
  'How is my risk score calculated?',
  'What is GDPR?',
];

/* ─── Markdown-lite renderer ──────────────────────────────── */
const renderText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    const parts = line.split(/\*\*(.*?)\*\*/g).map((chunk, j) =>
      j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk
    );
    return (
      <span key={i} className="block">
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

/* ─── TABS ─────────────────────────────────────────────────── */
const TABS = ['💬 Chat', '📊 Analysis', '📋 Recommendations'];

const AIAssistant = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  /* ── Chat state ── */
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AwareAI Security Assistant.\n\nAsk me anything about cybersecurity — phishing, passwords, MFA, ransomware, GDPR, and more.\n\nOr try one of the suggestions below ⬇️`,
      time: now(),
    },
  ]);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* ── Analysis state ── */
  const [analysis, setAnalysis]         = useState(null);
  const [loadingAnalysis, setLoadAnalysis] = useState(false);
  const [analysisError, setAnalysisError]  = useState('');

  /* ── Recommendations state ── */
  const [recs, setRecs]             = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError]     = useState('');

  /* auto-scroll chat */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  /* focus input when tab switches to chat */
  useEffect(() => {
    if (activeTab === 0) inputRef.current?.focus();
  }, [activeTab]);

  /* ── Chat send ── */
  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg, time: now() }]);
    setSending(true);
    try {
      const r = await aiAPI.chat(msg);
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: r.data.reply, category: r.data.category, time: now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: '⚠️ Sorry, I couldn\'t process that. Please try again.', time: now() },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ── Load analysis ── */
  const loadAnalysis = async () => {
    setLoadAnalysis(true);
    setAnalysisError('');
    try {
      const r = await aiAPI.analyze(user._id);
      setAnalysis(r.data);
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Failed to load analysis');
    } finally {
      setLoadAnalysis(false);
    }
  };

  /* ── Load recommendations ── */
  const loadRecs = async () => {
    setLoadingRecs(true);
    setRecsError('');
    try {
      const r = await aiAPI.recommendations(user._id);
      setRecs(r.data);
    } catch (err) {
      setRecsError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  /* ── Auto-load analysis + recs when switching to those tabs ── */
  useEffect(() => {
    if (activeTab === 1 && !analysis && !loadingAnalysis) loadAnalysis();
    if (activeTab === 2 && !recs && !loadingRecs)         loadRecs();
  }, [activeTab]);          // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI Security Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions, analyse your behaviour, and get personalised recommendations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ══ TAB 0 — CHAT ══════════════════════════════════════════ */}
      {activeTab === 0 && (
        <div className="card flex flex-col" style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {m.role === 'assistant' ? renderText(m.text) : m.text}
                  </div>
                  <span className="text-xs text-gray-400 px-1">{m.time}</span>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 uppercase">
                    {user?.name?.[0] ?? 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm flex-shrink-0">
                  🤖
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — show only when one message */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 py-3 border-t border-gray-100">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2 border-t border-gray-200 pt-4 mt-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="input flex-1"
              placeholder="Ask about phishing, passwords, MFA, GDPR…"
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary px-5 disabled:opacity-40"
            >
              Send
            </button>
          </form>
          {input.length > 400 && (
            <p className="text-xs text-gray-400 text-right mt-1">{input.length}/500</p>
          )}
        </div>
      )}

      {/* ══ TAB 1 — ANALYSIS ════════════════════════════════════ */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">AI-powered behaviour analysis based on your phishing events and training.</p>
            <button onClick={loadAnalysis} disabled={loadingAnalysis} className="btn-secondary text-sm">
              {loadingAnalysis ? 'Analysing…' : '🔄 Refresh'}
            </button>
          </div>

          {loadingAnalysis && <div className="card flex justify-center py-16"><Spinner /></div>}

          {analysisError && (
            <div className="card border border-red-200 bg-red-50 text-red-700 text-sm p-4">{analysisError}</div>
          )}

          {analysis && !loadingAnalysis && (
            <>
              {/* Risk overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card text-center">
                  <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  <p className={`text-3xl font-bold ${riskColor(analysis.riskScore)}`}>
                    {analysis.riskScore ?? '—'}
                  </p>
                  <p className={`text-xs font-medium mt-1 capitalize ${riskColor(analysis.riskScore)}`}>
                    {analysis.riskLevel}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-gray-500 mb-1">Phishing Clicks</p>
                  <p className={`text-3xl font-bold ${analysis.summary.phishingClicks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.summary.phishingClicks}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-gray-500 mb-1">Threats Reported</p>
                  <p className={`text-3xl font-bold ${analysis.summary.threatsReported > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {analysis.summary.threatsReported}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-gray-500 mb-1">Training Done</p>
                  <p className={`text-3xl font-bold ${analysis.summary.completionPct === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {analysis.summary.completionPct}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {analysis.summary.trainingsCompleted}/{analysis.summary.trainingsAssigned} modules
                  </p>
                </div>
              </div>

              {/* Insight */}
              <div className="card border-l-4 border-brand-500 bg-brand-50">
                <p className="text-sm font-medium text-brand-800">💡 AI Insight</p>
                <p className="text-sm text-brand-700 mt-1">{analysis.insight}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Risk flags */}
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-3">⚠️ Risk Flags</h3>
                  {analysis.behaviorFlags.length === 0 ? (
                    <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">No risk flags detected 🎉</p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.behaviorFlags.map((f, i) => (
                        <li
                          key={i}
                          className={`text-sm px-3 py-2 rounded-lg border ${severityColor[f.severity]}`}
                        >
                          {f.flag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Positive flags */}
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-3">✅ Positive Behaviours</h3>
                  {analysis.positiveFlags.length === 0 ? (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                      Complete training and report threats to earn positive flags.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.positiveFlags.map((f, i) => (
                        <li key={i} className="text-sm px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700">
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Event breakdown */}
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-3">📈 Event Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                  {[
                    { label: 'Emails Opened', value: analysis.summary.phishingOpened, icon: '📧' },
                    { label: 'Links Clicked', value: analysis.summary.phishingClicks, icon: '🖱️' },
                    { label: 'Creds Submitted', value: analysis.summary.credentialsSubmitted, icon: '🔓' },
                    { label: 'Threats Reported', value: analysis.summary.threatsReported, icon: '🚨' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="font-bold text-gray-800">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right">
                Analysed at {new Date(analysis.analyzedAt).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}

      {/* ══ TAB 2 — RECOMMENDATIONS ═════════════════════════════ */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Personalised recommendations based on your phishing events, training, and risk score.</p>
            <button onClick={loadRecs} disabled={loadingRecs} className="btn-secondary text-sm">
              {loadingRecs ? 'Loading…' : '🔄 Refresh'}
            </button>
          </div>

          {loadingRecs && <div className="card flex justify-center py-16"><Spinner /></div>}

          {recsError && (
            <div className="card border border-red-200 bg-red-50 text-red-700 text-sm p-4">{recsError}</div>
          )}

          {recs && !loadingRecs && (
            <>
              {recs.recommendations.length === 0 ? (
                <div className="card text-center py-16">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="font-semibold text-gray-700">No urgent recommendations!</p>
                  <p className="text-sm text-gray-500 mt-1">Keep up the great security behaviour.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recs.recommendations.map((r, i) => (
                    <div
                      key={i}
                      className={`card border-l-4 ${
                        r.priority === 'high'   ? 'border-red-500' :
                        r.priority === 'medium' ? 'border-yellow-400' :
                                                   'border-green-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{priorityIcon[r.priority]}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[r.priority]}`}>
                              {r.priority}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{r.category}</span>
                          </div>
                          <p className="text-sm text-gray-700">{r.reason}</p>
                          <button
                            onClick={() => {
                              setActiveTab(0);
                              setTimeout(() => sendMessage(`Tell me more about ${r.category}`), 100);
                            }}
                            className="text-xs text-brand-600 hover:text-brand-800 mt-2 font-medium"
                          >
                            Ask AI about this →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 text-right">
                Generated at {new Date(recs.generatedAt).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
