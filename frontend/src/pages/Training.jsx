import { useEffect, useState } from 'react';
import { trainingAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

const sameId = (a, b) => String(a) === String(b);

const Training = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [active, setActive]       = useState(null);   // training being taken
  const [answers, setAnswers]     = useState([]);
  const [result, setResult]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trainingAPI.getAll()
      .then((r) => setTrainings(r.data))
      .finally(() => setLoading(false));
  }, []);

  const startTraining = async (t) => {
    const full = await trainingAPI.getOne(t._id);
    setActive(full.data);
    setAnswers(new Array(full.data.questions.length).fill(null));
    setResult(null);
  };

  const submitQuiz = async () => {
    if (answers.some((a) => a === null)) return alert('Please answer all questions');
    setSubmitting(true);
    try {
      const r = await trainingAPI.submit(active._id, { answers });
      setResult(r.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  // ── Quiz view ───────────────────────────────────────────────────
  if (active) return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => { setActive(null); setResult(null); }} className="text-sm text-brand-600 hover:underline mb-6 inline-block">
        ← Back to trainings
      </button>
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{active.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{active.description}</p>

        {result ? (
          <div className={`text-center py-8 ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
            <div className="text-6xl mb-4">{result.passed ? '🎉' : '😞'}</div>
            <p className="text-2xl font-bold">{result.score}%</p>
            <p className="mt-2">{result.passed ? 'You passed!' : 'You did not pass. Try again!'}</p>
            <p className="text-sm text-gray-400 mt-1">{result.correct}/{result.total} correct</p>
            <button onClick={() => { setActive(null); setResult(null); }} className="btn-primary mt-6">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {active.questions.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Q{qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[qi] === oi
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio" name={`q${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => {
                            const a = [...answers];
                            a[qi] = oi;
                            setAnswers(a);
                          }}
                          className="accent-brand-600"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={submitQuiz} disabled={submitting} className="btn-primary w-full mt-6">
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ── List view ───────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Training Modules</h1>
        <p className="text-sm text-gray-500 mt-1">Complete modules to improve your security skills</p>
      </div>

      {trainings.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📚</div>
          <p>No trainings available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainings.map((t) => {
            const done = t.completedBy?.some((c) => sameId(c.user, user._id));
            return (
              <div key={t._id} className="card flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📖</span>
                  <span className={done ? 'badge-low' : 'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium'}>
                    {done ? '✓ Completed' : 'Pending'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
                <p className="text-xs text-gray-400 mb-1 capitalize">{t.category} · {t.durationMinutes} min</p>
                <p className="text-sm text-gray-500 flex-1 mb-4">{t.description || 'No description'}</p>
                <button
                  onClick={() => startTraining(t)}
                  className={done ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
                >
                  {done ? 'Retake' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Training;
