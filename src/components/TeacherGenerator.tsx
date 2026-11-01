import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Share2,
  Upload,
  Camera,
  FileText,
  ListOrdered,
  Layers,
  HelpCircle,
  Check,
  ChevronDown,
  Info,
  X,
  FileUp
} from 'lucide-react';
import { Chapter, LessonPlanOutput, UILanguage } from '../types';
import { translations } from '../translations';

interface TeacherGeneratorProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  uiLang: UILanguage;
  onChapterUploaded: (newChapterId?: string) => void;
}

export const TeacherGenerator: React.FC<TeacherGeneratorProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  uiLang,
  onChapterUploaded,
}) => {
  const t = translations[uiLang].generator;
  const tm = translations[uiLang].uploadModal;

  const [selectedClass, setSelectedClass] = useState('Class 7');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [periodLength, setPeriodLength] = useState<number>(40);
  const [language, setLanguage] = useState<'Hindi' | 'English'>(uiLang === 'hi' ? 'Hindi' : 'English');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlanOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Upload own chapter state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'text' | 'photo'>('text');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string>('');
  const [selectedImageMime, setSelectedImageMime] = useState<string>('');

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lesson-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapterId,
          className: selectedClass,
          subject: selectedSubject,
          periodLength,
          language,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        localStorage.setItem('gurukul_cached_lesson_plan', JSON.stringify(data.plan));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!plan) return;
    const textToCopy = `GURUKUL AI - LESSON PLAN & QUIZ
Class: ${plan.class} | Subject: ${plan.subject}
Chapter: ${plan.chapter}
Duration: ${plan.period_length_minutes} Minutes | Language: ${plan.language}

OBJECTIVES:
${plan.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

MATERIALS:
${plan.materials_needed.join(', ')}

BOARD DIAGRAM:
${plan.board_diagram_description}

TIMED LESSON FLOW (Adds up to ${plan.period_length_minutes} mins):
${plan.timed_flow.map(s => `• [${s.duration_minutes}m] ${s.step} (${s.section_ref}): ${s.teacher_activity}`).join('\n')}

5-QUESTION VERIFIED QUIZ:
${plan.quiz_questions.map((q, idx) => `Q${idx + 1}: ${q.q}\nOptions: ${q.options.join(' | ')}\nAnswer: ${q.answer} [${q.section}]`).join('\n\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printPlan = () => {
    window.print();
  };

  const shareOnWhatsApp = () => {
    if (!plan) return;
    const shareText = `*${uiLang === 'hi' ? 'गुरुकुल AI पाठ योजना' : 'Gurukul AI Lesson Plan'} (${plan.period_length_minutes} ${uiLang === 'hi' ? 'मिनट' : 'mins'})*\n*${uiLang === 'hi' ? 'कक्षा' : 'Class'}:* ${plan.class} - ${plan.subject}\n*${uiLang === 'hi' ? 'अध्याय' : 'Chapter'}:* ${plan.chapter}\n\n*${uiLang === 'hi' ? 'उद्देश्य' : 'Objectives'}:*\n${plan.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n*${uiLang === 'hi' ? '5-प्रश्न क्विज (सत्यापित उत्तर कुंजी)' : '5-Question Verified Quiz'}:*\n${plan.quiz_questions.map((q, i) => `${i + 1}. ${q.q} -> *${q.answer}* (${q.section})`).join('\n')}\n\n- ${uiLang === 'hi' ? 'राजकीय मध्य विद्यालय, बिहार' : 'Government Middle School, Bihar'}`;
    navigator.clipboard.writeText(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  // Text File Picker (.txt, .md)
  const handleTextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(txt|md|text)$/i.test(file.name)) {
      setUploadErrorMsg('Choose a .txt or .md text file.');
      e.target.value = '';
      return;
    }
    setUploadTab('text');
    setUploadErrorMsg('');
    setSelectedImageBase64('');
    setSelectedImageName('');

    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadContent(reader.result);
      }
    };
    reader.onerror = () => setUploadErrorMsg('The text file could not be read. Please try another file.');
    reader.readAsText(file);
  };

  // Image File Picker (.jpg, .png, etc.)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name)) {
      setUploadErrorMsg('Choose an image file for Photo Upload, or switch to Text / File Upload.');
      e.target.value = '';
      return;
    }
    setUploadTab('photo');
    setUploadErrorMsg('');

    setSelectedImageName(file.name);
    setSelectedImageMime(file.type);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
      }
    };
    reader.onerror = () => setUploadErrorMsg('The image could not be read. Please try another photo.');
    reader.readAsDataURL(file);
  };

  // Upload Submission Handler
  const handleSaveChapter = async () => {
    setUploadErrorMsg('');
    setUploadSuccessMsg('');

    // Check content
    const hasText = uploadContent.trim().length > 0;
    const hasImage = selectedImageBase64.length > 0;

    if (!hasText && !hasImage) {
      setUploadErrorMsg(tm.errorMsg);
      return;
    }

    setUploading(true);

    try {
      const payload: any = {
        title: uploadTitle.trim() || undefined,
        subject: selectedSubject,
        grade: selectedClass,
        language,
      };

      if (uploadTab === 'photo' && hasImage) {
        payload.imageBase64 = selectedImageBase64;
        payload.mimeType = selectedImageMime || 'image/jpeg';
        if (hasText) payload.content = uploadContent;
      } else {
        payload.content = uploadContent;
      }

      const res = await fetch('/api/chapters/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.chapter) {
        const newId = data.chapter.id;
        const count = data.chapter.sectionsCount || 1;
        setUploadSuccessMsg(
          uiLang === 'hi'
            ? `✓ अध्याय "${data.chapter.title}" सफलतापूर्वक सुरक्षित! (${count} अनुभाग बने)`
            : `✓ Chapter "${data.chapter.title}" saved successfully! (${count} sections parsed)`
        );

        // Notify parent and select new chapter
        onChapterUploaded(newId);
        onSelectChapter(newId);

        setTimeout(() => {
          setShowUploadModal(false);
          setUploadTitle('');
          setUploadContent('');
          setSelectedImageBase64('');
          setSelectedImageName('');
          setUploadSuccessMsg('');
          setUploadErrorMsg('');
        }, 1200);
      } else {
        setUploadErrorMsg(data.error || 'Failed to upload chapter');
      }
    } catch (err: any) {
      console.error(err);
      setUploadErrorMsg(err.message || 'Network error while uploading chapter');
    } finally {
      setUploading(false);
    }
  };

  // Subject mapping per class tier
  const getSubjectsForClass = (cls: string) => {
    const num = parseInt(cls.replace(/\D/g, ''), 10) || 7;
    if (num <= 5) {
      return [
        { id: 'EVS', name: 'पर्यावरण एवं विज्ञान (EVS & Science)' },
        { id: 'Mathematics', name: 'गणित (Mathematics)' },
        { id: 'Hindi', name: 'हिंदी (Hindi)' },
        { id: 'English', name: 'English (अंग्रेज़ी)' },
      ];
    } else if (num <= 8) {
      return [
        { id: 'Science', name: 'विज्ञान (Science)' },
        { id: 'Mathematics', name: 'गणित (Mathematics)' },
        { id: 'Social Science', name: 'सामाजिक विज्ञान (Social Science)' },
        { id: 'Hindi', name: 'हिंदी (Hindi)' },
        { id: 'English', name: 'English (अंग्रेज़ी)' },
        { id: 'Sanskrit', name: 'संस्कृत (Sanskrit)' },
      ];
    } else if (num <= 10) {
      return [
        { id: 'Science', name: 'विज्ञान (Science)' },
        { id: 'Mathematics', name: 'गणित (Mathematics)' },
        { id: 'Social Science', name: 'सामाजिक विज्ञान (Social Science)' },
        { id: 'Hindi', name: 'हिंदी (Hindi)' },
        { id: 'English', name: 'English (अंग्रेज़ी)' },
        { id: 'Sanskrit', name: 'संस्कृत (Sanskrit)' },
      ];
    } else {
      return [
        { id: 'Physics', name: 'भौतिकी (Physics)' },
        { id: 'Chemistry', name: 'रसायन विज्ञान (Chemistry)' },
        { id: 'Biology', name: 'जीव विज्ञान (Biology)' },
        { id: 'Mathematics', name: 'गणित (Mathematics)' },
        { id: 'English', name: 'English (अंग्रेज़ी)' },
        { id: 'Hindi', name: 'हिंदी (Hindi)' },
      ];
    }
  };

  const availableSubjects = getSubjectsForClass(selectedClass);

  // Filter chapters based on class and subject, or fallback to all available
  const relevantChapters = chapters.filter(c => {
    const matchesClass = !c.grade || c.grade.toLowerCase().includes(selectedClass.toLowerCase()) || c.grade.replace(/\D/g, '') === selectedClass.replace(/\D/g, '');
    const matchesSubject = !c.subject || c.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesClass && matchesSubject;
  });
  const displayChapters = relevantChapters.length > 0 ? relevantChapters : chapters;

  // Teacher Assistant Q&A State
  const [teacherDoubt, setTeacherDoubt] = useState('');
  const [askingTeacherDoubt, setAskingTeacherDoubt] = useState(false);
  const [teacherDoubtAnswer, setTeacherDoubtAnswer] = useState<any>(null);
  const [teacherDoubtError, setTeacherDoubtError] = useState('');

  const handleAskTeacherAssistant = async (queryText?: string) => {
    const question = (queryText || teacherDoubt).trim();
    if (!question || askingTeacherDoubt) return;

    setAskingTeacherDoubt(true);
    setTeacherDoubtError('');
    try {
      const res = await fetch('/api/teacher/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          preferredLanguage: language === 'Hindi' ? 'hi-IN' : 'en-IN',
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string; answer?: string };
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not get guidance. Please try again.');
      setTeacherDoubtAnswer(data);
    } catch (e) {
      console.error(e);
      setTeacherDoubtError(e instanceof Error ? e.message : 'Could not reach the assistant. Please check the server and try again.');
    } finally {
      setAskingTeacherDoubt(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Configuration Card - Frosted Glass Dark Tone */}
      <div className="backdrop-blur-xl bg-slate-950/80 rounded-2xl p-6 shadow-2xl border border-amber-500/30 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-amber-500/20 gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-amber-200/80 mt-0.5">
              {t.subtitle} • Classes 1 to 12 All Subjects Support
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 transition shadow-lg"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.uploadBtn}</span>
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5 text-xs">
          
          {/* Class Picker - Classes 1 to 12 */}
          <div>
            <label className="font-bold text-amber-200 mb-1.5 block">
              {t.classLabel} (1 to 12)
            </label>
            <select
              value={selectedClass}
              onChange={e => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                const newSubjs = getSubjectsForClass(newClass);
                if (!newSubjs.some(s => s.id === selectedSubject)) {
                  setSelectedSubject(newSubjs[0].id);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-slate-900/90 text-amber-100 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Class 1">Class 1 (कक्षा 1 - प्राथमिक)</option>
              <option value="Class 2">Class 2 (कक्षा 2 - प्राथमिक)</option>
              <option value="Class 3">Class 3 (कक्षा 3 - प्राथमिक)</option>
              <option value="Class 4">Class 4 (कक्षा 4 - प्राथमिक)</option>
              <option value="Class 5">Class 5 (कक्षा 5 - प्राथमिक)</option>
              <option value="Class 6">Class 6 (छठी - मध्य)</option>
              <option value="Class 7">Class 7 (सातवीं - मध्य)</option>
              <option value="Class 8">Class 8 (आठवीं - मध्य)</option>
              <option value="Class 9">Class 9 (नौवीं - माध्यमिक)</option>
              <option value="Class 10">Class 10 (दसवीं - बोर्ड)</option>
              <option value="Class 11">Class 11 (ग्यारहवीं - उच्चतर)</option>
              <option value="Class 12">Class 12 (बारहवीं - इंटरमीडिएट)</option>
            </select>
          </div>

          {/* Subject Picker - Dynamic by Grade */}
          <div>
            <label className="font-bold text-amber-200 mb-1.5 block">
              {t.subjectLabel}
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-slate-900/90 text-amber-100 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter / Topic Picker */}
          <div className="lg:col-span-1">
            <label className="font-bold text-amber-200 mb-1.5 block">
              {t.chapterLabel} ({displayChapters.length} उपलब्ध)
            </label>
            <select
              value={selectedChapterId}
              onChange={e => onSelectChapter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-slate-900/90 text-amber-100 font-semibold truncate focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {displayChapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Period Length */}
          <div>
            <label className="font-bold text-amber-200 mb-1.5 block">
              {t.durationLabel}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[30, 40, 45].map(len => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setPeriodLength(len)}
                  className={`py-2 rounded-lg font-bold transition text-xs ${
                    periodLength === len
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-slate-900/80 text-amber-200 border border-amber-500/20 hover:bg-slate-800'
                  }`}
                >
                  {len}m
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="font-bold text-amber-200 mb-1.5 block">
              {t.langLabel}
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(['Hindi', 'English'] as const).map(lng => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={`py-2 rounded-lg font-bold transition text-xs ${
                    language === lng
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-slate-900/80 text-amber-200 border border-amber-500/20 hover:bg-slate-800'
                  }`}
                >
                  {lng === 'Hindi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Generate Button */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-amber-300/80 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>एनसीईआरटी / एससीईआरटी बिहार पाठ्यपुस्तक आधारित प्रमाणित पाठ योजना</span>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 disabled:opacity-50 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? t.generating : t.generateBtn}</span>
          </button>
        </div>
      </div>

      {/* Teachers Portal: Universal Q&A & Pedagogical Assistant */}
      <div className="backdrop-blur-xl bg-slate-950/80 rounded-2xl p-6 shadow-2xl border border-amber-500/30 text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {uiLang === 'hi'
                ? 'शिक्षक जिज्ञासा एवं शिक्षण विधि सहायक (Ask Any Question)'
                : 'Teacher Academic & Pedagogical Assistant (Ask Any Question)'}
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
            {selectedClass} • {selectedSubject}
          </span>
        </div>

        <p className="text-xs text-amber-200/80">
          {uiLang === 'hi'
            ? 'पाठ्यक्रम से संबंधित कोई भी सवाल पूछें—जैसे सरल उदाहरण, श्यामपट्ट (ब्लैकबोर्ड) चित्र, शिक्षण विधियाँ, या छात्रों की कमजोरियों को दूर करने के उपाय।'
            : 'Ask any pedagogical or subject question—such as intuitive analogies, blackboard diagrams, classroom activities, or remediation techniques.'}
        </p>

        {/* Input & Ask Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={teacherDoubt}
            onChange={e => setTeacherDoubt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskTeacherAssistant()}
            placeholder={
              uiLang === 'hi'
                ? 'उदा: इस विषय को कक्षा में समझाने के लिए एक रोचक 5-मिनट गतिविधि या श्यामपट्ट चित्र बताएं...'
                : 'E.g.: Give a 5-minute starter activity or blackboard diagram to teach this topic...'
            }
            className="flex-1 py-2.5 px-4 rounded-xl border border-amber-500/30 bg-slate-900/90 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            onClick={() => handleAskTeacherAssistant()}
            disabled={askingTeacherDoubt || !teacherDoubt.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-50 transition shadow-md flex items-center justify-center space-x-1.5"
          >
            {askingTeacherDoubt ? <Sparkles className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            <span>{askingTeacherDoubt ? (uiLang === 'hi' ? 'विश्लेषण...' : 'Thinking...') : (uiLang === 'hi' ? 'उत्तर प्राप्त करें' : 'Get Guidance')}</span>
          </button>
        </div>
        {teacherDoubtError && (
          <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {teacherDoubtError}
          </p>
        )}

        {/* Teacher Quick Prompt Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            uiLang === 'hi' ? 'इस विषय का रोचक श्यामपट्ट (ब्लैकबोर्ड) चित्र कैसे बनाएं?' : 'Blackboard diagram ideas for this topic',
            uiLang === 'hi' ? 'कमजोर बच्चों के लिए 3 सरल दैनिक जीवन के उदाहरण' : '3 daily life analogies for struggling students',
            uiLang === 'hi' ? '5 मिनट की रोचक परिचयात्मक गतिविधि (Starter Hook)' : '5-minute starter hook activity',
            uiLang === 'hi' ? 'उच्च-स्तरीय सोच प्रश्न (HOTS Questions)' : 'Higher-Order Thinking Questions (HOTS)',
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => {
                setTeacherDoubt(prompt);
                handleAskTeacherAssistant(prompt);
              }}
              className="text-[11px] px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/20 transition"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Teacher Assistant Response Card */}
        {teacherDoubtAnswer && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3 mt-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{uiLang === 'hi' ? 'गुरुकुल शिक्षक मार्गदर्शन उत्तर' : 'Gurukul AI Teacher Guidance'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                100% Grounded
              </span>
            </div>
            <div className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
              {teacherDoubtAnswer.answer}
            </div>
            {teacherDoubtAnswer.ghar_ki_boli && (
              <div className="text-xs p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
                <span className="font-bold text-[10px] uppercase block text-amber-400 mb-0.5">
                  घर की बोली (Ghar Ki Boli Analogy):
                </span>
                {teacherDoubtAnswer.ghar_ki_boli}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated Lesson Plan View */}
      {plan && (
        <div className="backdrop-blur-xl bg-slate-950/85 rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden text-white">
          
          {/* Plan Header */}
          <div className="p-6 bg-gradient-to-r from-amber-950/50 via-slate-900/80 to-amber-950/50 border-b border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-sm">
                  {plan.class} • {plan.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-200 border border-amber-500/30">
                  {plan.period_length_minutes} Minutes
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {plan.chapter}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-amber-500/30 text-amber-200 hover:bg-slate-800 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyBtn}</span>
              </button>

              <button
                onClick={printPlan}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-amber-500/30 text-amber-200 hover:bg-slate-800 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printBtn}</span>
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shared ? (uiLang === 'hi' ? 'टेक्स्ट कॉपी हुआ!' : 'Text Copied!') : t.whatsappBtn}</span>
              </button>
            </div>
          </div>

          {/* Plan Content */}
          <div className="p-6 space-y-6 text-xs text-slate-200">
            
            {/* Learning Objectives */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-amber-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.objectives}</span>
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.objectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-amber-500/20 text-slate-200 flex items-start space-x-2"
                  >
                    <span className="font-bold text-amber-400 font-mono">{idx + 1}.</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Materials & Board Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{t.materials}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {plan.materials_needed.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-slate-900/90 text-amber-200 border border-amber-500/30 text-[11px]"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{t.boardDiagram}</span>
                </h4>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {plan.board_diagram_description}
                </p>
              </div>

            </div>

            {/* Timed Lesson Flow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-300 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{t.lessonFlow}</span>
                </h3>
                <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px]">
                  Total: {plan.timed_flow.reduce((sum, s) => sum + s.duration_minutes, 0)} / {plan.period_length_minutes} Mins
                </span>
              </div>

              <div className="space-y-2">
                {plan.timed_flow.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-500/20 bg-slate-900/70 hover:border-amber-400/50 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center font-mono text-xs border border-amber-400/30">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">
                          {step.step}
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-mono">
                          [{step.section_ref}]
                        </span>
                      </div>
                      <span className="font-bold font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                        {step.duration_minutes} min
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="text-slate-300">
                        <span className="font-semibold text-amber-300">Teacher: </span>
                        {step.teacher_activity}
                      </div>
                      <div className="text-slate-400">
                        <span className="font-semibold text-amber-400">Student: </span>
                        {step.student_activity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Question Rapid Mastery Quiz */}
            <div className="space-y-3 pt-4 border-t border-amber-500/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>{t.quizTitle}</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700">
                  {t.verifiedBadge}
                </span>
              </div>

              <div className="space-y-3">
                {plan.quiz_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-500/20 bg-slate-900/60 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white flex items-start space-x-2">
                        <span className="text-amber-400 font-mono">Q{idx + 1}.</span>
                        <span>{q.q}</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                        {q.section}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt.startsWith(q.answer) || opt.includes(q.answer);
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center ${
                              isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500 font-semibold text-emerald-200 shadow-sm'
                                : 'bg-slate-900/80 border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                            {isCorrect && (
                              <span className="ml-2 text-[10px] text-emerald-400 uppercase font-mono">
                                (Answer Key)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Verbatim Section Evidence Quote */}
                    <div className="pl-6 pt-1 text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/20">
                      <span className="font-bold text-amber-300 mr-1">
                        [{q.section}] Verified Evidence:
                      </span>
                      &ldquo;{q.evidence}&rdquo;
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Upload Own Chapter Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="backdrop-blur-2xl bg-slate-950/95 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-white">
            
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>{tm.modalTitle}</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-amber-300/70 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-amber-200/80">
              {tm.modalDesc}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center space-x-2 p-1 bg-slate-900 border border-amber-500/20 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadTab('text')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  uploadTab === 'text'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tm.textTab}
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('photo')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  uploadTab === 'photo'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tm.photoTab}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-amber-200 mb-1 block">
                  {tm.chapterTitleLabel} <span className="text-slate-400 font-normal">({uiLang === 'hi' ? 'वैकल्पिक' : 'Optional'})</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder={tm.chapterTitlePlaceholder}
                  className="w-full py-2 px-3 rounded-lg border border-amber-500/30 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {uploadTab === 'photo' ? (
                /* Photo Upload Option */
                <div className="p-4 rounded-xl border border-dashed border-amber-400/40 bg-amber-950/20 text-center space-y-2">
                  <Camera className="w-8 h-8 text-amber-400 mx-auto" />
                  <span className="font-bold text-amber-200 block text-xs">
                    {tm.photoTab}
                  </span>
                  <span className="text-[11px] text-amber-300/70 block max-w-sm mx-auto">
                    {tm.photoHint}
                  </span>
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uiLang === 'hi' ? 'फोटो चुनें या खींचें' : 'Choose / Capture Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedImageName && (
                    <div className="text-[11px] font-semibold text-emerald-400 pt-1">
                      ✓ Selected: {selectedImageName}
                    </div>
                  )}
                </div>
              ) : (
                /* Text & File Option */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-amber-200 block">
                      {tm.textLabel}
                    </label>
                    <label className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-300 hover:underline cursor-pointer">
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{tm.fileUploadBtn}</span>
                      <input
                        type="file"
                        accept=".txt,.md,.text"
                        onChange={handleTextFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={6}
                    value={uploadContent}
                    onChange={e => setUploadContent(e.target.value)}
                    placeholder={tm.textPlaceholder}
                    className="w-full py-2 px-3 rounded-lg border border-amber-500/30 bg-slate-900 text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {uploadErrorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            {uploadSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
              >
                {tm.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleSaveChapter}
                disabled={uploading}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-md transition"
              >
                {uploading && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                <span>{uploading ? tm.saving : tm.saveBtn}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
