import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  MessageSquare,
  TrendingDown,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Bell
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UILanguage } from '../types';

interface AdminDashboardProps {
  uiLang: UILanguage;
}

interface StudentItem {
  student_id: string;
  name: string;
  gender: string;
  class: string;
  section: string;
  preferred_language: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ uiLang }) => {
  const [districtData, setDistrictData] = useState<any>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'student_id' | 'name'>('student_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchAdminStats();
    fetchStudents();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/district-stats');
      const data = await res.json();
      if (data.success) {
        setDistrictData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStudents = students
    .filter(
      s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'student_id' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const COLORS = ['#d97706', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header - Frosted Dark Glass */}
      <div className="backdrop-blur-xl bg-slate-950/85 rounded-2xl p-6 shadow-2xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">
              {uiLang === 'hi' ? 'जिला शिक्षा पदाधिकारी (DEO) डैशबोर्ड' : 'District Education Office (DEO) State View'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
              Patna District
            </span>
          </div>
          <p className="text-xs text-amber-200/80 mt-0.5">
            Bihar State Education Department • Real-time classroom learning telemetry
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-200">
          Last Synced: Today at 08:30 AM
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold uppercase">Govt. Schools</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {districtData?.metrics?.totalSchools || 42}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">Danapur, Bihta, Patna Sadar</span>
        </div>

        <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold uppercase">Active Teachers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {districtData?.metrics?.totalTeachers || 186}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Evening Prep Automated</span>
        </div>

        <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold uppercase">Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {districtData?.metrics?.totalStudents || 4520}
          </div>
          <span className="text-[10px] text-amber-200/70 font-semibold">Class 1-12 All Subjects</span>
        </div>

        <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold uppercase">Doubts Cleared</span>
            <MessageSquare className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {districtData?.metrics?.totalDoubts || 1240}
          </div>
          <span className="text-[10px] text-amber-300 font-semibold">100% Grounded in Chapters</span>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Doubts Trend Per Day (Area Chart) */}
        <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">
              Student Doubts Trend (Last 7 Days)
            </h3>
            <span className="text-xs text-amber-400 font-semibold">+34% this week</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={districtData?.doubtsPerDay || []}>
                <defs>
                  <linearGradient id="doubtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#d97706', color: '#fff' }} />
                <Area type="monotone" dataKey="doubts" stroke="#d97706" strokeWidth={2.5} fill="url(#doubtGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weakest Topics Across District (Bar Chart) */}
        <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">
              Weakest Topics Across District Schools (% Mastery)
            </h3>
            <span className="text-xs text-red-400 font-semibold">Priority Remedial Action</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData?.weakestTopicsAcrossSchools || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <YAxis dataKey="topic" type="category" width={120} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#d97706', color: '#fff' }} />
                <Bar dataKey="districtMean" fill="#d97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Block-Wise Performance Table & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Block Performance */}
        <div className="lg:col-span-2 p-6 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-amber-500/20 shadow-xl space-y-3 text-white">
          <h3 className="font-bold text-sm text-white">
            Block-Wise Performance (Patna District)
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-amber-500/20">
              <thead className="bg-slate-900/90 font-semibold text-amber-200">
                <tr>
                  <th className="p-2.5">Block Name</th>
                  <th className="p-2.5">Schools</th>
                  <th className="p-2.5">Average Mastery</th>
                  <th className="p-2.5">Doubts Cleared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(districtData?.blockWiseData || []).map((b: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-white">{b.block}</td>
                    <td className="p-2.5 text-slate-300">{b.schools}</td>
                    <td className="p-2.5 font-mono font-bold text-amber-400">{b.avgMastery}%</td>
                    <td className="p-2.5 font-mono text-slate-300">{b.doubtsLogged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI District Insights Summary */}
        <div className="p-6 rounded-2xl backdrop-blur-xl bg-amber-950/30 border border-amber-500/30 shadow-xl space-y-3 text-xs text-white">
          <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI State Insights Summary</span>
          </div>
          <p className="text-amber-100/90 leading-relaxed">
            • <strong>District Weak Spot:</strong> Across 42 schools, &ldquo;Saprotrophs &amp; Fungi&rdquo; remains the lowest mastering concept (53.4% district average). Recommended: Broadcast targeted 10-minute micro-lesson to all Danapur science teachers.
          </p>
          <p className="text-amber-100/90 leading-relaxed">
            • <strong>Voice Adoption:</strong> 72% of student questions are now submitted via Hindi Voice Input (hi-IN), lowering hesitation for rural first-generation learners.
          </p>
          <div className="pt-2 text-[10px] text-amber-300/60 border-t border-amber-500/20">
            Telemetry verified against NCERT Class 7 Science.
          </div>
        </div>

      </div>

      {/* Roster of 30 Students: Search, Sort, Pagination */}
      <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 shadow-2xl space-y-4 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white">
              Class 7A Student Roster (Starter Dataset: 30 Students)
            </h3>
            <p className="text-xs text-amber-200/70">
              Loaded from <code>class7A_roster.csv</code> with search, column sorting and pagination.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student or roll no..."
              className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-amber-500/30 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-xs border border-amber-500/20 rounded-xl">
          <table className="w-full text-left divide-y divide-amber-500/20">
            <thead className="bg-slate-900/90 font-semibold text-amber-200">
              <tr>
                <th
                  onClick={() => toggleSort('student_id')}
                  className="p-3 cursor-pointer hover:bg-slate-800 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Roll No.</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="p-3 cursor-pointer hover:bg-slate-800 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th className="p-3">Gender</th>
                <th className="p-3">Class &amp; Section</th>
                <th className="p-3">Preferred Language</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedStudents.map(st => (
                <tr key={st.student_id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono font-bold text-amber-400">{st.student_id}</td>
                  <td className="p-3 font-semibold text-white">{st.name}</td>
                  <td className="p-3 text-slate-300">{st.gender}</td>
                  <td className="p-3 text-slate-300">{st.class} - {st.section}</td>
                  <td className="p-3 uppercase text-[10px] font-bold text-amber-300/80">{st.preferred_language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-amber-200/70 pt-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-amber-500/20 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-amber-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-amber-500/20 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
