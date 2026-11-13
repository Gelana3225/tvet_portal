import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CollegeLogo from '../../components/CollegeLogo';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data.stats);
      setRecentApplications(data.recent_applications || []);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      draft: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Draft' },
      submitted: { bg: 'bg-[#0075ff]/15 text-[#0075ff] border-[#0075ff]/30', text: 'text-[#0075ff]', dot: 'bg-[#0075ff] animate-ping', label: 'Submitted' },
      under_review: { bg: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30', text: 'text-amber-500', dot: 'bg-amber-400', label: 'In Review' },
      correction_required: { bg: 'bg-orange-500/15 text-orange-500 dark:text-orange-400 border-orange-500/30', text: 'text-orange-500', dot: 'bg-orange-400', label: 'Action Needed' },
      approved: { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', text: 'text-emerald-500', dot: 'bg-emerald-400', label: 'Approved' },
      rejected: { bg: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30', text: 'text-rose-500', dot: 'bg-rose-400', label: 'Rejected' },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`}></span>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-28 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center animate-spin">
          <div className="w-6 h-6 border-2 border-[#0075ff] border-t-transparent rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-white">Loading Command Center...</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Retrieving live admission pipelines and statistics</p>
        </div>
      </div>
    );
  }

  // Real Calculated Metrics
  const total = stats?.total_applications ?? 0;
  const submitted = stats?.submitted ?? 0;
  const underReview = stats?.under_review ?? 0;
  const pending = submitted + underReview;
  const approved = stats?.approved ?? 0;
  const actionNeeded = (stats?.correction_required ?? 0) + (stats?.rejected ?? 0);
  const totalCapacity = stats?.total_capacity || 500;
  const enrolledStudents = stats?.total_students ?? approved;

  // Real Admission / Acceptance Rate
  const admissionRate = stats?.admission_rate ?? (total > 0 ? Math.round((approved / total) * 100) : 0);

  // Real Capacity Fulfillment
  const fulfillmentPercent = stats?.overall_fulfillment ?? (totalCapacity > 0 ? Number(((approved / totalCapacity) * 100).toFixed(1)) : 0);

  // Semi-circle gauge (Arc radius 65, semi-circumference = 204.2)
  const semiCircumference = 204.2;
  const gaugeOffset = semiCircumference - (semiCircumference * (Math.min(admissionRate, 100) / 100));

  // Circular score ring (Radius 42, circumference = 2 * pi * 42 = 263.9)
  const ringCircumference = 263.9;
  const ringOffset = ringCircumference - (ringCircumference * (Math.min(fulfillmentPercent, 100) / 100));

  const userName = user?.name || user?.email?.split('@')[0] || 'Administrator';
  const activeCycle = stats?.active_period;

  // Real Monthly Trend Array from backend
  const monthlyData: any[] = stats?.monthly_trend || [
    { month: 'Jun', applications: 0, admitted: 0 },
    { month: 'Jul', applications: 0, admitted: 0 },
    { month: 'Aug', applications: 0, admitted: 0 },
    { month: 'Sep', applications: 0, admitted: 0 },
    { month: 'Oct', applications: 0, admitted: 0 },
    { month: 'Nov', applications: total, admitted: approved },
  ];

  // SVG Area Chart points calculation
  const maxAppsInMonth = Math.max(...monthlyData.map((d: any) => d.applications), 3);
  const chartWidth = 560;
  const chartHeight = 150;
  const points = monthlyData.map((d: any, idx: number) => {
    const x = Math.round((idx / Math.max(monthlyData.length - 1, 1)) * chartWidth + 20);
    const y = Math.round(chartHeight - (d.applications / maxAppsInMonth) * (chartHeight - 30) - 15);
    return { x, y, apps: d.applications, admitted: d.admitted, month: d.month };
  });

  const linePath = points.reduce((acc: string, pt: any, idx: number) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${chartHeight + 15} L ${points[0].x},${chartHeight + 15} Z`
    : '';

  // Real Departments Array
  const departments: any[] = stats?.departments || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 p-4 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="font-bold">⚠️ Notice:</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold text-rose-500 hover:text-rose-700">×</button>
        </div>
      )}

      {/* =========================================================================
          ROW 1: TOP 4 STAT KPI METRIC CARDS (REAL DATA & DYNAMIC ACCENTS)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Candidates */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Total Candidates
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {stats?.total_applicants || total} Registered
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {Math.round((total / totalCapacity) * 100)}% of {totalCapacity} Target Seats
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0075ff] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 force-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: In Review */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              In Review
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {pending.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {submitted} New · {underReview} Reviewing
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Awaiting Registrar Verification
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 force-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Action Required */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Action Required
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {actionNeeded.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {stats?.correction_required ?? 0} Fixes · {stats?.rejected ?? 0} Denied
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Requires Candidate / Staff Action
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 force-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Admitted Students */}
        <Link
          to="/admin/students"
          className="vision-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-500/40 transition group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 uppercase transition">
              Admitted Students
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {approved.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <span>View IDs</span>
                <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {enrolledStudents} Official Student IDs Issued
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition force-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
        </Link>
      </div>

      {/* =========================================================================
          ROW 2: MIDDLE 3 CARDS (Institutional Command Center + Gauge + Department Quotas)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1 (5 cols): Hawa Gelan TVET Command Center */}
        <div className="lg:col-span-5 vision-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Subtle Ambient Decorative Ring */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[9.5px] font-extrabold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                  OROMIA REGIONAL STATE · TVET BUREAU
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Admissions Command Center
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                  Welcome back, <strong className="text-slate-900 dark:text-white">{userName}</strong>. Manage candidate submissions, verify credentials, and issue official matriculation credentials.
                </p>
              </div>

              {/* Official College Emblem */}
              <div className="shrink-0 p-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-md">
                <CollegeLogo size={68} />
              </div>
            </div>

            {/* Active Academic Intake Status Box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-[11px]">
                    {activeCycle ? activeCycle.name : 'Academic Year 2026/2027'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Cycle: {activeCycle?.academic_year || '2026/2027'} · Admissions Open
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Live Intake
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/admin/applications"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0075ff] hover:bg-[#0060df] shadow-md shadow-blue-500/30 transition transform hover:-translate-y-0.5 force-white"
            >
              <span>Review Applications ({pending})</span>
              <span className="ml-1.5">→</span>
            </Link>

            <Link
              to="/admin/students"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-300/80 dark:border-white/15 transition"
            >
              <span>Student ID Registry ({approved})</span>
              <span className="ml-1.5">→</span>
            </Link>
          </div>
        </div>

        {/* Card 2 (3.5 cols): Admission Rate Semi-Circular Gauge */}
        <div className="lg:col-span-3 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admission Rate</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                {activeCycle ? activeCycle.academic_year : '2026/2027'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Candidate Acceptance
            </p>
          </div>

          {/* Semi-Circle Radial Progress Gauge */}
          <div className="flex flex-col items-center justify-center my-1 relative">
            <div className="relative w-44 h-24 flex items-end justify-center overflow-visible">
              <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0075ff" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Track Background Arc */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  strokeWidth="11"
                  strokeLinecap="round"
                  className="svg-gauge-track"
                />

                {/* Filled Neon Arc */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="204.2"
                  strokeDashoffset={gaugeOffset}
                  filter="url(#gaugeGlow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Glowing Graduation Cap Icon */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-tr from-[#0075ff] to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 force-white">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a10.973 10.973 0 00-.25 2.349v1.2a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2a1 1 0 00.553-.894v-1.2c0-.796-.088-1.58-.25-2.349l2.644-1.131a1 1 0 000-1.84l-7-3zM5.5 13.5v-2.293l4 1.714 4-1.714V13.5l-4 1.714-4-1.714z" />
                </svg>
              </div>
            </div>

            {/* Score box inside card */}
            <div className="w-full rounded-xl px-4 py-2 mt-2 text-center bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{admissionRate}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {approved} Admitted of {total} Applicants
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>In Review: <strong className="text-slate-700 dark:text-slate-200">{pending}</strong></span>
            <span>Needs Action: <strong className="text-rose-500">{actionNeeded}</strong></span>
          </div>
        </div>

        {/* Card 3 (3.5 cols): Department Capacity & Matriculation Quota */}
        <div className="lg:col-span-4 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Quotas</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                TVET Target Capacity Allocation
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center py-2">
            {/* Left Quota Stats */}
            <div className="col-span-6 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                  Capacity
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                  {totalCapacity.toLocaleString()} Seats
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                  Enrolled
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-[#00d8d6] mt-0.5 block">
                  {approved} Matriculated
                </span>
              </div>
            </div>

            {/* Right Circular Score Ring */}
            <div className="col-span-6 flex items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 110 110">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0075ff" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="55"
                    cy="55"
                    r="42"
                    fill="none"
                    strokeWidth="9"
                    className="svg-gauge-track"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r="42"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="9"
                    strokeDasharray="263.9"
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    Quota Used
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {fulfillmentPercent}%
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Active Intake</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown Mini List */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/5 text-[11px]">
            {departments.slice(0, 3).map((dept: any) => (
              <div key={dept.id} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {dept.name}
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                    {dept.admitted_count} / {dept.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(dept.fulfillment_percent || 0, 100)}%` }}
                    className="h-full rounded-full bg-[#0075ff]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: BOTTOM 2 CHARTS (Live Intake Pipeline + Department Allocation)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Applications Pipeline SVG Area Chart (7 cols) */}
        <div className="lg:col-span-7 vision-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Applications Pipeline Overview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time trainee submissions across recent academic months
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {total} Total Submissions
            </span>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="w-full h-56 mt-4 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 180"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="realBlueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0075ff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0075ff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2="580" y2="20" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="4 4" />
              <line x1="20" y1="70" x2="580" y2="70" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="4 4" />
              <line x1="20" y1="120" x2="580" y2="120" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="4 4" />
              <line x1="20" y1="165" x2="580" y2="165" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />

              {/* Area fill */}
              {areaPath && (
                <path d={areaPath} fill="url(#realBlueAreaGrad)" />
              )}

              {/* Smooth curve line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0075ff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((pt: any, idx: number) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#0075ff"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  {pt.apps > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill={isDark ? '#ffffff' : '#0f172a'}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {pt.apps}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Month Labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-3 px-3">
            {monthlyData.map((d: any, idx: number) => (
              <span key={idx}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Chart 2: TVET Department Allocation Bar Chart (5 cols) */}
        <div className="lg:col-span-5 vision-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Department Applications</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live trainee distribution across 5 TVET programs
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {total} Candidates
              </span>
            </div>

            {/* Department Bars Container */}
            <div className="w-full h-36 bg-slate-50 dark:bg-[#0b1437]/80 rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex items-end justify-between space-x-3">
              {departments.length > 0 ? (
                departments.map((dept: any) => {
                  const maxDeptCount = Math.max(...departments.map((d: any) => d.applications_count), 2);
                  const barHeightPercent = Math.max((dept.applications_count / maxDeptCount) * 100, 12);

                  return (
                    <div key={dept.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-blue-500 transition">
                        {dept.applications_count}
                      </span>
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 shadow-sm ${
                          dept.applications_count > 0
                            ? 'bg-[#0075ff] group-hover:bg-[#00d8d6]'
                            : 'bg-slate-300 dark:bg-white/10'
                        }`}
                        title={`${dept.name}: ${dept.applications_count} applicants, ${dept.admitted_count} admitted`}
                      />
                      <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mt-2 truncate max-w-full">
                        {dept.code}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Loading department metrics...
                </div>
              )}
            </div>
          </div>

          {/* 4 Bottom Real Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/80 dark:border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Candidates
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {total.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                In Review
              </span>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                {pending.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Admitted
              </span>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {approved.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Programs
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {departments.length || 5} Tracks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: RECENT CANDIDATE DOSSIERS TABLE
      ========================================================================= */}
      <div className="vision-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Candidate Submissions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              <span>Live intake queue for verification, credential review, and ID issuance</span>
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1a1f37] hover:bg-[#0075ff] text-slate-800 dark:text-white hover:text-white text-xs font-semibold border border-slate-300 dark:border-white/10 transition shadow-sm force-white"
          >
            <span>View All Applications</span>
            <span className="ml-1.5">→</span>
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No applications submitted in this cycle yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3.5 px-3">Candidate</th>
                  <th className="pb-3.5 px-3">Department & Occupation</th>
                  <th className="pb-3.5 px-3">Level</th>
                  <th className="pb-3.5 px-3">Status</th>
                  <th className="pb-3.5 px-3">Verification</th>
                  <th className="pb-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-3">
                        {app.applicant_photo ? (
                          <img
                            src={app.applicant_photo}
                            alt={app.applicant_name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] flex items-center justify-center text-white font-black text-xs uppercase shadow-sm force-white">
                            {app.applicant_name ? app.applicant_name.charAt(0) : 'A'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {app.applicant_name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {app.application_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-900 dark:text-white font-medium">{app.department}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{app.occupation}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {app.level || 'Level I'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          <span>Complete</span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {app.status === 'approved' ? '100%' : app.status === 'under_review' ? '80%' : '45%'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            style={{
                              width: app.status === 'approved' ? '100%' : app.status === 'under_review' ? '80%' : '45%',
                            }}
                            className={`h-full rounded-full ${
                              app.status === 'approved'
                                ? 'bg-emerald-500'
                                : app.status === 'under_review'
                                ? 'bg-[#0075ff]'
                                : 'bg-amber-400'
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-[#0075ff]/20 hover:bg-[#0075ff] text-[#0075ff] hover:text-white font-bold transition text-[11px] border border-blue-200 dark:border-[#0075ff]/30 shadow-sm"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;