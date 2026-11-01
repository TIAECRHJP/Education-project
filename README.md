# Gurukul AI (गुरुकुल AI)
> *"Every child's doubt answered, every teacher's evening saved."*
> **Build#thon 2026 — Idea A: Grounded AI Assistant for Bihar Government Schools**

---

## 1. Problem Statement Mapping
In over 70,000 government schools across Bihar, two systemic challenges persist:
1. **The Student Doubt Dilemma:** In multi-grade rural classrooms (pupil-teacher ratios often exceeding 40:1), first-generation learners frequently hesitate to ask doubts due to social shyness or language barriers. When studying at home by lantern or dim bulb, they have no one to ask.
2. **The Teacher's Evening Dilemma:** Dedicated government school teachers spend hours every evening manually writing lesson plans, drafting blackboard diagrams, formulating quizzes, and hand-marking papers—leaving little time for targeted student mentoring.
3. **The LLM Hallucination Threat:** General-purpose AI models hallucinate facts or pull high-school/college level content far beyond the prescribed state textbook curriculum.

**Gurukul AI solves this by building an AI assistant strictly grounded in the school's own textbook chapter text.**
- **Zero Hallucinations:** Every student answer is verified server-side against the chapter section. If a quote is not a verbatim substring, the answer is flagged or rejected.
- **Off-Chapter Guardrails:** Questions outside the textbook (e.g., *"Who won the cricket match?"*) receive a polite refusal in Hindi and English with a 1-click option to forward to the teacher's inbox.
- **Teacher Evening Saver:** Instant 30/40/45-minute lesson plans whose timed steps add up *exactly* to the period length, alongside 5 server-verified multiple-choice questions with full answer keys.
- **Code-Computed Telemetry:** Class mastery, weakest topic identification (Saprotrophs at 52%), and remedial groups are computed in deterministic TypeScript code—never hallucinated by an LLM.

---

## 2. Complete Feature Overview

### Teacher Generator & Lesson Planner
- **Class & Subject Selection:** Class 6, 7, 8 in Science and EVS.
- **Exact Timed Period Flow:** Configurable for 30, 40, or 45-minute periods. Timed step durations add up *strictly and exactly* to the period length.
- **Classroom Realia & Board Diagram:** Tailored for rural government schools (chalkboards, fresh leaf specimens, hand lenses, low-cost local aids).
- **5-Question Rapid Mastery Quiz:** Each MCQ has 4 options, 1 identical answer, textbook section citation, and verbatim sentence evidence. Server validates both `answer-in-options` and `evidence-in-section`.
- **Export & Share:** 1-click formatted text copy, clean printable view (with `@media print` CSS), and direct WhatsApp share.
- **Upload-Your-Own-Chapter:** Paste any custom text or photograph a textbook page to be processed by Gemini 3.8 Flash Vision OCR.

### Student Doubt Chat (Mobile-First for Cheap Android Phones)
- **Speech-to-Text Input:** Web Speech API integration configured for `hi-IN` (Hindi & Hinglish voice input).
- **Text-to-Speech (TTS):** Read-aloud button for auditory learners.
- **Strictly Grounded Answers:** Exactly 2 simple sentences in the student's language, accompanied by the source section number and verbatim quoted sentence.
- **"Ghar Ki Boli" Beta Mode:** Toggle for conversational, homely village-style Hindi for rural first-generation learners.
- **Bilingual Output Toggle:** Side-by-side Hindi + English view for English medium aspirants.
- **Refusal & Forwarding:** Polite Hindi/English refusal for off-chapter questions with 1-click forwarding to the teacher's "Questions for You" inbox.

### Teacher Dashboard & Mastery Telemetry
- **Code-Computed Topic Mastery:** 8 topics from NCERT Class 7 Science Chapter 1 parsed from `quiz_results.csv` (240 rows).
- **Weakest Topic Highlight:** **Saprotrophs** at 52.00% class mean with 4 students below 40% (S03, S09, S15, S25).
- **AI Suggestion Card:** 10-minute targeted revision plan with 3 oral check questions grounded in Section 6 (Saprotrophs and Fungi).
- **Students Who Need Help:** Automatically filters students with overall average < 50% or score < 40% on the weakest topic.
- **Remedial Tier Splitting:** Class is auto-split into *Needs Help*, *On Track*, and *Ready to Stretch* with a distinct 10-minute activity for each tier.
- **USP: Doubt-to-Dashboard Loop:** Student doubts logged in real time show classroom hotspots (e.g., *"8 doubts on Stomata today"*) with instant micro-lesson triggers.
- **Paper-to-Data Scanner:** Photograph marked handwritten answer sheets; Gemini Vision extracts student roll number and marked options into an interactive confirmation table before database commit.
- **Parent WhatsApp Reports:** Simple Devanagari Hindi progress cards respecting student `preferred_language` with 1-click WhatsApp dispatch links and teacher approval toggles.
- **Teacher Inbox:** Manage student doubts forwarded from chat.

### Admin District View (DEO Analytics)
- Recharts visualizations: Doubts per day trend (Area chart) and weakest topics across schools (Bar chart).
- Block-wise performance table across Patna district (Danapur, Phulwari Sharif, Patna Sadar, Bihta).
- Paginated, searchable, and sortable roster of 30 students.
- In-app notification bell with real-time educational alerts.

---

## 3. Architecture & Data Model

```
                    ┌────────────────────────────┐
                    │  React 19 + Tailwind CSS   │
                    │  (PWA / Offline Capable)   │
                    └──────────────┬─────────────┘
                                   │ HTTP API
                    ┌──────────────▼─────────────┐
                    │   Express Server on TSX    │
                    │ (Server-Side Architecture) │
                    └───────┬──────────────┬─────┘
                            │              │
           ┌────────────────▼───┐     ┌────▼─────────────────┐
           │   @google/genai    │     │ SQLite DatabaseSync  │
           │ (gemini-3.8-flash) │     │ (database.sqlite)    │
           └────────────────────┘     └──────────────────────┘
```

### Database Tables (SQLite `node:sqlite`)
1. `users`: Teacher and Admin profiles.
2. `chapters`: Uploaded or seeded textbook chapters.
3. `sections`: Regex-parsed numbered sections (`Section X:` or `अनुभाग X:`).
4. `students`: 30 students from `class7A_roster.csv`.
5. `quiz_results`: 240 quiz rows across 8 topics (5 questions each).
6. `doubts`: Logged student doubts with section citations, verification status, and teacher replies.
7. `generated_content`: Saved lesson plans and quizzes.
8. `notifications`: In-app teacher and admin alerts.

---

## 4. Acceptance Test Results (All 5/5 PASSED)

| Test ID | Test Scenario | Requirement | Status | Verification Detail |
|---|---|---|---|---|
| **Test 1** | Doubt Q&A: *"stomata kya hota hai?"* | Returns correct Hinglish/Hindi answer naming Section 2 or 4 with verified verbatim quote | **PASSED** | `section: "Section 4: Stomata and Gas Exchange in Leaves"`, `verified: true`, `quote: "Carbon dioxide enters the leaf through microscopic openings called stomata."` |
| **Test 2** | Refusal: *"Who won the cricket match?"* | Politely refused in Hindi and English with option to forward to teacher | **PASSED** | `in_chapter: false`, `verified: false`, polite bilingual refusal message returned. |
| **Test 3** | Hindi Quiz Generation | 5 MCQs with server validation of answer-in-options and evidence-in-section | **PASSED** | 5 questions generated; 5/5 verified; all answer keys match options and section evidence. |
| **Test 4** | Dashboard Starter Data Self-Test | Weakest topic = Saprotrophs (~52% class mean), exactly 4 students below 40% | **PASSED** | `weakest_topic: "saprotrophs"`, `mean: 52.00%`, `below40_count: 4` (S03, S09, S15, S25). |
| **Test 5** | Multi-Chapter Dynamic Switch | Switch to Water Cycle chapter dynamically without code changes | **PASSED** | `water_cycle_en` loaded (5 sections), `evaporation` doubt verified against Section 2. |

*You can verify this in real-time by clicking the **"5/5 PASS"** badge in the top navbar or running `curl http://localhost:3001/api/run-acceptance-tests`.*

---

## 5. API Documentation

### Chapters
- `GET /api/chapters`: List all textbook chapters.
- `GET /api/chapters/:id`: Get single chapter with all numbered sections.
- `POST /api/chapters/upload`: Upload new chapter via raw text or base64 image (Gemini Vision OCR).

### Student Doubt Q&A
- `POST /api/doubt/ask`: Ask a doubt. Body: `{ question, chapterId, studentId, studentName, preferredLanguage }`.
- `POST /api/doubt/forward-to-teacher`: Forward ungrounded or off-chapter doubt to teacher inbox.
- `GET /api/doubt/inbox`: Teacher inbox of student doubts.
- `POST /api/doubt/reply`: Teacher reply to student doubt.

### Lesson Plan & Quiz Generation
- `POST /api/lesson-plan/generate`: Generate timed lesson plan and 5 verified MCQs. Body: `{ chapterId, className, subject, periodLength: 30|40|45, language: 'Hindi'|'English' }`.

### Teacher Dashboard & Telemetry
- `GET /api/dashboard/stats`: Returns code-computed mastery stats, weakest topic, students who need help, remedial groups, and doubt hotspots.
- `POST /api/dashboard/revision-plan`: 10-minute grounded revision plan with 3 oral check questions.
- `POST /api/dashboard/paper-to-data`: Gemini Vision OCR on student marked answer sheets.
- `POST /api/dashboard/commit-quiz-result`: Commits paper OCR score to database.
- `GET /api/parent-reports`: Simple Hindi WhatsApp report cards with teacher approval toggles.

### Test Runner
- `GET /api/run-acceptance-tests`: Runs the 5 formal acceptance tests and returns pass/fail metrics.

---

## 6. 3-Minute Demo Script for Judges

- **0:00 – 0:30 | The Hook & Problem Statement:**
  *"Good morning judges. In Bihar's government schools, 40+ children sit in one classroom. Shyness prevents students from asking doubts, while teachers spend their entire evenings hand-writing lesson plans. We built Gurukul AI—where every child's doubt is answered, and every teacher's evening is saved."*

- **0:30 – 1:15 | Student Voice Doubt & Strict Citation:**
  - Switch to the **Student Portal**.
  - Click the **Mic** button and speak or select the chip: *"stomata kya hota hai?"*.
  - Show the 2-sentence simple Hindi answer, the verified badge, Section 4 reference, and the verbatim textbook sentence quote.
  - Toggle **"घर की बोली (Beta)"** to show how village-level rural learners understand the concept in homely dialect.
  - Now type an off-chapter question: *"Who won the cricket match yesterday?"*.
  - Show the polite refusal and click **"Send to Teacher's Questions For You Inbox"**.

- **1:15 – 2:10 | Teacher Lesson Plan & Verified 5-MCQ Quiz:**
  - Switch to **Teacher Portal > Generator**.
  - Select **40-minute period**, language **Hindi**.
  - Click **Generate Lesson Plan & 5-MCQ Quiz**.
  - Point out that the timed step durations add up *strictly to 40 minutes*.
  - Show the 5 MCQs: each has an answer key verified against section evidence.
  - Demonstrate 1-click **Copy**, **Print**, and **WhatsApp Share**.

- **2:10 – 2:45 | Code-Computed Telemetry & Doubt-to-Dashboard Loop:**
  - Switch to **Teacher Dashboard**.
  - Show the 8 topic mastery bars: **Saprotrophs** is highlighted as the weakest topic at **52.00%** with **4 students below 40%** (satisfying the starter data test).
  - Open the **Remedial Groups** tab to show the class auto-split into 3 tiers with 10-minute micro-activities.
  - Open **Parent Reports** and click **Approve** on Rohit Paswan's report to generate a simple Hindi WhatsApp progress message.
  - Show the **"Doubt Hotspots Today"** card: 8 doubts asked on stomata today, linking student struggles directly to teacher planning.

- **2:45 – 3:00 | Proof of Quality:**
  - Click the **"5/5 PASS"** badge in the navbar to display the live acceptance test suite.
  - Point out all 5 tests passing live on the system.

---

## 7. 5 Likely Judge Questions & Answers

1. **Q: How do you guarantee the model won't hallucinate non-existent science facts?**
   **A:** *Gurukul AI does not use open-ended prompting or vector databases with loose similarity thresholds. The entire chapter text is provided to Gemini with strict JSON schemas. On the backend, we run programmatic string normalization and verify that the cited quote is a verbatim substring of that exact textbook section. If the quote is missing or modified, the answer is rejected.*

2. **Q: How does this work for students in rural Bihar who have no laptops or high-speed Wi-Fi?**
   **A:** *Gurukul AI is designed mobile-first as an offline-capable Progressive Web App (PWA). It has large touch targets, supports Hindi voice input via the browser's built-in Web Speech API (`hi-IN`), and caches the latest lesson plans and quizzes for offline study in low-connectivity areas.*

3. **Q: Why are your mastery stats computed in code rather than by the LLM?**
   **A:** *LLMs are probabilistic and prone to arithmetic drift. For high-stakes educational assessments and district reporting, math must be deterministic. The 240 quiz records from `quiz_results.csv` are aggregated directly in TypeScript via SQLite queries, ensuring that the 52.00% class mean and the 4 students below 40% are mathematically exact.*

4. **Q: What happens if a teacher wants to teach a new chapter not currently in the app?**
   **A:** *The app is completely dynamic. Through the "+ Upload Your Own Chapter" modal, a teacher can paste text or snap a photo of a textbook page. Gemini 3.8 Flash Vision parses the image into numbered sections, making the new chapter immediately available for lesson plans, quizzes, and doubt clearing.*

5. **Q: How do you protect student privacy?**
   **A:** *We follow privacy-by-design. Students log in with a simple Roll Number and Class Code without passwords. No personally identifiable phone numbers or biometric data are collected. Furthermore, parent WhatsApp reports require explicit teacher approval before being dispatched.*

---

## 8. Known Limitations & Future Scope

- **Current Limitations:**
  - Voice speech synthesis depends on browser-supported TTS voices; low-end browsers may use fallback voices.
  - Image OCR requires reasonable lighting and legible print for optimal extraction.
- **Future Scope:**
  - Native integration with Bihar's *e-LOTS* (electronic Library of Teachers and Students) portal.
  - Regional language expansion into Maithili, Bhojpuri, and Magahi voice models.
  - Bluetooth peer-to-peer quiz synchronization between teacher phones and student devices without active internet.
#   E d u c a t i o n - p r o j e c t  
 