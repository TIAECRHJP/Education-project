export type Role = 'landing' | 'student' | 'teacher' | 'admin' | 'learning';
export type UILanguage = 'en' | 'hi';

export interface Chapter { id: string; title: string; subject: string; grade: string; language: string; created_at?: string; content?: string; sections?: any[]; }
export interface AppNotification { id: string; title: string; message: string; type: string; read: number; created_at: string; }
export interface GroundedDoubtResponse { answer?: string; in_chapter: boolean; section?: string; quote?: string; ghar_ki_boli?: string; bilingual_en?: string; doubtId?: string; [key: string]: any; }
export interface LessonPlanOutput {
  class: string; subject: string; chapter: string; period_length_minutes: number; language: string;
  objectives: string[]; materials_needed: string[]; board_diagram_description: string;
  timed_flow: { duration_minutes: number; step: string; section_ref: string; teacher_activity: string; student_activity?: string }[];
  quiz_questions: { q: string; options: string[]; answer: string; section: string; evidence?: string }[];
}
export interface DoubtItem { id: string; student_id: string; student_name: string; chapter_id: string; section_ref?: string; question: string; answer: string; in_chapter: number; quote?: string; verified: number; asked_at: string; forwarded_to_teacher?: number; teacher_reply?: string; }
export interface ParentReport { student_id: string; name: string; overallAvg: number; saproScore: number; approved: boolean; whatsappText: string; whatsappUrl: string; }
export interface DashboardStats { studentsWhoNeedHelp: any[]; weakestTopic: any; topicStats: any[]; remedialGroups: { needsHelp: { students: any[]; [key: string]: any }; onTrack: { students: any[]; [key: string]: any }; readyToStretch: { students: any[]; [key: string]: any }; [key: string]: any }; [key: string]: any; }
