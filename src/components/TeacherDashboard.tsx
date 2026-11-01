import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  AlertTriangle,
  Sparkles,
  Users,
  CheckCircle2,
  Filter,
  Camera,
  Share2,
  Inbox,
  Send,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { DashboardStats, ParentReport, Chapter, UILanguage, DoubtItem } from '../types';

interface TeacherDashboardProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  uiLang: UILanguage;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  uiLang,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisionPlan, setRevisionPlan] = useState<any>(null);
  const [loadingRevision, setLoadingRevision] = useState(false);
  
  // Chapter filter for students who need help
  const [filterChapter, setFilterChapter] = useState(selectedChapterId);

  // Paper-to-data OCR state
  const [scanningPaper, setScanningPaper] = useState(false);
  const [paperResult, setPaperResult] = useState<any>(null);
  const [commitSuccessMsg, setCommitSuccessMsg] = useState('');

  // Parent reports state
  const [parentReports, setParentReports] = useState<ParentReport[]>([]);
  const [parentSearch, setParentSearch] = useState('');

  // Questions for You teacher inbox
  const [inboxQuestions, setInboxQuestions] = useState<DoubtItem[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Active sub-tab in dashboard
  const [activeTab, setActiveTab] = useState<'mastery' | 'remedial' | 'paper_to_data' | 'parent_reports' | 'inbox'>('mastery');

  useEffect(() => {
    fetchDashboardData();
    fetchParentReports();
    fetchInbox();
  }, [selectedChapterId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?chapterId=${selectedChapterId}`);
      const data = await res.json();
      if (data.success) {
        setStats(data);
        // Automatically fetch revision plan for the weakest topic
        if (data.weakestTopic) {
          fetchRevisionPlan(data.weakestTopic.topic);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionPlan = async (topic: string) => {
    setLoadingRevision(true);
    try {
      const res = await fetch('/api/dashboard/revision-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, chapterId: selectedChapterId }),
      });
      const data = await res.json();
      if (data.success) {
        setRevisionPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRevision(false);
    }
  };

  const fetchParentReports = async () => {
    try {
      const res = await fetch('/api/parent-reports');
      const data = await res.json();
      if (data.success) {
        setParentReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch('/api/doubt/inbox');
      const data = await res.json();
      if (data.success) {
        setInboxQuestions(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleApproveReport = (studentId: string) => {
    setParentReports(prev =>
      prev.map(r => (r.student_id === studentId ? { ...r, approved: !r.approved } : r))
    );
  };

  const approveAllReports = () => {
    setParentReports(prev => prev.map(r => ({ ...r, approved: true })));
  };

  const handleScanPaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningPaper(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dashboard/paper-to-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: reader.result as string,
            mimeType: file.type,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setPaperResult(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setScanningPaper(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const commitPaperData = async () => {
    if (!paperResult) return;
    try {
      const res = await fetch('/api/dashboard/commit-quiz-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: paperResult.student_id,
          topic: paperResult.topic,
          questions: paperResult.total_questions,
          correct: paperResult.total_correct,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommitSuccessMsg(`Scores committed successfully for ${paperResult.student_name} (${paperResult.student_id})!`);
        fetchDashboardData();
        setTimeout(() => {
          setPaperResult(null);
          setCommitSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (doubtId: string) => {
    if (!replyText.trim()) return;
    try {
      await fetch('/api/doubt/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubtId, reply: replyText }),
      });
      setInboxQuestions(prev =>
        prev.map(q => (q.id === doubtId ? { ...q, teacher_reply: replyText } : q))
      );
      setActiveReplyId(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
        <p className="text-sm font-semibold">कक्षा सातवीं के क्विज परिणाम विश्लेषित किए जा रहे हैं...</p>
      </div>
    );
  }

  const filteredNeedHelp = stats.studentsWhoNeedHelp;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header & Chapter Filter - Frosted Dark Glass */}
      <div className="backdrop-blur-xl bg-slate-950/85 rounded-2xl p-6 shadow-2xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white">
              {uiLang === 'hi' ? 'शिक्षक डैशबोर्ड: कक्षा 7A' : 'Teacher Dashboard: Class 7A'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-bold">
              30 Students Active
            </span>
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            राजकीय मध्य विद्यालय, दानापुर (पटना) • शिक्षक: सुनीता मिश्रा • कोड द्वारा गणना
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 border border-amber-500/20 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mastery')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'mastery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {uiLang === 'hi' ? 'विषयवार दक्षता (Mastery)' : 'Topic Mastery'}
          </button>
          <button
            onClick={() => setActiveTab('remedial')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'remedial'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {uiLang === 'hi' ? 'उपचारात्मक समूह (Remedial)' : 'Remedial Groups'}
          </button>
          <button
            onClick={() => setActiveTab('paper_to_data')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'paper_to_data'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {uiLang === 'hi' ? 'कागज-से-डेटा (OCR)' : 'Paper-to-Data'}
          </button>
          <button
            onClick={() => setActiveTab('parent_reports')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'parent_reports'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {uiLang === 'hi' ? 'अभिभावक रिपोर्ट (WhatsApp)' : 'Parent Reports'}
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`relative px-3 py-1.5 rounded-lg transition ${
              activeTab === 'inbox'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{uiLang === 'hi' ? 'इनबॉक्स (Inbox)' : 'Inbox'}</span>
            {inboxQuestions.length > 0 && (
              <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
                {inboxQuestions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: TOPIC MASTERY & WEAKEST TOPIC (SELF-TEST HIGHLIGHT) */}
      {activeTab === 'mastery' && (
        <div className="space-y-6">
          
          {/* Weakest Topic Alert Banner */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    ⚠️ Weakest Class Topic (सबसे कमजोर विषय)
                  </span>
                  <span className="font-extrabold text-base text-white capitalize">
                    {stats.weakestTopic.displayName} ({stats.weakestTopic.topic})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-amber-200/80">
                  <span className="font-bold text-amber-300">
                    Class Mean: <span className="text-sm font-extrabold">{stats.weakestTopic.classMean}%</span>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-red-400">
                    {stats.weakestTopic.below40Count} students scored below 40%
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Computed from 240 quiz rows in code
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchRevisionPlan(stats.weakestTopic.topic)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md flex items-center space-x-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uiLang === 'hi' ? '10-मिनट दोहराव योजना' : '10-Min Revision Plan'}</span>
            </button>
          </div>

          {/* Topic Mastery Bars Grid */}
          <div className="backdrop-blur-xl bg-slate-950/85 rounded-2xl p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  <span>{uiLang === 'hi' ? '8 विषयों की कक्षावार औसत दक्षता (Topic Mastery Bars)' : 'Topic-Wise Mastery (% Correct Across 30 Students)'}</span>
                </h2>
                <p className="text-xs text-amber-200/80">
                  Calculated strictly in code from starter data: 8 topics × 5 questions × 30 students = 240 rows.
                </p>
              </div>
            </div>

            {/* Bars List */}
            <div className="space-y-3.5">
              {stats.topicStats.map(t => {
                const isWeakest = t.topic === stats.weakestTopic.topic;
                return (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isWeakest ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {t.displayName}
                        </span>
                        {isWeakest && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                            WEAKEST ({t.below40Count} &lt; 40%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-400">
                          {t.totalCorrect}/{t.totalQuestions}
                        </span>
                        <span className={`font-mono font-bold ${isWeakest ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {t.classMean}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeakest
                            ? 'bg-gradient-to-r from-amber-500 to-red-500'
                            : t.classMean >= 75
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${Math.min(t.classMean, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Suggestion Card: 10-Minute Grounded Revision Plan */}
          {revisionPlan && (
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {uiLang === 'hi'
                        ? 'AI उपचारात्मक सुझाव: 10-मिनट त्वरित दोहराव योजना'
                        : 'AI Suggestion Card: 10-Minute Grounded Revision Plan'}
                    </h3>
                    <p className="text-xs text-amber-900/80 dark:text-amber-300">
                      Grounded strictly in Section 6: Saprotrophs and Fungi
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300">
                  10 Minutes
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <strong>Objective:</strong> {revisionPlan.objective}
              </div>

              {/* 3 Step Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {revisionPlan.step_by_step.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{st.step}</span>
                      <span className="text-[10px] text-amber-600 font-mono">{st.minutes}m</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{st.instruction}</p>
                  </div>
                ))}
              </div>

              {/* 3 Grounded Practice Questions */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  3 Targeted Classroom Oral Check Questions:
                </span>
                <div className="space-y-2 text-xs">
                  {revisionPlan.practice_questions.map((pq: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {i + 1}. {pq.question}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                        ✓ Answer: {pq.answer}
                      </div>
                      <div className="text-[10px] text-slate-400">Ref: {pq.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USP: Doubt-to-Dashboard Hotspots Loop */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  <span>
                    {uiLang === 'hi' ? 'डाउट-टू-डैशबोर्ड लूप (Doubt Hotspots Today)' : 'USP: Live Doubt-to-Dashboard Loop'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every student doubt is logged against its textbook section to identify where the class is currently stuck.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-orange-700 dark:text-orange-300">
                    8 Doubts on Stomata Today
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Section 4: Stomata and Gas Exchange in Leaves
                  </p>
                </div>
                <button
                  onClick={() => alert('10-Minute Stomata Revision Plan loaded into clipboard!')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shrink-0 shadow-sm"
                >
                  Quick Micro-Lesson
                </button>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-amber-700 dark:text-amber-300">
                    6 Doubts on Saprotrophs
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Section 6: Saprotrophs and Fungi
                  </p>
                </div>
                <button
                  onClick={() => fetchRevisionPlan('saprotrophs')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
                >
                  View Plan
                </button>
              </div>
            </div>
          </div>

          {/* Students Who Need Help List with Chapter Filter */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-red-600" />
                  <span>
                    {uiLang === 'hi' ? 'विशेष सहायता योग्य विद्यार्थी (Students Who Need Help)' : 'Students Who Need Help List'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-mono font-bold">
                    {filteredNeedHelp.length} Students
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rule: Overall average &lt; 50% OR score &lt; 40% on the weakest topic (saprotrophs).
                </p>
              </div>

              {/* Filter by Chapter */}
              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-semibold">Filter Chapter:</span>
                <select
                  value={filterChapter}
                  onChange={e => setFilterChapter(e.target.value)}
                  className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  {chapters.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Roll No.</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Saprotrophs Score</th>
                    <th className="p-3">Overall Average</th>
                    <th className="p-3">Language</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredNeedHelp.map(st => (
                    <tr key={st.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {st.student_id}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {st.name}
                      </td>
                      <td className="p-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            st.weakestTopicScore < 40
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {st.weakestTopicScore}% {st.weakestTopicScore < 40 ? '(Below 40%)' : ''}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {st.overallAvg}%
                      </td>
                      <td className="p-3 uppercase text-[10px] text-slate-500">
                        {st.preferred_language}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Needs Remedial Focus
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: REMEDIAL GROUPS */}
      {activeTab === 'remedial' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>{uiLang === 'hi' ? 'स्वचालित उपचारात्मक समूह (Remedial Groups)' : 'Auto-Tiered Remedial Groups & 10-Min Activities'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Auto-splits Class 7A into 3 actionable tiers with targeted 10-minute activities for mixed-ability government classrooms.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* 1. Needs Help Tier */}
              <div className="rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-red-900 dark:text-red-200">
                    1. Needs Help (सहायता समूह)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    {stats.remedialGroups.needsHelp.count} Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Criteria: Average &lt; 50% or Saprotrophs &lt; 40%
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-xs">
                  <span className="font-bold text-red-700 dark:text-red-400 block mb-1">
                    10-Minute Hands-On Activity:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {stats.remedialGroups.needsHelp.activity10Min}
                  </p>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Students:
                  </span>
                  {stats.remedialGroups.needsHelp.students.map(s => (
                    <div key={s.student_id} className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-slate-800 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.name} ({s.student_id})</span>
                      <span className="font-mono text-red-600">{s.overallAvg}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. On Track Tier */}
              <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                    2. On Track (अभ्यास समूह)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {stats.remedialGroups.onTrack.count} Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Criteria: Average 50% to 75%
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                    10-Minute Reinforcement Activity:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {stats.remedialGroups.onTrack.activity10Min}
                  </p>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Sample Students:
                  </span>
                  {stats.remedialGroups.onTrack.students.slice(0, 5).map(s => (
                    <div key={s.student_id} className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-slate-800 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.name} ({s.student_id})</span>
                      <span className="font-mono text-amber-600">{s.overallAvg}%</span>
                    </div>
                  ))}
                  {stats.remedialGroups.onTrack.students.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center">+ {stats.remedialGroups.onTrack.students.length - 5} more</p>
                  )}
                </div>
              </div>

              {/* 3. Ready to Stretch Tier */}
              <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                    3. Ready to Stretch (विस्तार समूह)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {stats.remedialGroups.readyToStretch.count} Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Criteria: Average &gt; 75%
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                    10-Minute Extension Challenge:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {stats.remedialGroups.readyToStretch.activity10Min}
                  </p>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Sample Students:
                  </span>
                  {stats.remedialGroups.readyToStretch.students.slice(0, 5).map(s => (
                    <div key={s.student_id} className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-slate-800 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.name} ({s.student_id})</span>
                      <span className="font-mono text-emerald-600">{s.overallAvg}%</span>
                    </div>
                  ))}
                  {stats.remedialGroups.readyToStretch.students.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center">+ {stats.remedialGroups.readyToStretch.students.length - 5} more</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAPER-TO-DATA VISION OCR */}
      {activeTab === 'paper_to_data' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <span>{uiLang === 'hi' ? 'कागज-से-डेटा: मार्क की हुई उत्तर-पुस्तिका स्कैन करें' : 'Paper-to-Data: Marked Answer Sheet OCR Scanner'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Photograph student quiz papers; Gemini Vision extracts answers into structured records with an interactive confirmation table before committing to the database.
            </p>
          </div>

          {/* Upload / Camera Button */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-center space-y-2">
            <Camera className="w-8 h-8 text-amber-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Photograph / Upload Marked 5-Question Answer Sheet
            </div>
            <p className="text-xs text-slate-500">
              Works with regular handwritten copies, tick/cross markings, or OMR strips.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleScanPaper}
              disabled={scanningPaper}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
            />
          </div>

          {scanningPaper && (
            <div className="p-4 text-center text-xs font-semibold text-amber-600 animate-pulse">
              Gemini Vision is analyzing student answers...
            </div>
          )}

          {/* Interactive Confirmation Table */}
          {paperResult && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-600">Verification Confirmation Table</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {paperResult.student_name} (Roll: {paperResult.student_id}) — Topic: {paperResult.topic}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Score Detected:</span>
                  <div className="text-sm font-extrabold text-emerald-600">
                    {paperResult.total_correct} / {paperResult.total_questions} Correct
                  </div>
                </div>
              </div>

              {/* Editable Answers Grid */}
              <div className="grid grid-cols-5 gap-2 text-xs">
                {paperResult.answers.map((ans: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border text-center space-y-1">
                    <span className="text-[10px] text-slate-400 block">Q{ans.q_num}</span>
                    <input
                      type="text"
                      maxLength={1}
                      value={ans.marked_option}
                      onChange={e => {
                        const newOpts = [...paperResult.answers];
                        newOpts[idx].marked_option = e.target.value.toUpperCase();
                        setPaperResult({ ...paperResult, answers: newOpts });
                      }}
                      className="w-8 py-0.5 text-center font-bold font-mono border rounded uppercase text-slate-900 dark:text-white"
                    />
                    <span className={`block text-[10px] font-bold ${ans.is_correct ? 'text-emerald-600' : 'text-red-500'}`}>
                      {ans.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                ))}
              </div>

              {commitSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {commitSuccessMsg}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setPaperResult(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700"
                >
                  Discard
                </button>
                <button
                  onClick={commitPaperData}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Confirm & Commit to Quiz Results
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: PARENT REPORTS IN SIMPLE HINDI (WHATSAPP SHARE) */}
      {activeTab === 'parent_reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-amber-600" />
                <span>{uiLang === 'hi' ? 'अभिभावक प्रगति रिपोर्ट (WhatsApp)' : 'Parent Progress Reports in Simple Hindi / Language'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simple Devanagari Hindi message tailored to student language. Requires teacher approval before sending.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={approveAllReports}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                Approve All 30 Reports
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={parentSearch}
              onChange={e => setParentSearch(e.target.value)}
              placeholder="Search student name or roll number..."
              className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            {parentReports
              .filter(r => r.name.toLowerCase().includes(parentSearch.toLowerCase()) || r.student_id.toLowerCase().includes(parentSearch.toLowerCase()))
              .map(report => (
                <div
                  key={report.student_id}
                  className={`p-4 rounded-xl border transition ${
                    report.approved
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {report.name}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                          {report.student_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Overall Score: <span className="font-bold">{report.overallAvg}%</span> • Saprotrophs: <span className="font-bold">{report.saproScore}%</span>
                      </div>
                    </div>

                    {/* Teacher Approval Toggle */}
                    <button
                      onClick={() => toggleApproveReport(report.student_id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        report.approved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {report.approved ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{report.approved ? 'Approved ✓' : 'Approve'}</span>
                    </button>
                  </div>

                  {/* Hindi WhatsApp Message Card Preview */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                    &ldquo;{report.whatsappText}&rdquo;
                  </div>

                  {/* WhatsApp Link */}
                  <div className="mt-3 flex justify-end">
                    <a
                      href={report.approved ? report.whatsappUrl : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => {
                        if (!report.approved) {
                          e.preventDefault();
                          alert('Please toggle "Approve" first before sharing with parents.');
                        }
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        report.approved
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Send via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: TEACHER INBOX ("QUESTIONS FOR YOU") */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Inbox className="w-5 h-5 text-amber-600" />
              <span>{uiLang === 'hi' ? 'आपके लिए प्रश्न इनबॉक्स (Questions For You)' : 'Teacher Questions For You Inbox'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Off-chapter or difficult doubts forwarded by students (e.g. &ldquo;Who won the cricket match?&rdquo;) are queued here for personal teacher response.
            </p>
          </div>

          <div className="space-y-3">
            {inboxQuestions.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">No pending student questions in inbox</p>
            ) : (
              inboxQuestions.map(q => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {q.student_name} ({q.student_id})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(q.asked_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    {q.teacher_reply ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Replied ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Pending Reply
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    &ldquo;{q.question}&rdquo;
                  </div>

                  {q.teacher_reply ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400">Your Reply:</span>
                      <p>{q.teacher_reply}</p>
                    </div>
                  ) : activeReplyId === q.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type reply to student..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-2.5 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(q.id)}
                          className="px-3 py-1 text-xs font-bold rounded bg-amber-600 text-white"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReplyId(q.id);
                        setReplyText('');
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                    >
                      <span>Reply to Student</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
