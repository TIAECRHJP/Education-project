import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  User,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Mic,
  Clock,
  Share2,
  FileCheck2,
  Smartphone,
  Cpu,
  Layers,
  Heart,
  Home
} from 'lucide-react';
import { Role, UILanguage } from '../types';
import { BodhiHero } from './bodhi-hero/BodhiHero';
import { GurukulQuotesBanner } from './GurukulLogo';
import { translations } from '../translations';

interface LandingPageProps {
  onSelectRole: (role: Role) => void;
  uiLang: UILanguage;
  onOpenTests: () => void;
  onToggleLang?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  uiLang,
  onOpenTests,
  onToggleLang,
  darkMode,
  onToggleDarkMode,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const t = translations[uiLang];

  const faqs = uiLang === 'hi'
    ? [
        {
          q: 'क्या यह हिंदी में काम करता है? (Does it work in Hindi?)',
          a: 'हाँ, गुरुकुल AI पूरी तरह हिंदी (देवनागरी), हिंग्लिश और अंग्रेजी तीनों में काम करता है। छात्र हिंदी में माइक दबाकर बोल सकते हैं और सरल देवनागरी में उत्तर सुन सकते हैं। इसके अलावा ग्रामीण बच्चों के लिए "घर की बोली" (Village Hindi) का विकल्प भी उपलब्ध है।',
        },
        {
          q: 'क्या यह गलत उत्तर बना सकता है? (Will it hallucinate?)',
          a: 'बिलकुल नहीं! गुरुकुल AI किसी बाहरी इंटरनेट ज्ञान का उपयोग नहीं करता। यह शत-प्रतिशत केवल आपके पाठ्यपुस्तक अध्याय से उत्तर देता है और हर उत्तर के साथ अध्याय का अनुभाग संख्या एवं मूल वाक्य उद्धृत करता है। यदि प्रश्न पाठ में नहीं है, तो विनम्रतापूर्वक मना कर शिक्षक इनबॉक्स में भेज देता है।',
        },
        {
          q: 'यह किन कक्षाओं और विषयों के लिए है? (Which classes and subjects?)',
          a: 'वर्तमान में यह बिहार राज्य पाठ्यचर्या (SCERT/NCERT) के कक्षा 6, 7 और 8 के विज्ञान एवं पर्यावरण अध्ययन के लिए सुसज्जित है। शिक्षक किसी भी नए विषय या अध्याय का टेक्स्ट या फोटो अपलोड करके इसे तुरंत उपयोग में ला सकते हैं।',
        },
        {
          q: 'क्या शिक्षकों को विशेष तकनीकी प्रशिक्षण चाहिए? (Do teachers need technical training?)',
          a: 'नहीं! केवल 1 क्लिक में अपनी घंटी की अवधि (30, 40 या 45 मिनट) चुनें और पाठ योजना तैयार हो जाती है। इसे सीधे WhatsApp पर साझा किया जा सकता है या एक क्लिक में प्रिंट किया जा सकता है।',
        },
        {
          q: 'क्या यह सस्ते 4G/3G फोन पर चलेगा? (Does it work on cheap Android phones?)',
          a: 'हाँ! इसे बिहार के ग्रामीण क्षेत्रों के सस्ते स्मार्टफोन को ध्यान में रखकर हल्का PWA (प्रोग्रेसिव वेब ऐप) बनाया गया है। अंतिम पाठ योजना और क्विज ऑफलाइन भी खुलते हैं।',
        },
        {
          q: 'क्या हमें पूरा एलएमएस सिस्टम बनाना पड़ेगा? (Do we need a full LMS?)',
          a: 'बिल्कुल नहीं! कोई भारी यूजरनेम या पासवर्ड नहीं चाहिए। छात्र केवल अपने रोल नंबर से सीधे प्रवेश कर सकते हैं।',
        },
        {
          q: 'क्या हम दूसरा पाठ इस्तेमाल कर सकते हैं? (Can we upload our own chapters?)',
          a: 'हाँ! गुरुकुल AI किसी भी एक पाठ के लिए हार्ड-कोडेड नहीं है। आप किसी भी पाठ्यपुस्तक के पृष्ठ की फोटो खींचकर या टेक्स्ट पेस्ट करके तुरंत नया अध्याय जोड़ सकते हैं।',
        },
      ]
    : [
        {
          q: 'Does it work in Hindi and local dialects?',
          a: 'Yes! Gurukul AI operates seamlessly in Hindi (Devanagari), Hinglish, and English. Students can tap the microphone to speak doubts in Hindi and listen to clear spoken answers. An optional "Ghar Ki Boli" toggle provides homely analogies for rural learners.',
        },
        {
          q: 'Will it make up answers or hallucinate?',
          a: 'Absolutely not! Gurukul AI does not use open web conjecture. Every answer is 100% grounded in the selected textbook chapter, citing exact section numbers and quoting verbatim book sentences. Out-of-syllabus questions are politely redirected to the teacher.',
        },
        {
          q: 'Which classes and subjects does it support?',
          a: 'Currently configured for Bihar State Board (SCERT/NCERT) Classes 6, 7, and 8 Science and EVS. Teachers can also upload custom chapter text or textbook photos in seconds.',
        },
        {
          q: 'Do teachers need complex technical training?',
          a: 'No training required! With a single tap, choose 30, 40, or 45-minute period length to receive a verified lesson plan and 5-MCQ quiz ready for printing or 1-click WhatsApp sharing.',
        },
        {
          q: 'Does it run on affordable 4G/3G Android phones?',
          a: 'Yes, engineered as a lightweight Progressive Web App (PWA) with hardware-concurrency throttling, visibility pausing, and offline caching for rural classrooms.',
        },
        {
          q: 'Do schools need complex student accounts or LMS setup?',
          a: 'No heavy onboarding. Students select their profile from the class roster and can immediately resolve doubts without password friction.',
        },
        {
          q: 'Can teachers upload new chapters or scan textbook pages?',
          a: 'Yes! Gurukul AI supports custom text pasting, file uploads (.txt, .md), and Gemini Vision OCR photo scanning to automatically split pages into numbered sections.',
        },
      ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* AWARD-LEVEL ANIMATED BODHI VRIKSH HERO (100% VISIBLE BACKGROUND) */}
      <BodhiHero
        onSelectRole={onSelectRole}
        uiLang={uiLang}
        onToggleLang={onToggleLang}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onOpenTests={onOpenTests}
      />

      {/* ------------------------------------------------------------- */}
      <section className="relative z-30 mx-auto -mt-5 max-w-5xl scroll-mt-20 px-4 sm:px-6 lg:px-8">
        <GurukulQuotesBanner uiLang={uiLang} />
      </section>
      {/* 3-STEP "HOW IT WORKS" SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.howItWorks.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.howItWorks.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/30 shadow-2xl space-y-3 relative text-white">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 font-extrabold flex items-center justify-center font-mono">
              01
            </div>
            <h3 className="font-bold text-base text-white">
              {t.howItWorks.step1Title}
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {t.howItWorks.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/30 shadow-2xl space-y-3 relative text-white">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/40 font-extrabold flex items-center justify-center font-mono">
              02
            </div>
            <h3 className="font-bold text-base text-white">
              {t.howItWorks.step2Title}
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {t.howItWorks.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/30 shadow-2xl space-y-3 relative text-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-extrabold flex items-center justify-center font-mono">
              03
            </div>
            <h3 className="font-bold text-base text-white">
              {t.howItWorks.step3Title}
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {t.howItWorks.step3Desc}
            </p>
          </div>

        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.features.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.features.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <Mic className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f1Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f1Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <Home className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f2Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f2Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <FileCheck2 className="w-5 h-5 text-green-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f3Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f3Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <Clock className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f4Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f4Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f5Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f5Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/25 shadow-xl space-y-2 text-white">
            <Share2 className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm text-white">{t.features.f6Title}</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t.features.f6Desc}
            </p>
          </div>
        </div>
      </section>

      {/* ROLE CARDS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.roleCards.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.roleCards.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-4 text-white">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                <Mic className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg text-white">
                {t.roleCards.studentTitle}
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {t.roleCards.studentDesc}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('student')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 transition shadow-lg"
            >
              {t.roleCards.studentBtn}
            </button>
          </div>

          {/* Teacher */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-4 text-white">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-bold text-lg text-white">
                {t.roleCards.teacherTitle}
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {t.roleCards.teacherDesc}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('teacher')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 transition"
            >
              {t.roleCards.teacherBtn}
            </button>
          </div>

          {/* Admin / DEO */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-4 text-white">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-white">
                {t.roleCards.deoTitle}
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {t.roleCards.deoDesc}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('admin')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/30 transition shadow-lg"
            >
              {t.roleCards.deoBtn}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.faq.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.faq.title}
          </h2>
          <p className="text-xs text-amber-200/80">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-amber-500/30 rounded-2xl backdrop-blur-xl bg-slate-950/80 overflow-hidden shadow-xl"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-white hover:bg-slate-900/60 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180 text-amber-300' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-200 leading-relaxed border-t border-amber-500/20 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* TEAM & MISSION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="p-8 rounded-3xl backdrop-blur-2xl bg-slate-950/85 border border-amber-500/40 shadow-2xl space-y-3 text-white">
          <Heart className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-white">
            {uiLang === 'hi'
              ? 'हमारा ध्येय: बिहार के प्रत्येक शिक्षक एवं विद्यार्थी का सशक्तिकरण'
              : 'Our Mission: Empowering Every Shikshak & Vidyarthi in Bihar'}
          </h2>
          <p className="text-xs text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
            {uiLang === 'hi'
              ? 'गुरुकुल AI भारतीय सरकारी स्कूली शिक्षा के बुनियादी द्वंद्व को हल करने के लिए बनाया गया है: ग्रामीण छात्र संकोचवश संशय नहीं पूछ पाते, और समर्पित शिक्षक शाम भर लालटेन या मोमबत्ती की रोशनी में समयबद्ध पाठ योजनाएं तैयार करने में खप जाते हैं। गुरुकुल AI हर बच्चे का डाउट क्लियर करता है और हर शिक्षक का समय सुरक्षित करता है।'
              : "Gurukul AI solves the foundational dual dilemma of Indian government schooling: rural students hesitate to ask doubts due to shyness, while dedicated government school teachers spend their entire evenings preparing multi-grade lesson plans. Gurukul AI answers every doubt and saves every teacher's evening."}
          </p>
          <div className="pt-2 text-xs font-semibold text-amber-300">
            {uiLang === 'hi'
              ? 'पटना, गया, मुजफ्फरपुर, भागलपुर सहित बिहार के सभी 38 जिलों के प्राथमिक व मध्य विद्यालयों को समर्पित।'
              : 'Dedicated to Middle & Secondary Government Schools across Patna, Gaya, Muzaffarpur, Bhagalpur and all 38 districts of Bihar.'}
          </div>
        </div>
      </section>

    </div>
  );
};
