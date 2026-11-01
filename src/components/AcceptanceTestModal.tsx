import React, { useEffect, useState } from 'react';
import { CheckCircle2, CircleX, LoaderCircle, Play, X } from 'lucide-react';
import { UILanguage } from '../types';

interface AcceptanceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiLang: UILanguage;
}

interface TestResult {
  test_id: number;
  title: string;
  description: string;
  passed: boolean;
  details?: Record<string, unknown>;
}

export const AcceptanceTestModal: React.FC<AcceptanceTestModalProps> = ({ isOpen, onClose, uiLang }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setResults([]);
      setAllPassed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/run-acceptance-tests');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'The acceptance checks could not be completed.');
      }
      setResults(data.results || []);
      setAllPassed(Boolean(data.all_passed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The acceptance checks could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="acceptance-test-title" className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-950/95 text-slate-100 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-amber-500/20 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Gurukul AI</p>
            <h2 id="acceptance-test-title" className="mt-1 text-xl font-black text-white">{uiLang === 'hi' ? 'स्वीकृति जाँच' : 'Website self-check'}</h2>
            <p className="mt-1 text-sm text-slate-300">{uiLang === 'hi' ? 'मुख्य वेबसाइट सुविधाओं की जाँच करें।' : 'Check the main website features and data.'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[calc(88vh-150px)] space-y-4 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
            <div className="text-sm text-slate-200">
              {results.length > 0 ? `${results.filter(result => result.passed).length} / ${results.length} checks passed` : 'Five checks cover Q&A, quizzes, dashboard data, and chapter switching.'}
            </div>
            <button type="button" onClick={runTests} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {loading ? 'Running…' : results.length ? 'Run again' : 'Run checks'}
            </button>
          </div>

          {results.length > 0 && <div className="space-y-2">
            {results.map(result => (
              <article key={result.test_id} className={`rounded-2xl border p-4 ${result.passed ? 'border-emerald-500/30 bg-emerald-950/30' : 'border-rose-500/30 bg-rose-950/30'}`}>
                <div className="flex items-start gap-3">
                  {result.passed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />}
                  <div>
                    <h3 className="text-sm font-bold text-white">{result.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{result.description}</p>
                    {result.details && <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words text-[10px] text-slate-400">{JSON.stringify(result.details, null, 2)}</pre>}
                  </div>
                </div>
              </article>
            ))}
          </div>}

          {results.length > 0 && <p className={`rounded-xl p-3 text-sm font-bold ${allPassed ? 'bg-emerald-950/50 text-emerald-300' : 'bg-amber-950/50 text-amber-200'}`}>
            {allPassed ? 'All checks passed.' : 'Some checks need attention. Review the results above.'}
          </p>}

          {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}
        </div>
      </section>
    </div>
  );
};
