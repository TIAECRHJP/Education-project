/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Translations {
  appName: string;
  appTagline: string;
  biharEdu: string;
  firstPageTag: string;
  roles: {
    landing: string;
    student: string;
    teacher: string;
    admin: string;
  };
  hero: {
    badge: string;
    tagline: string;
    headlineMain: string;
    headlineHighlight: string;
    headlineEnd: string;
    subtitle: string;
    tryTeacher: string;
    askDoubt: string;
    awakenTree: string;
    touchHint: string;
    exploreBelow: string;
    metrics: {
      citations: string;
      citationsLabel: string;
      timedPlans: string;
      timedPlansLabel: string;
      speech: string;
      speechLabel: string;
      ocr: string;
      ocrLabel: string;
    };
  };
  howItWorks: {
    tag: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  features: {
    tag: string;
    title: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    f6Title: string;
    f6Desc: string;
  };
  roleCards: {
    tag: string;
    title: string;
    studentTitle: string;
    studentDesc: string;
    studentBtn: string;
    teacherTitle: string;
    teacherDesc: string;
    teacherBtn: string;
    deoTitle: string;
    deoDesc: string;
    deoBtn: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
  };
  generator: {
    title: string;
    subtitle: string;
    classLabel: string;
    subjectLabel: string;
    chapterLabel: string;
    durationLabel: string;
    langLabel: string;
    generateBtn: string;
    generating: string;
    uploadBtn: string;
    objectives: string;
    materials: string;
    boardDiagram: string;
    lessonFlow: string;
    quizTitle: string;
    verifiedBadge: string;
    copyBtn: string;
    copied: string;
    printBtn: string;
    whatsappBtn: string;
  };
  uploadModal: {
    modalTitle: string;
    modalDesc: string;
    chapterTitleLabel: string;
    chapterTitlePlaceholder: string;
    photoTab: string;
    photoHint: string;
    textTab: string;
    textLabel: string;
    textPlaceholder: string;
    fileUploadBtn: string;
    cancelBtn: string;
    saveBtn: string;
    saving: string;
    successMsg: string;
    errorMsg: string;
  };
  chat: {
    welcome: string;
    inputPlaceholder: string;
    sendBtn: string;
    listening: string;
    listeningHint: string;
    micNotSupported: string;
    micBlockedHint: string;
    sampleDoubtTitle: string;
    sampleDoubts: string[];
    sectionCitation: string;
    quoteCitation: string;
    gharKiBoli: string;
    bilingual: string;
    forwardToTeacher: string;
    forwardedSuccess: string;
    switchStudent: string;
  };
}

export const translations: Record<'en' | 'hi', Translations> = {
  en: {
    appName: 'Gurukul AI',
    appTagline: 'Roots of knowledge, wings of tomorrow',
    biharEdu: 'Bihar Education Department',
    firstPageTag: '✨ Gurukul AI (गुरुकुल AI) — Roots of Knowledge, Wings of Tomorrow',
    roles: {
      landing: 'Home',
      student: 'Student Doubt',
      teacher: 'Teacher Portal',
      admin: 'DEO District View',
    },
    hero: {
      badge: 'Grounded AI Classroom Assistant for Bihar Govt Schools',
      tagline: 'Roots of knowledge, wings of tomorrow',
      headlineMain: 'Gurukul AI:',
      headlineHighlight: "every child's doubt answered,",
      headlineEnd: "every teacher's evening saved",
      subtitle:
        'Built specifically for 70,000+ Bihar government schools: strictly grounded in school textbook chapter texts with 100% verified citations. Voice doubts in Hindi for rural learners, and instant timed period plans for hardworking teachers.',
      tryTeacher: 'Try as a teacher',
      askDoubt: 'Ask a doubt',
      awakenTree: 'Awaken Bodhi Tree',
      touchHint: 'Touch the Bodhi Tree to release birds & leaves',
      exploreBelow: 'Explore Gurukul AI Below',
      metrics: {
        citations: '100%',
        citationsLabel: 'Grounded Citations (Zero Hallucination)',
        timedPlans: '30 / 40 / 45m',
        timedPlansLabel: 'Timed Lesson Plans (Exact Sum)',
        speech: 'hi-IN Speech',
        speechLabel: 'Hindi Voice & Ghar Ki Boli',
        ocr: 'Paper-to-Data',
        ocrLabel: 'Gemini Vision Answer Sheet OCR',
      },
    },
    howItWorks: {
      tag: 'From Theory to Classroom',
      title: 'How It Works in 3 Simple Steps',
      subtitle:
        'Zero configuration required. Designed for government school teachers with zero free periods.',
      step1Title: 'Grounded on State Curriculum',
      step1Desc:
        'Select or photograph any NCERT/SCERT textbook chapter. The engine breaks the text into numbered sections with citation verification.',
      step2Title: 'Timed Plan & 100% Verified Quiz',
      step2Desc:
        'Teachers get a lesson plan whose minutes add up exactly to the period (30/40/45 min) plus a 5-MCQ quiz where every answer key is server-validated against textbook evidence.',
      step3Title: 'Doubt-to-Dashboard Mastery Loop',
      step3Desc:
        'Students ask doubts by voice in Hindi or Hinglish. Every doubt links back to its section, pinpointing classroom weak topics (e.g. "12 doubts on Stomata today").',
    },
    features: {
      tag: 'Features',
      title: 'Built for the Realities of Bihar Classrooms',
      f1Title: 'Hindi & Hinglish Speech Recognition',
      f1Desc:
        'First-generation learners can ask doubts naturally by tapping the mic in Hindi, Hinglish, or village dialects.',
      f2Title: 'Ghar Ki Boli (Home Dialect Explanation)',
      f2Desc:
        'One-click toggle provides homely, relatable analogies in village Hindi for complex scientific concepts.',
      f3Title: 'Zero-Hallucination Guardrails',
      f3Desc:
        'Answers must cite exact section numbers and quote verbatim text. Off-chapter questions are politely redirected.',
      f4Title: 'Strict Timed Flow Generator',
      f4Desc:
        'Generates 30, 40, or 45-minute lesson plans with low-cost teaching aids and blackboard diagrams.',
      f5Title: 'Code-Computed Telemetry Dashboard',
      f5Desc:
        'Topic mastery calculated in pure deterministic code, highlighting weakest concepts with auto-tiered remedial groups.',
      f6Title: 'Parent WhatsApp Progress Cards',
      f6Desc:
        '1-click simple Devanagari Hindi report cards ready to send to parents with teacher approval.',
    },
    roleCards: {
      tag: 'Select Your Role',
      title: 'Who is using Gurukul AI today?',
      studentTitle: 'For Students',
      studentDesc: 'Ask questions by voice or text. Get simple answers directly from your textbook with village Hindi explanations.',
      studentBtn: 'Open Student Doubt Chat →',
      teacherTitle: 'For Teachers',
      teacherDesc: 'Create timed lesson plans in 5 seconds, administer verified quizzes, and view Class 7A telemetry.',
      teacherBtn: 'Open Teacher Portal →',
      deoTitle: 'For District Officials (DEO)',
      deoDesc: 'Monitor block-level student doubts, weak concept trends, and student rosters across Patna district.',
      deoBtn: 'Open District State View →',
    },
    faq: {
      tag: 'FAQ',
      title: 'Frequently Asked Questions',
      subtitle: 'Clear answers for Bihar teachers, headmasters, and students.',
    },
    generator: {
      title: 'Teacher Generator: Lesson Plan & Quiz',
      subtitle: 'Generate a period-timed lesson plan and 5-MCQ quiz strictly grounded in textbook evidence.',
      classLabel: 'Class / Grade',
      subjectLabel: 'Subject',
      chapterLabel: 'Textbook Chapter',
      durationLabel: 'Period Duration',
      langLabel: 'Output Language',
      generateBtn: 'Generate Lesson Plan & 5-MCQ Quiz',
      generating: 'Generating Grounded Plan...',
      uploadBtn: '+ Upload New Chapter (Text or Photo)',
      objectives: 'Learning Objectives',
      materials: 'Low-Cost Classroom Aids',
      boardDiagram: 'Blackboard Diagram Description',
      lessonFlow: 'Timed Period Flow',
      quizTitle: '5-Question Rapid Mastery Quiz (Server-Verified)',
      verifiedBadge: 'Verified with Section Evidence',
      copyBtn: 'Copy Plan',
      copied: 'Copied to Clipboard!',
      printBtn: 'Print / Save PDF',
      whatsappBtn: 'Share on WhatsApp',
    },
    uploadModal: {
      modalTitle: 'Upload New Chapter (Text, File or Photo)',
      modalDesc: 'Paste chapter text, upload a text/markdown file, or take a photo of the textbook page. It will be split into numbered sections.',
      chapterTitleLabel: 'Chapter Title',
      chapterTitlePlaceholder: 'e.g. Class 7 Science: Respiration in Organisms',
      photoTab: 'Photo Upload (Gemini Vision OCR)',
      photoHint: 'Take or choose a photo of the textbook page. Text will be extracted automatically.',
      textTab: 'Text / File Upload',
      textLabel: 'Chapter Content (with Section 1:, Section 2: or paragraphs)',
      textPlaceholder: 'Section 1: Introduction...\nSection 2: Key Concepts...',
      fileUploadBtn: 'Choose Text/Doc File (.txt, .md)',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Chapter',
      saving: 'Processing & Saving Chapter...',
      successMsg: 'Chapter uploaded and parsed successfully!',
      errorMsg: 'Please enter chapter content or choose a file/image.',
    },
    chat: {
      welcome: 'Namaste! I am Gurukul AI. Ask any question from your chapter by speaking or typing. I will answer only from your textbook.',
      inputPlaceholder: 'Type your doubt or tap the mic to speak in Hindi/English...',
      sendBtn: 'Send',
      listening: 'Listening... please speak in Hindi or English',
      listeningHint: 'Tap mic again or stop speaking to submit your doubt',
      micNotSupported: 'Microphone not supported in this browser. Please type or use sample chips below.',
      micBlockedHint: 'Microphone permission needed. You can also tap any sample question below.',
      sampleDoubtTitle: 'Sample Doubts (Tap to Ask):',
      sampleDoubts: [
        'stomata kya hota hai?',
        'पौधे अपना भोजन कैसे बनाते हैं?',
        'कवक या मशरूम कैसे पोषण लेते हैं?',
        'पत्ती में स्टार्च की जाँच कैसे करते हैं?',
        'क्लोरोफिल का क्या काम है?',
      ],
      sectionCitation: 'Textbook Reference:',
      quoteCitation: 'Exact Book Quote:',
      gharKiBoli: 'Ghar Ki Boli (घर की बोली):',
      bilingual: 'Bilingual Translation:',
      forwardToTeacher: 'Question Not in Chapter? Send to Teacher',
      forwardedSuccess: 'Sent to Teacher Sunita Mishra inbox!',
      switchStudent: 'Student Profile:',
    },
  },
  hi: {
    appName: 'गुरुकुल AI',
    appTagline: 'ज्ञान की जड़ें, कल के पंख',
    biharEdu: 'बिहार शिक्षा विभाग',
    firstPageTag: '✨ गुरुकुल AI (Gurukul AI) — ज्ञान की जड़ें, कल के पंख',
    roles: {
      landing: 'होम',
      student: 'विद्यार्थी संशय निवारण',
      teacher: 'शिक्षक पोर्टल',
      admin: 'प्रशासनिक दृश्य (DEO)',
    },
    hero: {
      badge: 'बिहार सरकारी विद्यालयों के लिए समर्पित AI शिक्षक साथी',
      tagline: 'ज्ञान की जड़ें, कल के पंख',
      headlineMain: 'गुरुकुल AI:',
      headlineHighlight: 'हर बच्चे का डाउट क्लियर,',
      headlineEnd: 'हर शिक्षक का समय सुरक्षित',
      subtitle:
        'बिहार के 70,000+ सरकारी विद्यालयों के लिए समर्पित: NCERT एवं SCERT पाठ्यपुस्तकों से सीधे जुड़ा शून्य-भ्रम (Zero-Hallucination) AI सहायक। छात्रों के लिए हिंदी व घर की बोली में उत्तर, और शिक्षकों के लिए 1-क्लिक में समयबद्ध पाठ योजना व 5 बहुविकल्पीय प्रश्न।',
      tryTeacher: 'अध्यापक के रूप में जुड़ें',
      askDoubt: 'सवाल पूछें',
      awakenTree: 'बोधिवृक्ष को जगाएं',
      touchHint: 'पक्षी और पत्ते उड़ाने के लिए वृक्ष को स्पर्श करें',
      exploreBelow: 'गुरुकुल AI का पूरा परिचय नीचे देखें',
      metrics: {
        citations: '100%',
        citationsLabel: 'सत्यापित उद्धरण (शून्य भ्रम)',
        timedPlans: '30 / 40 / 45m',
        timedPlansLabel: 'सटीक पाठ योजना (सटीक योग)',
        speech: 'hi-IN वाणी',
        speechLabel: 'हिंदी वाणी व घर की बोली',
        ocr: 'उत्तर-से-डेटा',
        ocrLabel: 'जेमिनी विजन उत्तर पुस्तिका OCR',
      },
    },
    howItWorks: {
      tag: 'सिद्धांत से कक्षा तक',
      title: '3 सरल चरणों में कार्यप्रणाली',
      subtitle:
        'किसी तकनीकी प्रशिक्षण की आवश्यकता नहीं। शून्य खाली घंटी वाले सरकारी शिक्षकों के लिए विशेष रूप से निर्मित।',
      step1Title: 'राज्य पाठ्यचर्या पर आधारित',
      step1Desc:
        'किसी भी NCERT/SCERT पाठ्यपुस्तक अध्याय का चयन करें या फोटो खींचें। इंजन पाठ को अनुभागों में बांटकर उद्धरण सत्यापित करता है।',
      step2Title: 'समयबद्ध योजना व 100% सत्यापित क्विज',
      step2Desc:
        'शिक्षकों को 30, 40 या 45 मिनट की सटीक घंटी योजना मिलती है, साथ ही 5 बहुविकल्पीय प्रश्न जिनकी उत्तर कुंजी पुस्तक से जांची जाती है।',
      step3Title: 'डाउट-से-डैशबोर्ड निरंतर चक्र',
      step3Desc:
        'छात्र हिंदी या हिंग्लिश में बोलकर संशय पूछते हैं। हर सवाल अनुभाग से जुड़ता है, जिससे कक्षा के कमजोर विषय (जैसे "रंध्र पर 12 संशय") उजागर होते हैं।',
    },
    features: {
      tag: 'विशिष्टताएं',
      title: 'बिहार की कक्षाओं की जमीनी आवश्यकताओं के अनुरूप',
      f1Title: 'हिंदी एवं हिंग्लिश वाणी पहचान',
      f1Desc:
        'प्रथम पीढ़ी के शिक्षार्थी माइक दबाकर अपनी सहज बोली, हिंदी या हिंग्लिश में प्रश्न पूछ सकते हैं।',
      f2Title: 'घर की बोली में व्याख्या',
      f2Desc:
        'कठिन वैज्ञानिक अवधारणाओं को देहाती घरेलू उदाहरणों के साथ सरल हिंदी में समझाने का विशेष विकल्प।',
      f3Title: 'शून्य-भ्रम सुरक्षा घेरा (No Hallucination)',
      f3Desc:
        'हर उत्तर के साथ पुस्तक का अनुभाग और मूल वाक्य दिखाना अनिवार्य है। पाठ से बाहर के प्रश्नों पर विनम्रता से मनाही होती है।',
      f4Title: 'सटीक समयबद्ध पाठ योजना जनरेटर',
      f4Desc:
        'कक्षा 6-8 के लिए 30, 40 या 45 मिनट की घंटी के अनुसार कम लागत वाली शिक्षण सामग्री और श्यामपट्ट चित्र विवरण।',
      f5Title: 'कोड-गणना आधारित टेलीमेट्री डैशबोर्ड',
      f5Desc:
        'बिना किसी अनुमान के शुद्ध कोड से विषयों की औसत समझ निकाली जाती है और कमजोर छात्रों के उपचारात्मक समूह बनते हैं।',
      f6Title: 'अभिभावक WhatsApp प्रगति पत्र',
      f6Desc:
        'सरल देवनागरी हिंदी में 1-क्लिक रिपोर्ट कार्ड, जिसे शिक्षक की स्वीकृति के बाद सीधे माता-पिता को भेजा जा सकता है।',
    },
    roleCards: {
      tag: 'अपनी भूमिका चुनें',
      title: 'आज गुरुकुल AI का उपयोग कौन कर रहा है?',
      studentTitle: 'विद्यार्थियों के लिए',
      studentDesc: 'बोलकर या लिखकर सवाल पूछें। सीधे अपनी पाठ्यपुस्तक से सरल हिंदी और घर की बोली में उत्तर पाएं।',
      studentBtn: 'विद्यार्थी संशय चैट खोलें →',
      teacherTitle: 'शिक्षकों के लिए',
      teacherDesc: '5 सेकंड में समयबद्ध पाठ योजना बनाएं, 5-प्रश्नों का क्विज निकालें और कक्षा 7A की समझ का डैशबोर्ड देखें।',
      teacherBtn: 'शिक्षक पोर्टल खोलें →',
      deoTitle: 'प्रशासनिक अधिकारियों (DEO) के लिए',
      deoDesc: 'पटना जिले के प्रखंड-वार छात्रों के डाउट रुझान, कमजोर विषय और 30-विद्यार्थियों की सूची का निरीक्षण करें।',
      deoBtn: 'जिला स्तरीय दृश्य खोलें →',
    },
    faq: {
      tag: 'सामान्य प्रश्न (FAQ)',
      title: 'अक्सर पूछे जाने वाले सवाल',
      subtitle: 'शिक्षकों, प्रधानाध्यापकों और छात्रों के सभी प्रश्नों के स्पष्ट उत्तर।',
    },
    generator: {
      title: 'शिक्षक जनरेटर: पाठ योजना एवं क्विज',
      subtitle: 'पाठ्यपुस्तक के आधार पर समयबद्ध पाठ योजना और 5 बहुविकल्पीय प्रश्न तैयार करें।',
      classLabel: 'कक्षा',
      subjectLabel: 'विषय',
      chapterLabel: 'पाठ्यपुस्तक अध्याय',
      durationLabel: 'घंटी की अवधि',
      langLabel: 'आउटपुट भाषा',
      generateBtn: 'पाठ योजना एवं 5-प्रश्न क्विज बनाएं',
      generating: 'सत्यापित योजना तैयार हो रही है...',
      uploadBtn: '+ नया अध्याय अपलोड करें (टेक्स्ट या फोटो)',
      objectives: 'अधिगम उद्देश्य (Learning Objectives)',
      materials: 'कम लागत वाली शिक्षण सामग्री (TLM)',
      boardDiagram: 'श्यामपट्ट चित्र विवरण (Board Diagram)',
      lessonFlow: 'समयबद्ध घंटी प्रवाह (Timed Period Flow)',
      quizTitle: '5-प्रश्नों का त्वरित क्विज (सर्वर द्वारा सत्यापित)',
      verifiedBadge: 'पुस्तक के प्रमाण सहित सत्यापित',
      copyBtn: 'कॉपी करें',
      copied: 'क्लिपबोर्ड पर कॉपी हो गया!',
      printBtn: 'प्रिंट / PDF सेव करें',
      whatsappBtn: 'WhatsApp पर साझा करें',
    },
    uploadModal: {
      modalTitle: 'नया अध्याय जोड़ें (टेक्स्ट, फाइल या फोटो)',
      modalDesc: 'पाठ्यपुस्तक का टेक्स्ट पेस्ट करें, टेक्स्ट फाइल अपलोड करें या पुस्तक के पृष्ठ की फोटो अपलोड करें। इसे स्वतः अनुभागों में विभाजित किया जाएगा।',
      chapterTitleLabel: 'अध्याय का नाम / शीर्षक',
      chapterTitlePlaceholder: 'उदा. कक्षा 7 विज्ञान: जीवों में श्वसन',
      photoTab: 'फोटो अपलोड (जेमिनी विजन OCR)',
      photoHint: 'पाठ्यपुस्तक के पृष्ठ की फोटो खींचें या चुनें। टेक्स्ट स्वतः निकाल लिया जाएगा।',
      textTab: 'टेक्स्ट या फाइल अपलोड',
      textLabel: 'अध्याय का विवरण (अनुभाग 1:, अनुभाग 2: या अनुच्छेदों सहित)',
      textPlaceholder: 'अनुभाग 1: प्रस्तावना...\nअनुभाग 2: मुख्य बिंदु...',
      fileUploadBtn: 'टेक्स्ट/डॉक फाइल चुनें (.txt, .md)',
      cancelBtn: 'रद्द करें',
      saveBtn: 'अध्याय सुरक्षित करें',
      saving: 'अध्याय सुरक्षित किया जा रहा है...',
      successMsg: 'अध्याय सफलतापूर्वक अपलोड और अनुभागों में विभाजित हो गया!',
      errorMsg: 'कृपया अध्याय का विवरण लिखें या फाइल/फोटो चुनें।',
    },
    chat: {
      welcome: 'नमस्ते! मैं गुरुकुल AI हूँ। अपने पाठ से कोई भी सवाल पूछें—बोलकर या लिखकर। मैं केवल आपकी किताब से उत्तर दूँगा।',
      inputPlaceholder: 'अपना संशय यहाँ लिखें या माइक दबाकर हिंदी/अंग्रेजी में बोलें...',
      sendBtn: 'भेजें',
      listening: 'सुन रहे हैं... कृपया हिंदी या अंग्रेजी में बोलें',
      listeningHint: 'संशय भेजने के लिए पुनः माइक दबाएं या बोलना बंद करें',
      micNotSupported: 'इस ब्राउज़र में माइक समर्थित नहीं है। कृपया नीचे दिए गए संशय पर टैप करें।',
      micBlockedHint: 'माइक की अनुमति आवश्यक है। आप नीचे दिए गए उदाहरण संशय पर भी टैप कर सकते हैं।',
      sampleDoubtTitle: 'उदाहरण संशय (पूछने के लिए टैप करें):',
      sampleDoubts: [
        'stomata kya hota hai?',
        'पौधे अपना भोजन कैसे बनाते हैं?',
        'कवक या मशरूम कैसे पोषण लेते हैं?',
        'पत्ती में स्टार्च की जाँच कैसे करते हैं?',
        'क्लोरोफिल का क्या काम है?',
      ],
      sectionCitation: 'किताब का अनुभाग:',
      quoteCitation: 'किताब का मूल वाक्य (प्रमाण):',
      gharKiBoli: 'घर की बोली (गाँव की भाषा में समझें):',
      bilingual: 'द्विभाषी अनुवाद (Bilingual):',
      forwardToTeacher: 'यह सवाल पाठ में नहीं है? शिक्षक को भेजें',
      forwardedSuccess: 'शिक्षिका सुनीता मिश्रा के इनबॉक्स में भेज दिया गया!',
      switchStudent: 'विद्यार्थी प्रोफाइल:',
    },
  },
};
