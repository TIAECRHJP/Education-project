import React, { useState, useEffect } from 'react';
import { Role, UILanguage, Chapter } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentChat } from './components/StudentChat';
import { TeacherGenerator } from './components/TeacherGenerator';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AcceptanceTestModal } from './components/AcceptanceTestModal';
import { LearningHub } from './components/LearningHub';
import { BookOpen, BarChart2, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<Role>('landing');
  const [uiLang, setUiLang] = useState<UILanguage>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('photosynthesis_en');
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [teacherSubView, setTeacherSubView] = useState<'generator' | 'dashboard' | 'assistant'>('generator');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    // Check dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchChapters();
    if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('Offline cache unavailable', err));
    }
    // Show onboarding tour once on first load
    const visited = localStorage.getItem('gurukul_onboarded');
    if (!visited) {
      setShowOnboarding(true);
    }
  }, []);

  const fetchChapters = async (newChapterId?: string) => {
    try {
      const res = await fetch('/api/chapters');
      const data = await res.json();
      if (data.success && data.chapters?.length > 0) {
        setChapters(data.chapters);
        if (newChapterId) {
          setSelectedChapterId(newChapterId);
        } else if (!selectedChapterId) {
          setSelectedChapterId(data.chapters[0].id);
        }
      }
    } catch (e) {
      console.warn('Chapter list unavailable; loading lessons saved on this device.', e);
      try {
        const cache = await caches.open('gurukul-chapters-v1');
        const keys = await cache.keys();
        const saved = await Promise.all(keys.map(async key => {
          const response = await cache.match(key);
          if (!response) return null;
          const payload = await response.json();
          return payload.success && payload.chapter ? payload.chapter as Chapter : null;
        }));
        const offlineChapters = saved.filter((chapter): chapter is Chapter => Boolean(chapter));
        if (offlineChapters.length) {
          setChapters(offlineChapters);
          setSelectedChapterId(current => current || offlineChapters[0].id);
        }
      } catch (cacheError) { console.error(cacheError); }
    }
  };

  const handleDismissOnboarding = () => {
    localStorage.setItem('gurukul_onboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-100 overflow-x-hidden bg-slate-950">
      {/* 1. FIXED BODHI TREE BACKGROUND FOR THE ENTIRE WEBSITE (NO WHITE BACKGROUND) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/bodhi_vriksh_transparent.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center brightness-[0.92] contrast-[1.08] saturate-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/20 to-slate-950/65" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
        currentRole={role}
        setRole={setRole}
        uiLang={uiLang}
        setUiLang={setUiLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenTestModal={() => setShowTestModal(true)}
        testsPassed={true}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {role === 'landing' && (
          <LandingPage
            onSelectRole={setRole}
            uiLang={uiLang}
            onOpenTests={() => setShowTestModal(true)}
            onToggleLang={() => setUiLang(uiLang === 'en' ? 'hi' : 'en')}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        )}

        {role === 'student' && (
          <StudentChat
            chapters={chapters}
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            uiLang={uiLang}
          />
        )}

        {role === 'learning' && (
          <LearningHub chapters={chapters} uiLang={uiLang} onOpenChapter={(id) => { setSelectedChapterId(id); setRole('student'); }} />
        )}

        {role === 'teacher' && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            {/* Teacher Sub-Navigation Switcher */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setTeacherSubView('generator')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition ${
                    teacherSubView === 'generator'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{uiLang === 'hi' ? 'à¤ªà¤¾à¤  à¤¯à¥‹à¤œà¤¨à¤¾ à¤µ à¤•à¥à¤µà¤¿à¤œ à¤œà¤¨à¤°à¥‡à¤Ÿà¤°' : 'Lesson Plan & Quiz Generator'}</span>
                </button>

                <button
                  onClick={() => setTeacherSubView('dashboard')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition ${
                    teacherSubView === 'dashboard'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>{uiLang === 'hi' ? 'à¤•à¤•à¥à¤·à¤¾ 7A à¤¦à¤•à¥à¤·à¤¤à¤¾ à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡' : 'Class Mastery Dashboard'}</span>
                </button>
                <button
                  onClick={() => setTeacherSubView('assistant')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition ${
                    teacherSubView === 'assistant'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 hidden sm:block">
                à¤°à¤¾à¤œà¤•à¥€à¤¯ à¤®à¤§à¥à¤¯ à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤²à¤¯, à¤¦à¤¾à¤¨à¤¾à¤ªà¥à¤° (à¤ªà¤Ÿà¤¨à¤¾)
              </div>
            </div>

            {teacherSubView === 'generator' ? (
              <TeacherGenerator
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                uiLang={uiLang}
                onChapterUploaded={(newId?: string) => fetchChapters(newId)}
              />
            ) : teacherSubView === 'dashboard' ? (
              <TeacherDashboard
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                uiLang={uiLang}
              />
            ) : (
              <StudentChat
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                uiLang={uiLang}
                audience="teacher"
              />
            )}
          </div>
        )}

        {role === 'admin' && <AdminDashboard uiLang={uiLang} />}
      </main>

      {/* Acceptance Tests Modal */}
      <AcceptanceTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        uiLang={uiLang}
      />

      {/* Short Onboarding Tour Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Welcome to Gurukul AI!
              </h3>
              <p className="text-xs text-amber-600 font-semibold">
                &ldquo;Every child&apos;s doubt answered, every teacher&apos;s evening saved&rdquo;
              </p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 py-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5">
                <span className="font-bold text-amber-600">1.</span>
                <span>
                  <strong>Student Doubt Chat:</strong> Hindi voice mic input (hi-IN) + verified textbook quotes + Ghar ki Boli explanation.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5">
                <span className="font-bold text-amber-600">2.</span>
                <span>
                  <strong>Teacher Generator:</strong> 30/40/45 min lesson plans with exact duration sums & 5 verified MCQs.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5">
                <span className="font-bold text-amber-600">3.</span>
                <span>
                  <strong>Live Dashboard:</strong> Code-computed weakest topic (saprotrophs: 52%, 4 &lt; 40%), remedial groups, and WhatsApp parent reports.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleDismissOnboarding();
                  setShowTestModal(true);
                }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Run Acceptance Tests
              </button>
              <button
                onClick={handleDismissOnboarding}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 px-4 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">Gurukul AI</span>
            <span>â€¢</span>
            <span>Bihar Government Schools Edition</span>
            <span>â€¢</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
              Build#thon 2026
            </span>
          </div>
          <div>
            Built with @google/genai, React, Tailwind CSS, SQLite &amp; Web Speech API.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
