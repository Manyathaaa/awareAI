import { useEffect, useState, useRef } from 'react';
import { aiAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages]           = useState([
    { role: 'assistant', text: "Hi! I'm your AwareAI security assistant 🤖 Ask me anything about cybersecurity, or I can analyse your risk profile." },
  ]);
  const [input, setInput]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [recommendations, setRecs]        = useState(null);
  const [loadingRecs, setLoadingRecs]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setSending(true);
    try {
      const r = await aiAPI.chat(userMsg);
      setMessages((m) => [...m, { role: 'assistant', text: r.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const r = await aiAPI.recommendations(user._id);
      setRecs(r.data);
    } finally {
      setLoadingRecs(false);
    }
  };

  const priorityColor = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Security Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">Ask questions, get recommendations, and analyse your risk profile</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat — 2/3 */}
        <div className="lg:col-span-2 card flex flex-col" style={{ minHeight: '500px' }}>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t pt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input flex-1"
              placeholder="Ask about phishing, passwords, policies…"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-5">
              Send
            </button>
          </form>
        </div>

        {/* Recommendations — 1/3 */}
        <div className="card flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-3">📋 My Recommendations</h2>
          <button
            onClick={loadRecommendations}
            disabled={loadingRecs}
            className="btn-secondary text-sm mb-4"
          >
            {loadingRecs ? 'Loading…' : 'Generate'}
          </button>

          {recommendations ? (
            <ul className="space-y-3 flex-1 overflow-y-auto">
              {recommendations.recommendations.map((r, i) => (
                <li key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={priorityColor[r.priority]}>{r.priority}</span>
                    <span className="text-xs text-gray-500 capitalize">{r.category}</span>
                  </div>
                  <p className="text-xs text-gray-600">{r.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 flex-1">
              Click "Generate" to get personalised training recommendations based on your behaviour.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
