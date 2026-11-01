import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Languages,
  Home,
  MessageSquare,
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Chapter, UILanguage, GroundedDoubtResponse } from '../types';
import { translations } from '../translations';

const VOICE_LANGUAGES = [
  { label: 'English', locale: 'en-IN' }, { label: 'हिन्दी', locale: 'hi-IN' },
  { label: 'অসমীয়া', locale: 'as-IN' }, { label: 'বাংলা', locale: 'bn-IN' },
  { label: 'बड़ो / Bodo', locale: 'brx-IN' }, { label: 'डोगरी / Dogri', locale: 'doi-IN' },
  { label: 'ગુજરાતી', locale: 'gu-IN' }, { label: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { label: 'कॉशुर / Kashmiri', locale: 'ks-IN' }, { label: 'कोंकणी', locale: 'gom-IN' },
  { label: 'मैथिली', locale: 'mai-IN' }, { label: 'മലയാളം', locale: 'ml-IN' },
  { label: 'মেইতেই / Manipuri', locale: 'mni-IN' }, { label: 'मराठी', locale: 'mr-IN' },
  { label: 'नेपाली', locale: 'ne-NP' }, { label: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { label: 'ਪੰਜਾਬੀ', locale: 'pa-IN' }, { label: 'संस्कृतम्', locale: 'sa-IN' },
  { label: 'ᱥᱟᱱᱛᱟᱲᱤ / Santali', locale: 'sat-IN' }, { label: 'سنڌي / Sindhi', locale: 'sd-IN' },
  { label: 'தமிழ்', locale: 'ta-IN' }, { label: 'తెలుగు', locale: 'te-IN' },
  { label: 'اردو', locale: 'ur-IN' },
];

interface StudentChatProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  uiLang: UILanguage;
  audience?: 'student' | 'teacher';
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'assistant';
  text: string;
  responseObj?: GroundedDoubtResponse;
  timestamp: string;
}

export const StudentChat: React.FC<StudentChatProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  uiLang,
  audience = 'student',
}) => {
  const t = translations[uiLang].chat;

  const [studentId, setStudentId] = useState(audience === 'teacher' ? 'teacher' : 'S001');
  const [studentName, setStudentName] = useState(audience === 'teacher' ? 'Teacher' : 'Ravi Gupta');
  const [roster, setRoster] = useState<{ student_id: string; name: string; preferred_language: string }[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [answerLanguage, setAnswerLanguage] = useState(() => localStorage.getItem('gurukul_answer_language') || (uiLang === 'hi' ? 'hi-IN' : 'en-IN'));
  const previousUiLangRef = useRef(uiLang);
  
  // Feature Toggles
  const [showGharKiBoli, setShowGharKiBoli] = useState(false);
  const [showBilingual, setShowBilingual] = useState(false);
  const [forwardSuccessId, setForwardSuccessId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const handleSendRef = useRef<(question?: string) => void>(() => {});
  const voiceAnswerPendingRef = useRef(false);
  const speechTimerRef = useRef<any>(null);

  // Synchronize welcome message on initial load and language toggle
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 0 || prev[0].id === 'msg_welcome') {
        return [
          {
            id: 'msg_welcome',
            sender: 'assistant',
            text: t.welcome,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  }, [uiLang, t.welcome]);

  // Keep the reply and speech language aligned when the app's English/Hindi
  // toggle changes, while preserving any language the learner chose manually.
  useEffect(() => {
    const previousDefault = previousUiLangRef.current === 'hi' ? 'hi-IN' : 'en-IN';
    const nextDefault = uiLang === 'hi' ? 'hi-IN' : 'en-IN';
    previousUiLangRef.current = uiLang;

    setAnswerLanguage(current => {
      if (current !== previousDefault) return current;
      localStorage.setItem('gurukul_answer_language', nextDefault);
      return nextDefault;
    });
  }, [uiLang]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = answerLanguage;

          recognition.onstart = () => {
            setIsListening(true);
            setMicError(null);
            setMicStatusMsg(t.listening);
          };

          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                setInputQuestion(event.results[i][0].transcript);
              }
            }
            if (finalTranscript) {
              setInputQuestion(finalTranscript);
              setIsListening(false);
              setMicStatusMsg(null);
              voiceAnswerPendingRef.current = true;
              window.setTimeout(() => handleSendRef.current(finalTranscript), 0);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition status:', event?.error);
            setIsListening(false);
            setMicStatusMsg(null);
            if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
              setMicError(t.micBlockedHint);
            } else if (event?.error !== 'no-speech') {
              setMicError(t.micNotSupported);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            setMicStatusMsg(null);
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Could not initialize SpeechRecognition:', e);
        }
      }
    }

    // Fetch roster students for profile picker
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (data.students && data.students.length > 0) {
          setRoster(data.students);
        }
      })
      .catch(() => {});

    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [uiLang, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    setMicError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setMicStatusMsg(null);
      return;
    }

    // SpeechRecognition manages its own microphone permission prompt. Opening and immediately closing a getUserMedia stream first can race with recognition.
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setMicError('Microphone voice input needs a secure connection. Open this site using HTTPS or localhost.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition && !recognitionRef.current) {
      setMicError(
        uiLang === 'hi'
          ? 'यह ब्राउज़र ध्वनि पहचान (Speech Recognition) का समर्थन नहीं करता। आप नीचे दिए गए सुझावों पर क्लिक कर सकते हैं।'
          : 'Web Speech recognition is not supported in this browser. Please type your doubt or use the quick suggestion chips.'
      );
      return;
    }

    try {
      if (!recognitionRef.current && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = answerLanguage;

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
          setMicStatusMsg(t.listening);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              setInputQuestion(event.results[i][0].transcript);
            }
          }
          if (finalTranscript) {
            setInputQuestion(finalTranscript);
            setIsListening(false);
            setMicStatusMsg(null);
            voiceAnswerPendingRef.current = true;
            window.setTimeout(() => handleSendRef.current(finalTranscript), 0);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error event:', event?.error);
          setIsListening(false);
          setMicStatusMsg(null);
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            setMicError(t.micBlockedHint);
          } else if (event?.error !== 'no-speech') {
            setMicError(t.micNotSupported);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setMicStatusMsg(null);
        };

        recognitionRef.current = recognition;
      }

      if (recognitionRef.current) {
        recognitionRef.current.lang = answerLanguage;
        recognitionRef.current.start();
        setIsListening(true);
        setMicStatusMsg(t.listening);

        if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
        speechTimerRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {}
          }
          setIsListening(false);
          setMicStatusMsg(null);
        }, 20000);
      }
    } catch (err: any) {
      console.warn('Microphone start error:', err);
      setIsListening(false);
      setMicStatusMsg(null);
      setMicError(t.micBlockedHint);
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = answerLanguage;
    const voices = window.speechSynthesis.getVoices();
    const languageCode = answerLanguage.split('-')[0].toLowerCase();
    const matchingVoice = voices.find(v => v.lang.toLowerCase() === answerLanguage.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(`${languageCode}-`));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (qText?: string) => {
    const questionToSend = (qText || inputQuestion).trim();
    if (!questionToSend || loading) return;
    const speakReply = voiceAnswerPendingRef.current;
    voiceAnswerPendingRef.current = false;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setMicStatusMsg(null);
    }

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'student',
      text: questionToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/doubt/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToSend,
          chapterId: selectedChapterId,
          studentId,
          studentName,
          preferredLanguage: answerLanguage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: data.doubtId || `ast_${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          responseObj: data,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (speakReply) speakText(assistantMsg.text, assistantMsg.id);
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: uiLang === 'hi'
            ? 'क्षमा करें, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, could not retrieve the answer. Please try again.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: uiLang === 'hi'
          ? 'नेटवर्क समस्या के कारण उत्तर नहीं मिला। कृपया इंटरनेट कनेक्शन जाँचें।'
          : 'Network error. Please verify your connection.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const forwardToTeacher = async (doubtId?: string, questionText?: string) => {
    try {
      const res = await fetch('/api/doubt/forward-to-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubtId,
          question: questionText,
          studentId,
          studentName,
          chapterId: selectedChapterId,
        }),
      });
      const data = await res.json();
      if (data.success && doubtId) {
        setForwardSuccessId(doubtId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Keep the current send handler available to Web Speech callbacks without stale state.
  handleSendRef.current = handleSend;

  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-5rem)]">
      
      {/* Header Bar: Chapter Selector + Student Switcher - Frosted Dark Glass */}
      <div className="backdrop-blur-xl bg-slate-950/80 rounded-2xl p-4 shadow-2xl border border-amber-500/30 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
        
        {/* Chapter Selection */}
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-200">
            {uiLang === 'hi' ? 'पाठ्यपुस्तक:' : 'Textbook:'}
          </span>
          <select
            value={selectedChapterId}
            onChange={e => onSelectChapter(e.target.value)}
            className="flex-1 py-1.5 px-2.5 rounded-xl border border-amber-500/30 bg-slate-900/90 text-amber-100 font-medium truncate focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </div>

        {audience === 'student' && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-200/80">{t.switchStudent}</span>
            <select
              value={studentId}
              onChange={e => {
                setStudentId(e.target.value);
                const found = roster.find(r => r.student_id === e.target.value);
                if (found) setStudentName(found.name);
              }}
              className="py-1.5 px-2.5 rounded-xl border border-amber-500/30 bg-slate-900/90 text-amber-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {roster.length > 0 ? (
                roster.map(st => (
                  <option key={st.student_id} value={st.student_id}>
                    {st.name} ({st.student_id})
                  </option>
                ))
              ) : (
                <option value="S001">Ravi Gupta (S001)</option>
              )}
            </select>
          </div>
        )}

        {/* Toggles: Ghar Ki Boli & Bilingual */}
        <div className="flex items-center space-x-2 pt-1 sm:pt-0 w-full sm:w-auto justify-end">
          <label className="text-[10px] font-semibold text-amber-200/80 whitespace-nowrap" htmlFor="answer-language">{uiLang === 'hi' ? 'भाषा:' : 'Language:'}</label>
          <select
            id="answer-language"
            aria-label="Choose your language for voice questions and spoken answers"
            title="Select the language for voice questions and spoken answers. Textbook answers may remain in the chapter language."
            value={answerLanguage}
            onChange={e => {
              setAnswerLanguage(e.target.value);
              localStorage.setItem('gurukul_answer_language', e.target.value);
            }}
            className="max-w-36 py-1.5 px-2 rounded-lg border border-sky-400/30 bg-slate-900/90 text-sky-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            {VOICE_LANGUAGES.map(language => <option key={language.locale} value={language.locale}>{language.label}</option>)}
          </select>
          <button
            onClick={() => setShowGharKiBoli(!showGharKiBoli)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
              showGharKiBoli
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                : 'bg-slate-900/80 border-amber-500/20 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>{uiLang === 'hi' ? 'घर की बोली' : 'Ghar Ki Boli'}</span>
          </button>

          <button
            onClick={() => setShowBilingual(!showBilingual)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
              showBilingual
                ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-sm'
                : 'bg-slate-900/80 border-blue-500/20 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>{uiLang === 'hi' ? 'अंग्रेजी अनुवाद' : 'Bilingual'}</span>
          </button>
        </div>
      </div>

      <p className="-mt-2 mb-2 px-2 text-[10px] leading-relaxed text-slate-300/80">
        {uiLang === 'hi'
          ? 'चुनी भाषा में माइक और जवाब की आवाज़ चलेगी। पाठ्यपुस्तक के उत्तर उसी पाठ की भाषा में रहेंगे; अन्य भाषाओं में ऑनलाइन संदर्भ तभी मिलेगा जब वह उपलब्ध हो।'
          : 'Your choice controls mic recognition and spoken replies. Textbook answers stay in the chapter’s language; other-language online references are used when available.'}
      </p>

      {/* Messages Scroll Area - Frosted Dark Glass */}
      <div className="flex-1 overflow-y-auto backdrop-blur-xl bg-slate-950/75 rounded-2xl p-4 space-y-4 border border-amber-500/20 shadow-2xl">
        
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm shadow-lg ${
                msg.sender === 'student'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-xs border border-amber-400/30'
                  : 'bg-slate-900/90 text-slate-100 border border-amber-500/30 rounded-tl-xs'
              }`}
            >
              {/* Message Text */}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* If Grounded in Chapter: Show Source Citation & Verbatim Quote */}
              {msg.responseObj && msg.responseObj.in_chapter && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                  
                  {/* Source Section Badge */}
                  {msg.responseObj.section && (
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{t.sectionCitation} {msg.responseObj.section}</span>
                    </div>
                  )}

                  {/* Quoted Sentence from Textbook */}
                  {msg.responseObj.quote && (
                    <div className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20 text-slate-200 italic">
                      <span className="font-semibold text-amber-400 not-italic block text-[10px] uppercase">
                        {t.quoteCitation}
                      </span>
                      &ldquo;{msg.responseObj.quote}&rdquo;
                    </div>
                  )}

                  {/* Ghar Ki Boli Toggle Expansion */}
                  {showGharKiBoli && msg.responseObj.ghar_ki_boli && (
                    <div className="text-xs bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 text-amber-200">
                      <span className="font-bold text-[10px] text-amber-400 flex items-center space-x-1">
                        <Home className="w-3 h-3" />
                        <span>{t.gharKiBoli}</span>
                      </span>
                      <p className="mt-1 leading-relaxed">{msg.responseObj.ghar_ki_boli}</p>
                    </div>
                  )}

                  {/* Bilingual Side-by-Side English Translation */}
                  {showBilingual && msg.responseObj.bilingual_en && (
                    <div className="text-xs bg-blue-950/40 p-2.5 rounded-lg border border-blue-500/30 text-blue-200">
                      <span className="font-bold text-[10px] text-blue-300 flex items-center space-x-1">
                        <Languages className="w-3 h-3" />
                        <span>{t.bilingual}</span>
                      </span>
                      <p className="mt-1 leading-relaxed">{msg.responseObj.bilingual_en}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Broad Curriculum & Knowledge Solution - Gurukul Answers ANY Question */}
              {msg.responseObj && !msg.responseObj.in_chapter && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-950/60 p-2.5 rounded-lg border border-amber-500/30">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      {uiLang === 'hi'
                        ? '💡 गुरुकुल व्यापक ज्ञान एवं विषय समाधान (Broad Curriculum & Knowledge Solution)'
                        : '💡 Gurukul Broad Knowledge & Universal Curriculum Answer'}
                    </span>
                  </div>

                  {msg.responseObj.source_url && (
                    <a href={msg.responseObj.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-950/40 px-2.5 py-1.5 text-xs text-sky-200 hover:bg-sky-900/50">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {msg.responseObj.source_name || msg.responseObj.section || 'Open answer source'}
                      <span className="text-sky-300/70">· external reference</span>
                    </a>
                  )}

                  {/* Ghar Ki Boli Toggle Expansion */}
                  {showGharKiBoli && msg.responseObj.ghar_ki_boli && (
                    <div className="text-xs bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 text-amber-200">
                      <span className="font-bold text-[10px] text-amber-400 flex items-center space-x-1">
                        <Home className="w-3 h-3" />
                        <span>{t.gharKiBoli}</span>
                      </span>
                      <p className="mt-1 leading-relaxed">{msg.responseObj.ghar_ki_boli}</p>
                    </div>
                  )}

                  {/* Bilingual Side-by-Side English Translation */}
                  {showBilingual && msg.responseObj.bilingual_en && (
                    <div className="text-xs bg-blue-950/40 p-2.5 rounded-lg border border-blue-500/30 text-blue-200">
                      <span className="font-bold text-[10px] text-blue-300 flex items-center space-x-1">
                        <Languages className="w-3 h-3" />
                        <span>{t.bilingual}</span>
                      </span>
                      <p className="mt-1 leading-relaxed">{msg.responseObj.bilingual_en}</p>
                    </div>
                  )}

                  {audience === 'student' && forwardSuccessId === msg.responseObj.doubtId ? (
                    <div className="text-xs text-emerald-400 flex items-center space-x-1.5 font-bold p-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.forwardedSuccess}</span>
                    </div>
                  ) : audience === 'student' ? (
                    <button
                      onClick={() => forwardToTeacher(msg.responseObj?.doubtId, msg.text)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/20 transition"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>{uiLang === 'hi' ? 'शिक्षक को भी भेजें (Ask School Teacher)' : 'Share with School Teacher'}</span>
                    </button>
                  ) : null}
                </div>
              )}

              {/* Footer row: Timestamp & Read Aloud TTS button */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.text, msg.id)}
                    className="p-1 rounded hover:bg-slate-800 text-amber-300 hover:text-white transition"
                    title={speakingMsgId === msg.id ? 'Stop Voice' : 'Read Aloud'}
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-amber-200 text-xs p-2.5 bg-slate-900/80 rounded-xl w-fit border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              {uiLang === 'hi'
                ? 'पाठ्यपुस्तक एवं गुरुकुल ज्ञान भंडार में उत्तर तैयार हो रहा है...'
                : 'Searching curriculum and generating grounded explanation...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Listening Waveform Animation Bar */}
      {isListening && (
        <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white flex items-center justify-between shadow-2xl animate-pulse border border-red-400/40">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <Radio className="w-4 h-4 animate-ping" />
            <span>{t.listening}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <button
              onClick={toggleVoiceInput}
              className="ml-3 px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-[11px] font-semibold"
            >
              {uiLang === 'hi' ? 'रोकें' : 'Stop'}
            </button>
          </div>
        </div>
      )}

      {/* Microphone Feedback/Blocked Alert */}
      {micError && (
        <div className="my-2 p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-amber-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Suggestion Chips (Voice & Any Question Doubts Across Subjects) */}
      <div className="my-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-amber-200/90 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.sampleDoubtTitle} (1 to 12 Subjects)</span>
          </span>
          <span className="text-[10px] text-amber-300/70">
            {uiLang === 'hi' ? '1-क्लिक में पूछें या बोलें' : 'Tap or speak any doubt'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            uiLang === 'hi' ? 'प्रकाश संश्लेषण क्या है?' : 'What is photosynthesis?',
            uiLang === 'hi' ? 'पत्तियों में रंध्र (स्टोमेटा) का क्या काम है?' : 'What do stomata do?',
            uiLang === 'hi' ? 'न्यूटन का तीसरा गति नियम क्या है?' : 'What is Newton’s 3rd Law?',
            uiLang === 'hi' ? 'त्रिभुज का क्षेत्रफल कैसे निकालें?' : 'How to find area of triangle?',
            uiLang === 'hi' ? 'पौधे रात में ऑक्सीजन क्यों नहीं छोड़ते?' : 'Why don’t plants release oxygen at night?',
            uiLang === 'hi' ? 'क्लोरोफिल का मुख्य कार्य क्या है?' : 'What is the function of chlorophyll?',
          ].map((doubt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(doubt)}
              className="text-xs px-3 py-1 rounded-full border border-amber-500/30 bg-slate-900/80 hover:bg-amber-500/20 text-amber-100 shadow-md transition active:scale-95"
            >
              {doubt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar: Mic + Text Input + Send Button */}
      <div className="backdrop-blur-xl bg-slate-950/90 rounded-2xl p-2 border border-amber-500/40 shadow-2xl flex items-center space-x-2">
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 active:scale-95 shadow-md shadow-amber-500/20'
          }`}
          title={isListening ? 'Listening (Click to stop)...' : 'Speak doubt in Hindi or English'}
          aria-label={isListening ? 'Stop listening' : 'Start microphone'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Input Text Box */}
        <input
          type="text"
          value={inputQuestion}
          onChange={e => setInputQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? t.listening : t.inputPlaceholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-amber-200/50 focus:outline-none px-2"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuestion.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white shadow-md shadow-amber-500/20 transition active:scale-95"
          aria-label={t.sendBtn}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-center text-amber-200/70 mt-2">
        {uiLang === 'hi'
          ? 'बिहार सरकार • शिक्षा विभाग | गुरुकुल AI शत-प्रतिशत NCERT/SCERT पाठ्यपुस्तकों एवं व्यापक ज्ञान से उत्तर देता है।'
          : 'Bihar Education Department | Gurukul AI is grounded in NCERT/SCERT textbooks & comprehensive curriculum knowledge.'}
      </p>

    </div>
  );
};
