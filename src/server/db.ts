import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CURRICULUM_DATA } from './curriculum.ts';

// Keep runtime writes out of the project/download folder, which may be read-only
// in packaged copies. Copy the bundled database there once so existing lessons remain available.
const bundledDbPath = path.resolve(process.cwd(), 'database.sqlite');
const userDataDir = process.env.GURUKUL_DATA_DIR || path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), '.local', 'share'),
  'GurukulAI'
);
fs.mkdirSync(userDataDir, { recursive: true });
const DB_PATH = path.join(userDataDir, 'database.sqlite');
if (!fs.existsSync(DB_PATH) && fs.existsSync(bundledDbPath)) {
  fs.copyFileSync(bundledDbPath, DB_PATH);
}
if (process.platform === 'win32' && fs.existsSync(DB_PATH)) {
  fs.chmodSync(DB_PATH, 0o666);
}
export const db = new DatabaseSync(DB_PATH);

// Helper to normalize strings for robust quote matching
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ') // preserves Unicode letters, Indic vowel marks/matras, and numbers
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseChapterSections(content: string): { sectionNumber: number; title: string; content: string }[] {
  const sections: { sectionNumber: number; title: string; content: string }[] = [];
  
  // Match Section X: Title or अनुभाग X: Title
  // Regex handles:
  // "Section 1: Introduction to Plant Nutrition"
  // "अनुभाग 1: पौधों में पोषण की विधियाँ"
  // or "1. Title"
  const lines = content.split('\n');
  let currentSection: { sectionNumber: number; title: string; content: string } | null = null;
  const sectionHeaderRegex = /^(?:Section|अनुभाग)\s*(\d+)[:\.\s\-]+([^\n\r]+)/i;
  const fallbackNumberRegex = /^(\d+)[\.\)]\s+([^\n\r]+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match = trimmed.match(sectionHeaderRegex);
    if (!match) {
      match = trimmed.match(fallbackNumberRegex);
    }

    if (match) {
      if (currentSection) {
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }
      currentSection = {
        sectionNumber: parseInt(match[1], 10),
        title: match[2].trim(),
        content: '',
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }

  // If no sections matched regex (unstructured custom text), split into logical numbered sections
  if (sections.length === 0 && content.trim().length > 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    paragraphs.forEach((p, idx) => {
      sections.push({
        sectionNumber: idx + 1,
        title: `Section ${idx + 1}`,
        content: p.trim(),
      });
    });
  }

  return sections;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      school TEXT,
      district TEXT
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      language TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      section_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      student_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      class TEXT NOT NULL,
      section TEXT NOT NULL,
      preferred_language TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      questions INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      date TEXT NOT NULL,
      chapter_id TEXT
    );

    CREATE TABLE IF NOT EXISTS doubts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      section_ref TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      in_chapter INTEGER NOT NULL,
      quote TEXT,
      verified INTEGER NOT NULL,
      asked_at TEXT NOT NULL,
      forwarded_to_teacher INTEGER DEFAULT 0,
      teacher_reply TEXT
    );

    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = (db.prepare('SELECT count(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, name, email, role, school, district) VALUES (?, ?, ?, ?, ?, ?)');
    insertUser.run('u_teacher_1', 'Sunita Mishra', 'sunita.teacher@bihar.gov.in', 'teacher', 'Govt. Middle School, Danapur', 'Patna');
    insertUser.run('u_admin_1', 'Dr. Rajeshwar Sharma', 'rajeshwar.deo@bihar.gov.in', 'admin', 'District Education Office', 'Patna');
  }

  // Seed Chapters
  const dataDir = path.resolve(process.cwd(), 'data');
  const chapters = [
    {
      id: 'photosynthesis_en',
      title: 'How Plants Make Their Food (English)',
      subject: 'Science',
      grade: 'Class 7',
      language: 'English',
      filename: 'chapter_photosynthesis_en.txt',
    },
    {
      id: 'photosynthesis_hi',
      title: 'पौधे अपना भोजन कैसे बनाते हैं (हिंदी)',
      subject: 'Science',
      grade: 'Class 7',
      language: 'Hindi',
      filename: 'chapter_photosynthesis_hi.txt',
    },
    {
      id: 'water_cycle_en',
      title: 'The Water Cycle (English)',
      subject: 'Science',
      grade: 'Class 6',
      language: 'English',
      filename: 'chapter_water_cycle_en.txt',
    },
  ];

  for (const ch of chapters) {
    const filePath = path.join(dataDir, ch.filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const existing = db.prepare('SELECT id FROM chapters WHERE id = ?').get(ch.id);
      if (!existing) {
        db.prepare('INSERT INTO chapters (id, title, subject, grade, language, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(ch.id, ch.title, ch.subject, ch.grade, ch.language, content, new Date().toISOString());

        const parsed = parseChapterSections(content);
        const insertSection = db.prepare('INSERT INTO sections (id, chapter_id, section_number, title, content) VALUES (?, ?, ?, ?, ?)');
        for (const sec of parsed) {
          insertSection.run(`${ch.id}_s${sec.sectionNumber}`, ch.id, sec.sectionNumber, sec.title, sec.content);
        }
      }
    }
  }

  // Seed all subjects and topics for Classes 1 to 12 from CURRICULUM_DATA
  const insertChapterStmt = db.prepare('INSERT INTO chapters (id, title, subject, grade, language, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertSectionStmt = db.prepare('INSERT INTO sections (id, chapter_id, section_number, title, content) VALUES (?, ?, ?, ?, ?)');

  for (const [gradeName, subjects] of Object.entries(CURRICULUM_DATA)) {
    for (const sub of subjects) {
      for (const topic of sub.topics) {
        const existing = db.prepare('SELECT id FROM chapters WHERE id = ?').get(topic.id);
        if (!existing) {
          const lang = /[\u0900-\u097F]/.test(topic.content) ? 'Hindi' : 'English';
          insertChapterStmt.run(topic.id, `${topic.hindiTitle} (${topic.title})`, sub.name, gradeName, lang, topic.content, new Date().toISOString());
          const parsed = parseChapterSections(topic.content);
          for (const sec of parsed) {
            insertSectionStmt.run(`${topic.id}_s${sec.sectionNumber}`, topic.id, sec.sectionNumber, sec.title, sec.content);
          }
        }
      }
    }
  }

  // Seed Students from class7A_roster.csv
  const studentCount = (db.prepare('SELECT count(*) as count FROM students').get() as { count: number }).count;
  if (studentCount === 0) {
    const rosterPath = path.join(dataDir, 'class7A_roster.csv');
    if (fs.existsSync(rosterPath)) {
      const csvContent = fs.readFileSync(rosterPath, 'utf-8');
      const lines = csvContent.split('\n').filter(l => l.trim().length > 0).slice(1);
      const insertStudent = db.prepare('INSERT INTO students (student_id, name, gender, class, section, preferred_language) VALUES (?, ?, ?, ?, ?, ?)');
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 6) {
          insertStudent.run(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
        }
      }
    }
  }

  // Seed Quiz Results from quiz_results.csv
  const quizCount = (db.prepare('SELECT count(*) as count FROM quiz_results').get() as { count: number }).count;
  if (quizCount === 0) {
    const resultsPath = path.join(dataDir, 'quiz_results.csv');
    if (fs.existsSync(resultsPath)) {
      const csvContent = fs.readFileSync(resultsPath, 'utf-8');
      const lines = csvContent.split('\n').filter(l => l.trim().length > 0).slice(1);
      const insertQuiz = db.prepare('INSERT INTO quiz_results (student_id, topic, questions, correct, date, chapter_id) VALUES (?, ?, ?, ?, ?, ?)');
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 5) {
          insertQuiz.run(parts[0], parts[1], parseInt(parts[2], 10), parseInt(parts[3], 10), parts[4], 'photosynthesis_en');
        }
      }
    }
  }

  // Seed initial doubts for doubt-to-dashboard USP demonstration
  const doubtCount = (db.prepare('SELECT count(*) as count FROM doubts').get() as { count: number }).count;
  if (doubtCount === 0) {
    const insertDoubt = db.prepare(`
      INSERT INTO doubts (id, student_id, student_name, chapter_id, section_ref, question, answer, in_chapter, quote, verified, asked_at, forwarded_to_teacher, teacher_reply)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Stomata doubts (hotspot) - 8 doubts
    for (let i = 1; i <= 8; i++) {
      const sId = i < 10 ? `S00${i}` : `S0${i}`;
      insertDoubt.run(
        `d_stomata_${i}`,
        sId,
        `Student ${sId}`,
        'photosynthesis_en',
        'Section 2: What a plant needs for photosynthesis',
        'Stomata kaise kaam karta hai?',
        'रंध्र (Stomata) पत्तियों के सूक्ष्म छिद्र होते हैं। पौधे इन्हीं छिद्रों द्वारा वायुमंडल से कार्बन डाइऑक्साइड गैस लेते हैं।',
        1,
        'Carbon dioxide: taken from the air through tiny pores on the leaf called stomata.',
        1,
        new Date(Date.now() - (i * 3600000)).toISOString(),
        0,
        null
      );
    }

    // Saprotrophs doubts (hotspot) - 6 doubts
    for (let i = 9; i <= 14; i++) {
      const sId = i < 10 ? `S00${i}` : `S0${i}`;
      insertDoubt.run(
        `d_sapro_${i}`,
        sId,
        `Student ${sId}`,
        'photosynthesis_en',
        'Section 6: Other ways plants get food',
        'मृतजीवी पौधे क्या सड़ी हुई चीजों से खाना लेते हैं?',
        'हाँ, कवक (Fungi) जैसे मशरूम मृत और सड़ी-गली चीज़ों से पोषण लेते हैं, इसलिए इन्हें मृतजीवी (saprotrophs) कहते हैं।',
        1,
        'Fungi such as mushrooms are saprotrophs: they take food from dead and decaying matter.',
        1,
        new Date(Date.now() - (i * 2400000)).toISOString(),
        0,
        null
      );
    }

    // An off-chapter question forwarded to teacher
    insertDoubt.run(
      'd_cricket_1',
      'S007',
      'Khushi Mandal',
      'photosynthesis_en',
      null,
      'Who won the cricket match yesterday?',
      'यह सवाल आपके इस पाठ में नहीं है। कृपया अपनी कक्षा अध्यापिका / शिक्षक से पूछें। (This question is not covered in this chapter. Please ask your teacher.)',
      0,
      null,
      0,
      new Date(Date.now() - 1800000).toISOString(),
      1,
      null
    );
  }

  // Seed sample pre-generated lesson plan from lesson_plan_format.json
  const genCount = (db.prepare('SELECT count(*) as count FROM generated_content').get() as { count: number }).count;
  if (genCount === 0) {
    const lessonPlanFormatPath = path.join(dataDir, 'lesson_plan_format.json');
    if (fs.existsSync(lessonPlanFormatPath)) {
      const raw = fs.readFileSync(lessonPlanFormatPath, 'utf-8');
      db.prepare('INSERT INTO generated_content (id, type, chapter_id, title, content_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run('sample_lesson_plan_1', 'lesson_plan', 'photosynthesis_en', 'Class 7 Science: Photosynthesis (40 Min Plan)', raw, new Date().toISOString());
    }
  }

  // Seed notifications
  const notifCount = (db.prepare('SELECT count(*) as count FROM notifications').get() as { count: number }).count;
  if (notifCount === 0) {
    const insertNotif = db.prepare('INSERT INTO notifications (id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertNotif.run('n1', 'Doubt Hotspot Alert', '8 students asked doubts on "Stomata" in Class 7A today.', 'alert', 0, new Date().toISOString());
    insertNotif.run('n2', 'Saprotrophs Mastery Alert', 'Weakest topic identified: Saprotrophs (52% mean). 4 students need immediate remedial practice.', 'warning', 0, new Date().toISOString());
    insertNotif.run('n3', 'Question for You', 'Rohit Paswan submitted an off-chapter doubt: "Who won the cricket match yesterday?".', 'info', 0, new Date().toISOString());
  }
}

// Auto-initialize on module load
initDatabase();
