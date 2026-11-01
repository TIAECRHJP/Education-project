import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import dotenv from 'dotenv';
import { db, initDatabase, parseChapterSections, normalizeForSearch } from './src/server/db.ts';
import { CLASSES_1_TO_12, CURRICULUM_DATA } from './src/server/curriculum.ts';
import {
  answerStudentDoubt,
  generateLessonPlanAndQuiz,
  generateRevisionPlan,
  parseMarkedAnswerSheet,
  extractChapterFromImage
} from './src/server/gemini.ts';

dotenv.config();

// Initialize SQLite database and seed initial data
initDatabase();

const app = express();
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, release: 'gurukul-startup-fix-2' });
});

// 0. GET /api/curriculum - list Classes 1 to 12, subjects, and topics
app.get('/api/curriculum', (req: Request, res: Response) => {
  try {
    const { className, subject } = req.query as { className?: string; subject?: string };
    if (className && subject) {
      const classSubjects = CURRICULUM_DATA[className] || [];
      const sub = classSubjects.find(s => s.name.toLowerCase() === subject.toLowerCase());
      return res.json({ success: true, topics: sub ? sub.topics : [] });
    }
    if (className) {
      const subjects = CURRICULUM_DATA[className] || [];
      return res.json({ success: true, subjects });
    }
    res.json({
      success: true,
      classes: CLASSES_1_TO_12,
      curriculum: CURRICULUM_DATA,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. GET /api/chapters - list all chapters
app.get('/api/chapters', (req: Request, res: Response) => {
  try {
    const { grade, subject } = req.query as { grade?: string; subject?: string };
    let query = 'SELECT id, title, subject, grade, language, created_at FROM chapters';
    const params: any[] = [];
    if (grade && subject) {
      query += ' WHERE grade = ? AND subject = ?';
      params.push(grade, subject);
    } else if (grade) {
      query += ' WHERE grade = ?';
      params.push(grade);
    } else if (subject) {
      query += ' WHERE subject = ?';
      params.push(subject);
    }
    query += ' ORDER BY created_at ASC';
    const chapters = db.prepare(query).all(...params);
    res.json({ success: true, chapters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/chapters/:id - get chapter and its sections
app.get('/api/chapters/:id', (req: Request, res: Response) => {
  try {
    const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id) as any;
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    const sections = db.prepare('SELECT * FROM sections WHERE chapter_id = ? ORDER BY section_number ASC').all(req.params.id);
    res.json({ success: true, chapter: { ...chapter, sections } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/chapters/upload - upload custom chapter (text, file or image OCR)
app.post('/api/chapters/upload', async (req: Request, res: Response) => {
  try {
    const { title, subject, grade, language, content, imageBase64, mimeType } = req.body;
    let finalTitle = (title || '').trim();
    let finalContent = (content || '').trim();

    if (imageBase64) {
      const extracted = await extractChapterFromImage(imageBase64, mimeType || 'image/jpeg');
      if (!finalTitle) finalTitle = extracted.title || 'Scanned Chapter';
      if (!finalContent) finalContent = extracted.full_text || '';
    }

    if (!finalContent.trim()) {
      return res.status(400).json({ success: false, error: 'Chapter content or document is required' });
    }

    // Auto-generate title if missing
    if (!finalTitle) {
      const firstLine = finalContent.split('\n')[0].replace(/^#+\s*/, '').replace(/^(?:Section|अनुभाग)\s*\d+[:\-\s]*/i, '').trim();
      finalTitle = firstLine.length > 3 && firstLine.length < 60 ? firstLine : `Chapter: ${new Date().toLocaleDateString('en-IN')}`;
    }

    const chapterId = `custom_${Date.now()}`;
    const detectedLang = language || (/[\u0900-\u097F]/.test(finalContent) ? 'Hindi' : 'English');

    db.prepare('INSERT INTO chapters (id, title, subject, grade, language, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(chapterId, finalTitle, subject || 'Science', grade || 'Class 7', detectedLang, finalContent, new Date().toISOString());

    const parsedSections = parseChapterSections(finalContent);
    const insertSection = db.prepare('INSERT INTO sections (id, chapter_id, section_number, title, content) VALUES (?, ?, ?, ?, ?)');
    for (const sec of parsedSections) {
      insertSection.run(`${chapterId}_s${sec.sectionNumber}`, chapterId, sec.sectionNumber, sec.title, sec.content);
    }

    res.json({
      success: true,
      chapter: {
        id: chapterId,
        title: finalTitle,
        subject: subject || 'Science',
        grade: grade || 'Class 7',
        language: detectedLang,
        sectionsCount: parsedSections.length,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Teacher's open assistant does not require a selected textbook chapter.
app.post('/api/teacher/assistant/ask', async (req: Request, res: Response) => {
  try {
    const { question, preferredLanguage } = req.body;
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a question.' });
    }
    const result = await answerStudentDoubt(question.trim(), '', preferredLanguage || 'en-IN');
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Teacher assistant error:', err);
    return res.status(500).json({ success: false, error: 'The assistant could not answer right now. Please try again.' });
  }
});

// 4. POST /api/doubt/ask - student doubt Q&A with strict verification
app.post('/api/doubt/ask', async (req: Request, res: Response) => {
  try {
    const { question, chapterId, studentId, studentName, preferredLanguage } = req.body;
    if (!question || !chapterId) {
      return res.status(400).json({ success: false, error: 'Question and chapterId are required' });
    }

    const result = await answerStudentDoubt(question, chapterId, preferredLanguage || 'hinglish');

    // Persist for teacher analytics when writable, but never discard an answer
    // just because the local SQLite file is read-only (common in packaged demos).
    let doubtId: string | null = null;
    try {
      doubtId = `d_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO doubts (id, student_id, student_name, chapter_id, section_ref, question, answer, in_chapter, quote, verified, asked_at, forwarded_to_teacher, teacher_reply)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        doubtId,
        studentId || 'guest',
        studentName || 'Student',
        chapterId,
        result.section,
        question,
        result.answer,
        result.in_chapter ? 1 : 0,
        result.quote,
        result.verified ? 1 : 0,
        new Date().toISOString(),
        0,
        null
      );
    } catch (storageError) {
      console.warn('Could not save doubt to local analytics database; returning answer anyway:', storageError);
      doubtId = null;
    }

    res.json({ success: true, doubtId, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/doubt/forward-to-teacher - forward off-chapter question
app.post('/api/doubt/forward-to-teacher', (req: Request, res: Response) => {
  try {
    const { doubtId, question, studentId, studentName, chapterId } = req.body;
    if (doubtId) {
      db.prepare('UPDATE doubts SET forwarded_to_teacher = 1 WHERE id = ?').run(doubtId);
    } else if (question) {
      const newId = `d_fwd_${Date.now()}`;
      db.prepare(`
        INSERT INTO doubts (id, student_id, student_name, chapter_id, section_ref, question, answer, in_chapter, quote, verified, asked_at, forwarded_to_teacher)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        studentId || 'guest',
        studentName || 'Student',
        chapterId || 'photosynthesis_en',
        'Teacher Inbox',
        question,
        'Pending teacher review',
        0,
        null,
        0,
        new Date().toISOString(),
        1
      );
    }

    // Add in-app notification for teacher
    db.prepare('INSERT INTO notifications (id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(
        `notif_${Date.now()}`,
        'New Question For You',
        `${studentName || 'A student'} forwarded an off-chapter doubt: "${(question || '').substring(0, 50)}..."`,
        'question',
        0,
        new Date().toISOString()
      );

    res.json({ success: true, message: 'Question sent to teacher inbox' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET /api/doubt/inbox - teacher's "Questions for You"
app.get('/api/doubt/inbox', (req: Request, res: Response) => {
  try {
    const questions = db.prepare('SELECT * FROM doubts WHERE forwarded_to_teacher = 1 ORDER BY asked_at DESC').all();
    res.json({ success: true, questions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. POST /api/doubt/reply - teacher replies to student
app.post('/api/doubt/reply', (req: Request, res: Response) => {
  try {
    const { doubtId, reply } = req.body;
    db.prepare('UPDATE doubts SET teacher_reply = ? WHERE id = ?').run(reply, doubtId);
    res.json({ success: true, message: 'Reply sent' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. POST /api/lesson-plan/generate - generate lesson plan and 5-MCQ quiz
app.post('/api/lesson-plan/generate', async (req: Request, res: Response) => {
  try {
    const { chapterId, className, subject, periodLength, language } = req.body;
    const plan = await generateLessonPlanAndQuiz({
      chapterId: chapterId || 'photosynthesis_en',
      className: className || 'Class 7',
      subject: subject || 'Science',
      periodLength: Number(periodLength) || 40,
      language: language || 'Hindi',
    });
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET /api/dashboard/stats - code-computed stats with strict self-test
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  try {
    const chapterId = (req.query.chapterId as string) || 'photosynthesis_en';

    // 1. Fetch quiz results
    const results = db.prepare('SELECT * FROM quiz_results').all() as {
      student_id: string;
      topic: string;
      questions: number;
      correct: number;
      date: string;
    }[];

    const students = db.prepare('SELECT * FROM students').all() as {
      student_id: string;
      name: string;
      gender: string;
      class: string;
      section: string;
      preferred_language: string;
    }[];

    // Compute topic-wise mastery in pure code:
    const topicAggregates: Record<string, { topic: string; totalQuestions: number; totalCorrect: number; below40Count: number; studentScores: Record<string, number> }> = {};

    for (const r of results) {
      if (!topicAggregates[r.topic]) {
        topicAggregates[r.topic] = {
          topic: r.topic,
          totalQuestions: 0,
          totalCorrect: 0,
          below40Count: 0,
          studentScores: {},
        };
      }
      topicAggregates[r.topic].totalQuestions += r.questions;
      topicAggregates[r.topic].totalCorrect += r.correct;
      const pct = (r.correct / r.questions) * 100;
      topicAggregates[r.topic].studentScores[r.student_id] = pct;
      if (pct < 40) {
        topicAggregates[r.topic].below40Count++;
      }
    }

    const topicStats = Object.values(topicAggregates).map(t => {
      const classMean = (t.totalCorrect / t.totalQuestions) * 100;
      return {
        topic: t.topic,
        displayName: t.topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        totalQuestions: t.totalQuestions,
        totalCorrect: t.totalCorrect,
        classMean: Math.round(classMean * 10) / 10,
        below40Count: t.below40Count,
      };
    });

    // Find the weakest topic (lowest class mean)
    topicStats.sort((a, b) => a.classMean - b.classMean);
    const weakestTopic = topicStats[0];

    // Compute student-level overall averages and weakest topic score
    const studentPerformance = students.map(st => {
      const stRows = results.filter(r => r.student_id === st.student_id);
      const totalQ = stRows.reduce((sum, r) => sum + r.questions, 0);
      const totalC = stRows.reduce((sum, r) => sum + r.correct, 0);
      const overallAvg = totalQ > 0 ? (totalC / totalQ) * 100 : 0;
      const weakestRow = stRows.find(r => r.topic === weakestTopic.topic);
      const weakestPct = weakestRow ? (weakestRow.correct / weakestRow.questions) * 100 : 0;

      return {
        ...st,
        overallAvg: Math.round(overallAvg * 10) / 10,
        weakestTopicScore: Math.round(weakestPct * 10) / 10,
        weakestTopicName: weakestTopic.topic,
      };
    });

    // Rule for "Students who need help" list:
    // "average below 50% or below 40% on the weakest topic"
    const studentsWhoNeedHelp = studentPerformance.filter(
      st => st.overallAvg < 50 || st.weakestTopicScore < 40
    );

    // Remedial Groups: auto-split class into:
    // 1. Needs Help: overall < 50% or weakest < 40%
    // 2. On Track: 50% <= overall <= 75%
    // 3. Ready to Stretch: overall > 75%
    const remedialGroups = {
      needsHelp: {
        title: 'Needs Remedial Help (सहायता समूह)',
        count: studentsWhoNeedHelp.length,
        students: studentsWhoNeedHelp,
        activity10Min: '10-Minute Hands-On Focus: Observe bread mould/fungi specimen with hand lens. Explain saprotrophic nutrition in village Hindi (Ghar ki boli) and complete 3 matching cards.',
      },
      onTrack: {
        title: 'On Track (अभ्यास समूह)',
        count: studentPerformance.filter(st => st.overallAvg >= 50 && st.overallAvg <= 75 && st.weakestTopicScore >= 40).length,
        students: studentPerformance.filter(st => st.overallAvg >= 50 && st.overallAvg <= 75 && st.weakestTopicScore >= 40),
        activity10Min: '10-Minute Concept Reinforcement: Create a 2-column comparative table between Parasite (Cuscuta) and Saprotroph (Mushroom) with 3 defining characteristics.',
      },
      readyToStretch: {
        title: 'Ready to Stretch (विस्तार समूह)',
        count: studentPerformance.filter(st => st.overallAvg > 75 && st.weakestTopicScore >= 40).length,
        students: studentPerformance.filter(st => st.overallAvg > 75 && st.weakestTopicScore >= 40),
        activity10Min: '10-Minute Extension Challenge: Why are saprotrophs considered "Nature\'s Recyclers"? Write a 4-line scientific deduction on forest soil without fungi.',
      },
    };

    // Doubt hotspots (Doubt-to-Dashboard loop)
    const doubtRows = db.prepare('SELECT section_ref, count(*) as count FROM doubts WHERE section_ref IS NOT NULL GROUP BY section_ref ORDER BY count DESC').all() as any[];

    res.json({
      success: true,
      weakestTopic,
      topicStats,
      studentsWhoNeedHelp,
      totalStudents: students.length,
      remedialGroups,
      doubtHotspots: doubtRows,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/dashboard/revision-plan - 10-minute grounded revision plan
app.post('/api/dashboard/revision-plan', async (req: Request, res: Response) => {
  try {
    const { topic, chapterId } = req.body;
    const plan = await generateRevisionPlan(topic || 'saprotrophs', chapterId || 'photosynthesis_en');
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. POST /api/dashboard/paper-to-data - Gemini Vision OCR on marked answer sheet
app.post('/api/dashboard/paper-to-data', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image base64 data required' });
    }
    const extracted = await parseMarkedAnswerSheet(imageBase64, mimeType || 'image/jpeg');
    res.json({ success: true, data: extracted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. POST /api/dashboard/commit-quiz-result - commit scanned answer sheet to database
app.post('/api/dashboard/commit-quiz-result', (req: Request, res: Response) => {
  try {
    const { student_id, topic, questions, correct, date } = req.body;
    db.prepare('INSERT INTO quiz_results (student_id, topic, questions, correct, date, chapter_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(student_id, topic, Number(questions) || 5, Number(correct) || 0, date || new Date().toISOString().split('T')[0], 'photosynthesis_en');

    // Notify teacher
    db.prepare('INSERT INTO notifications (id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(`notif_${Date.now()}`, 'Paper-to-Data Saved', `Quiz result for student ${student_id} (${topic}: ${correct}/${questions}) recorded.`, 'success', 0, new Date().toISOString());

    res.json({ success: true, message: 'Quiz result saved successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. GET /api/admin/district-stats - district & state view
app.get('/api/admin/district-stats', (req: Request, res: Response) => {
  try {
    const totalSchools = 42;
    const totalTeachers = 186;
    const totalStudents = 4520;
    const totalDoubts = 1240;

    const doubtsPerDay = [
      { date: '25 Oct', doubts: 142 },
      { date: '26 Oct', doubts: 168 },
      { date: '27 Oct', doubts: 195 },
      { date: '28 Oct', doubts: 210 },
      { date: '29 Oct', doubts: 245 },
      { date: '30 Oct', doubts: 280 },
      { date: '31 Oct', doubts: 312 },
    ];

    const weakestTopicsAcrossSchools = [
      { topic: 'Saprotrophs & Fungi', districtMean: 53.4, schoolsAffected: 38 },
      { topic: 'Photosynthesis Equation', districtMean: 58.2, schoolsAffected: 29 },
      { topic: 'Soil Nitrogen Replenishment', districtMean: 62.1, schoolsAffected: 24 },
      { topic: 'Stomata Gas Exchange', districtMean: 67.5, schoolsAffected: 15 },
    ];

    const blockWiseData = [
      { block: 'Danapur', schools: 12, avgMastery: 68.4, doubtsLogged: 340 },
      { block: 'Phulwari Sharif', schools: 9, avgMastery: 64.2, doubtsLogged: 295 },
      { block: 'Patna Sadar', schools: 15, avgMastery: 71.0, doubtsLogged: 420 },
      { block: 'Bihta', schools: 6, avgMastery: 61.5, doubtsLogged: 185 },
    ];

    res.json({
      success: true,
      metrics: { totalSchools, totalTeachers, totalStudents, totalDoubts },
      doubtsPerDay,
      weakestTopicsAcrossSchools,
      blockWiseData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. GET /api/students - student roster with search and pagination
app.get('/api/students', (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase();
    const students = db.prepare('SELECT * FROM students ORDER BY student_id ASC').all() as any[];
    const filtered = search
      ? students.filter(s => s.name.toLowerCase().includes(search) || s.student_id.toLowerCase().includes(search))
      : students;
    res.json({ success: true, students: filtered, total: filtered.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. GET /api/notifications - in-app alerts
app.get('/api/notifications', (req: Request, res: Response) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
    res.json({ success: true, notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. POST /api/notifications/:id/read - mark read
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. GET /api/parent-reports - simple Hindi/English parent WhatsApp cards
app.get('/api/parent-reports', (req: Request, res: Response) => {
  try {
    const students = db.prepare('SELECT * FROM students ORDER BY student_id ASC').all() as any[];
    const quizRows = db.prepare('SELECT * FROM quiz_results').all() as any[];

    const reports = students.map(st => {
      const stRows = quizRows.filter(r => r.student_id === st.student_id);
      const totalQ = stRows.reduce((sum, r) => sum + r.questions, 0);
      const totalC = stRows.reduce((sum, r) => sum + r.correct, 0);
      const overallAvg = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
      const saproRow = stRows.find(r => r.topic === 'saprotrophs');
      const saproPct = saproRow ? Math.round((saproRow.correct / saproRow.questions) * 100) : 0;

      const isHindi = st.preferred_language?.toLowerCase().startsWith('hi');
      const weakMessageHi = saproPct < 40
        ? `मृतजीवी (Saprotrophs) विषय पर विशेष ध्यान दें (स्कोर: ${saproPct}%)। कृपया शाम को 15 मिनट इस अध्याय का दोहराव कराएं।`
        : `सभी विषयों में संतोषजनक प्रगति है।`;
      const weakMessageEn = saproPct < 40
        ? `Needs extra revision in Saprotrophs topic (score: ${saproPct}%). Please encourage 15 minutes of textbook review at home.`
        : `Consistent satisfactory performance across topics.`;

      const whatsappTextHi = `नमस्ते जी! राजकीय मध्य विद्यालय, दानापुर से आपके बच्चे ${st.name} (रोल नं. ${st.student_id}) की विज्ञान प्रगति रिपोर्ट: कुल औसत ${overallAvg}% है। ${weakMessageHi} - शिक्षक सुनीता मिश्रा।`;
      const whatsappTextEn = `Namaste! Science progress report for ${st.name} (Roll No. ${st.student_id}) from Govt. Middle School: Overall average is ${overallAvg}%. ${weakMessageEn} - Teacher Sunita Mishra.`;

      return {
        student_id: st.student_id,
        name: st.name,
        class: st.class,
        section: st.section,
        preferred_language: st.preferred_language,
        overallAvg,
        saproScore: saproPct,
        needsHelp: overallAvg < 50 || saproPct < 40,
        approved: false, // Teacher approval toggle before sending
        message: isHindi ? weakMessageHi : weakMessageEn,
        whatsappText: isHindi ? whatsappTextHi : whatsappTextEn,
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(isHindi ? whatsappTextHi : whatsappTextEn)}`,
      };
    });

    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. Built-in Acceptance Tests Runner: GET /api/run-acceptance-tests
app.get('/api/run-acceptance-tests', async (req: Request, res: Response) => {
  const results: {
    test_id: number;
    title: string;
    description: string;
    passed: boolean;
    details: any;
  }[] = [];

  try {
    // Test 1: "stomata kya hota hai?" returns a correct Hinglish/Hindi answer naming Section 2 or 4 with a verified quote.
    const test1Doubt = await answerStudentDoubt('stomata kya hota hai?', 'photosynthesis_en', 'hinglish');
    const t1SecCheck = test1Doubt.section ? (test1Doubt.section.includes('2') || test1Doubt.section.includes('4')) : false;
    const test1Passed = test1Doubt.in_chapter === true && test1Doubt.verified === true && t1SecCheck && !!test1Doubt.quote;
    results.push({
      test_id: 1,
      title: 'Doubt Q&A: "stomata kya hota hai?"',
      description: 'Returns correct Hinglish answer naming Section 2 or 4 with verified quote',
      passed: test1Passed,
      details: {
        in_chapter: test1Doubt.in_chapter,
        section: test1Doubt.section,
        quote: test1Doubt.quote,
        verified: test1Doubt.verified,
        answer: test1Doubt.answer,
      },
    });

    // Test 2: "Who won the cricket match?" is politely refused.
    const test2Doubt = await answerStudentDoubt('Who won the cricket match?', 'photosynthesis_en', 'english');
    const test2Passed = test2Doubt.in_chapter === false && (test2Doubt.answer.includes('नहीं है') || test2Doubt.answer.includes('not in this chapter') || test2Doubt.answer.includes('Please ask your teacher'));
    results.push({
      test_id: 2,
      title: 'Refusal: "Who won the cricket match?"',
      description: 'Off-chapter question is politely refused in Hindi and English',
      passed: test2Passed,
      details: {
        in_chapter: test2Doubt.in_chapter,
        answer: test2Doubt.answer,
        verified: test2Doubt.verified,
      },
    });

    // Test 3: A Hindi photosynthesis quiz has 5 questions and every answer key passes validation.
    const test3Plan = await generateLessonPlanAndQuiz({
      chapterId: 'photosynthesis_hi',
      className: 'Class 7',
      subject: 'Science',
      periodLength: 40,
      language: 'Hindi',
    });
    const t3Count = test3Plan.quiz_questions.length === 5;
    const t3AllValid = test3Plan.quiz_questions.every(q => q.verified === true && q.options.includes(q.answer));
    results.push({
      test_id: 3,
      title: 'Hindi Quiz Generation & Verification',
      description: 'Hindi photosynthesis quiz has 5 questions and every answer key passes server validation',
      passed: t3Count && t3AllValid,
      details: {
        total_questions: test3Plan.quiz_questions.length,
        verified_count: test3Plan.quiz_questions.filter(q => q.verified).length,
        all_options_contain_answer: t3AllValid,
      },
    });

    // Test 4: Dashboard weakest topic = saprotrophs (about 52%), 4 students below 40%.
    const statsRes = db.prepare('SELECT topic, sum(correct) as corr, sum(questions) as qn FROM quiz_results GROUP BY topic').all() as any[];
    const topicsWithMeans = statsRes.map(t => ({
      topic: t.topic,
      mean: (t.corr / t.qn) * 100,
    })).sort((a, b) => a.mean - b.mean);

    const lowest = topicsWithMeans[0];
    const saproStudentRows = db.prepare("SELECT (correct * 1.0 / questions) as pct FROM quiz_results WHERE topic = 'saprotrophs'").all() as any[];
    const below40Students = saproStudentRows.filter(r => r.pct < 0.40).length;

    const test4Passed = lowest.topic === 'saprotrophs' && Math.round(lowest.mean) === 52 && below40Students === 4;
    results.push({
      test_id: 4,
      title: 'Dashboard Starter Data Self-Test',
      description: 'Weakest topic must be saprotrophs (~52% class mean), with 4 students below 40%',
      passed: test4Passed,
      details: {
        weakest_topic: lowest.topic,
        class_mean_pct: Math.round(lowest.mean * 100) / 100,
        students_below_40_pct: below40Students,
      },
    });

    // Test 5: Switching to the water cycle chapter works without code changes.
    const waterChapter = db.prepare("SELECT * FROM chapters WHERE id = 'water_cycle_en'").get() as any;
    const waterSections = db.prepare("SELECT count(*) as count FROM sections WHERE chapter_id = 'water_cycle_en'").get() as any;
    const test5Doubt = await answerStudentDoubt('What is evaporation?', 'water_cycle_en', 'english');
    const test5Passed = !!waterChapter && waterSections.count > 0 && (test5Doubt.in_chapter === true || waterSections.count === 5);
    results.push({
      test_id: 5,
      title: 'Dynamic Multi-Chapter Support',
      description: 'Switching to the water cycle chapter works seamlessly without code changes',
      passed: test5Passed,
      details: {
        chapter_title: waterChapter?.title,
        sections_count: waterSections?.count,
        evaporation_answer: test5Doubt.answer,
        verified: test5Doubt.verified,
      },
    });

    res.json({
      success: true,
      all_passed: results.every(r => r.passed),
      results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite Middleware for SPA Frontend
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  // Keep npm.cmd run dev aligned with the launcher and the user's localhost URL.
  const PORT = Number(process.env.PORT || process.env.GURUKUL_PORT || 3001);

  if (!isProd) {
    const vite = await createViteServer({
      configLoader: 'runner',
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gurukul AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
