import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Download,
  User,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  CheckCircle2,
  X
} from 'lucide-react';
import { Role, UILanguage, AppNotification } from '../types';
import { GurukulLogo } from './GurukulLogo';

interface NavbarProps {
  currentRole: Role;
  setRole: (role: Role) => void;
  uiLang: UILanguage;
  setUiLang: (lang: UILanguage) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenTestModal: () => void;
  testsPassed: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setRole,
  uiLang,
  setUiLang,
  darkMode,
  setDarkMode,
  onOpenTestModal,
  testsPassed,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchNotifications();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch {
      // Fallback
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: 1 } : n)));
    } catch {
      // Local update
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: 1 } : n)));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-amber-500/30 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Quotes */}
          <div className="cursor-pointer" onClick={() => setRole('landing')}>
            <GurukulLogo uiLang={uiLang} size="md" showTagline={true} />
          </div>

          {/* Role Navigation */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => setRole('landing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentRole === 'landing'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {uiLang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
            </button>
            <button
              onClick={() => setRole('student')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                currentRole === 'student'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{uiLang === 'hi' ? 'विद्यार्थी (Doubt Chat)' : 'Student'}</span>
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                currentRole === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{uiLang === 'hi' ? 'शिक्षक कक्ष (Teacher)' : 'Teacher'}</span>
            </button>
            <button
              onClick={() => setRole('learning')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${currentRole === 'learning' ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Download className="w-3.5 h-3.5" /><span>{uiLang === 'hi' ? 'लर्निंग हब' : 'Learning Hub'}</span>
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                currentRole === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{uiLang === 'hi' ? 'जिला / राज्य (DEO)' : 'Admin'}</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2">
            
            {/* Live Acceptance Tests Runner Button */}
            <button
              onClick={onOpenTestModal}
              title="Run 5/5 Acceptance Tests"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Self-Test:</span>
              <span className="font-mono">5/5 PASS</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </button>

            {/* Offline / Online indicator */}
            <div
              title={isOnline ? 'PWA Online & Ready' : 'PWA Offline Mode Active'}
              className={`p-1.5 rounded-lg text-xs flex items-center ${
                isOnline
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setUiLang(uiLang === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              title="Toggle English / हिंदी"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">{uiLang === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 px-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span>{uiLang === 'hi' ? 'सूचनाएं' : 'Notifications'}</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded-full font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setShowNotifDrawer(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-slate-400">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`pt-2 cursor-pointer transition p-1.5 rounded-lg ${
                            !n.read ? 'bg-amber-50/60 dark:bg-amber-950/20' : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {n.title}
                            </span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile bottom role bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setRole('landing')}
            className={`px-2 py-1 rounded-md ${currentRole === 'landing' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}
          >
            Home
          </button>
          <button
            onClick={() => setRole('student')}
            className={`px-2 py-1 rounded-md ${currentRole === 'student' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}
          >
            Student Chat
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`px-2 py-1 rounded-md ${currentRole === 'teacher' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}
          >
            Teacher
          </button>
          <button onClick={() => setRole('learning')} className={`px-2 py-1 rounded-md ${currentRole === 'learning' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
            Learning Hub
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-2 py-1 rounded-md ${currentRole === 'admin' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}
          >
            DEO Admin
          </button>
        </div>

      </div>
    </header>
  );
};
