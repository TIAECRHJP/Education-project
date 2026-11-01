import React, { useEffect, useState } from 'react';
import { BookOpen, Download, WifiOff, ClipboardList, CheckCircle2, GraduationCap, ShieldCheck, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Chapter } from '../types';

type Assignment = { id: string; title: string; className: string; chapter: string; due: string; done: string[] };
const STORE = 'gurukul_assignments_v1';
const resources = [
  { title: 'National Scholarship Portal', detail: 'Official scholarship applications and status. Confirm current eligibility and deadlines on the portal.', href: 'https://scholarships.gov.in/' },
  { title: 'DIKSHA learning resources', detail: 'Official digital lessons and teacher resources from the Ministry of Education.', href: 'https://diksha.gov.in/' },
  { title: 'National Career Service', detail: 'Government career information, counselling and job services.', href: 'https://www.ncs.gov.in/' },
  { title: 'SWAYAM courses', detail: 'Free online courses from Indian institutions; check course dates and eligibility.', href: 'https://swayam.gov.in/' },
];

export const LearningHub: React.FC<{ chapters: Chapter[]; uiLang: 'en' | 'hi'; onOpenChapter: (id: string) => void }> = ({ chapters, uiLang, onOpenChapter }) => {
  const hi = uiLang === 'hi';
  const [assignments, setAssignments] = useState<Assignment[]>(() => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } });
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 7');
  const [due, setDue] = useState('');
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { if ('caches' in window) caches.open('gurukul-chapters-v1').then(async c => { const keys = await c.keys(); setDownloaded(keys.map(k => decodeURIComponent(new URL(k.url).pathname.split('/').pop() || ''))); }).catch(() => {}); }, []);

  const saveOffline = async (chapter: Chapter) => {
    try {
      const cache = await caches.open('gurukul-chapters-v1');
      const response = await fetch(`/api/chapters/${encodeURIComponent(chapter.id)}`);
      if (!response.ok) throw new Error('Download failed');
      await cache.put(`/api/chapters/${encodeURIComponent(chapter.id)}`, response.clone());
      setDownloaded(prev => [...new Set([...prev, chapter.id])]);
      setMessage(`${chapter.title} ${hi ? 'ऑफ़लाइन उपलब्ध है' : 'is ready offline'}`);
    } catch { setMessage(hi ? 'डाउनलोड के लिए इंटरनेट कनेक्शन चाहिए।' : 'Connect to the internet to download this lesson.'); }
  };
  const createAssignment = () => {
    if (!title.trim()) return;
    setAssignments(prev => [{ id: crypto.randomUUID(), title: title.trim(), className, chapter: chapters[0]?.id || '', due, done: [] }, ...prev]);
    setTitle(''); setDue('');
  };

  return <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-white">
    <header className="rounded-3xl border border-amber-300/30 bg-slate-950/70 backdrop-blur-xl p-7 md:p-10 shadow-2xl">
      <p className="text-amber-300 text-sm font-bold uppercase tracking-widest">{hi ? 'गुरुकुल लर्निंग हब' : 'Gurukul Learning Hub'}</p>
      <h1 className="text-3xl md:text-5xl font-black mt-3">{hi ? 'सीखें, ऑफ़लाइन पढ़ें, आगे बढ़ें' : 'Learn anywhere. Keep moving forward.'}</h1>
      <p className="mt-3 max-w-2xl text-slate-200">{hi ? 'पाठ डाउनलोड करें, कक्षा के काम साझा करें और भारत के आधिकारिक शिक्षा संसाधन खोजें।' : 'Download lessons for low-connectivity days, organize class work, and find trusted Indian education resources.'}</p>
      <div className="flex flex-wrap gap-3 mt-6"><span className="rounded-full bg-emerald-500/15 border border-emerald-300/30 px-3 py-1.5 text-sm"><WifiOff className="inline w-4 h-4 mr-1"/> {hi ? 'ऑफ़लाइन पाठ' : 'Offline lessons'}</span><span className="rounded-full bg-sky-500/15 border border-sky-300/30 px-3 py-1.5 text-sm"><ClipboardList className="inline w-4 h-4 mr-1"/> {hi ? 'कक्षा कार्य' : 'Class assignments'}</span></div>
    </header>

    <section className="rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-xl p-6">
      <h2 className="text-2xl font-extrabold flex items-center gap-2"><Download className="text-amber-300"/> {hi ? 'कम इंटरनेट में पढ़ाई' : 'Study with limited internet'}</h2>
      <p className="text-slate-300 text-sm mt-1">{hi ? 'कनेक्शन रहते हुए अध्याय डाउनलोड करें; फिर बिना नेटवर्क के भी पढ़ सकेंगे।' : 'Save chapters while connected. Saved chapters remain available on this device when the network drops.'}</p>
      {message && <p role="status" className="mt-3 text-emerald-300 text-sm">{message}</p>}
      <div className="grid md:grid-cols-2 gap-3 mt-5">{chapters.map(ch => <article key={ch.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="min-w-0"><p className="font-bold truncate">{ch.title}</p><p className="text-xs text-slate-400">{ch.grade} · {ch.subject} · {ch.language}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => onOpenChapter(ch.id)} className="rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-200"><BookOpen className="inline w-4 h-4 mr-1"/>{hi ? 'पढ़ें' : 'Open'}</button><button onClick={() => saveOffline(ch)} aria-label={`Download ${ch.title} for offline use`} className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">{downloaded.includes(ch.id) ? <CheckCircle2 className="w-4 h-4"/> : <Download className="w-4 h-4"/>}</button></div></article>)}</div>
    </section>

    <section className="rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-xl p-6">
      <h2 className="text-2xl font-extrabold flex items-center gap-2"><ClipboardList className="text-amber-300"/> {hi ? 'शिक्षक: कक्षा कार्य' : 'Teacher: class assignments'}</h2>
      <p className="text-slate-300 text-sm mt-1">{hi ? 'इस डिवाइस पर काम बनाएं और विद्यार्थियों की प्रगति दर्ज करें।' : 'Create class tasks and record completion on this device.'}</p>
      <div className="grid sm:grid-cols-[1fr_140px_170px_auto] gap-2 mt-5"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder={hi ? 'कार्य का नाम' : 'Assignment title'} className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder:text-slate-400"/><select value={className} onChange={e=>setClassName(e.target.value)} className="rounded-xl bg-slate-900 border border-white/15 px-3 py-2"><option>Class 6</option><option>Class 7</option><option>Class 8</option></select><input type="date" value={due} onChange={e=>setDue(e.target.value)} className="rounded-xl bg-slate-900 border border-white/15 px-3 py-2 text-white"/><button onClick={createAssignment} className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950"><Plus className="inline w-4 h-4 mr-1"/>{hi ? 'बनाएं' : 'Create'}</button></div>
      <div className="space-y-2 mt-4">{assignments.map(a=><article key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">{a.title}</p><p className="text-xs text-slate-400">{a.className}{a.due ? ` · Due ${a.due}` : ''} · {a.done.length} completed</p></div><div className="flex gap-2"><button onClick={()=>onOpenChapter(a.chapter)} className="rounded-lg bg-sky-500/15 px-3 py-2 text-sm">{hi?'संबंधित पाठ':'Open lesson'}</button><button onClick={()=>setAssignments(prev=>prev.map(x=>x.id===a.id?{...x,done:[...x.done,'Student']}:x))} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm">{hi?'पूर्ण दर्ज करें':'Mark complete'}</button><button onClick={()=>setAssignments(prev=>prev.filter(x=>x.id!==a.id))} aria-label="Delete assignment" className="rounded-lg p-2 text-rose-300"><Trash2 className="w-4 h-4"/></button></div></article>)}</div>
    </section>

    <section className="rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-xl p-6">
      <h2 className="text-2xl font-extrabold flex items-center gap-2"><GraduationCap className="text-amber-300"/> {hi ? 'भारत के शिक्षा और करियर संसाधन' : 'Education and career resources for India'}</h2>
      <p className="text-slate-300 text-sm mt-1">{hi ? 'आधिकारिक साइटों के लिंक। आवेदन से पहले पात्रता और अंतिम तिथि जांचें।' : 'Links to official services. Always verify current eligibility and deadlines on the source site.'}</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-5">{resources.map(r=><a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"><div className="flex justify-between gap-2"><p className="font-bold">{r.title}</p><ExternalLink className="w-4 h-4 text-amber-300 shrink-0"/></div><p className="text-sm text-slate-300 mt-1">{r.detail}</p></a>)}</div>
      <p className="mt-4 text-xs text-slate-400"><ShieldCheck className="inline w-3.5 h-3.5 mr-1"/>{hi ? 'ये बाहरी सरकारी संसाधन हैं; साइट पर आवेदन या पात्रता सत्यापन नहीं होता।' : 'These are external government services; this site does not submit applications or verify eligibility.'}</p>
    </section>
  </div>;
};
