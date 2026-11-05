import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
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
      under_review: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400', label: 'In Review' },
      correction_required: { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400', label: 'Action Needed' },
      approved: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Approved' },
      rejected: { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Rejected' },
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
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center animate-spin">
          <div className="w-6 h-6 border-2 border-[#0075ff] border-t-transparent rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">Loading Command Center...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving live admission pipelines and statistics</p>
        </div>
      </div>
    );
  }

  const total = stats?.total_applications || 0;
  const pending = (stats?.submitted || 0) + (stats?.under_review || 0);
  const approved = stats?.approved || 0;

  const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 88;

  // Gauge calculation for semi-circle (circumference of radius 70 is pi * 70 = 219.9)
  const semiCircumference = 220;
  const gaugeOffset = semiCircumference - (semiCircumference * (approvedPercent / 100));

  // Tracking ring calculation (radius 44, circumference = 2 * pi * 44 = 276.4)
  const ringCircumference = 276.4;
  const quotaPercent = 78; // Target matriculation index
  const ringOffset = ringCircumference - (ringCircumference * (quotaPercent / 100));

  const userName = user?.name || user?.email?.split('@')[0] || 'Administrator';

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-4 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-rose-300 hover:text-white">×</button>
        </div>
      )}

      {/* =========================================================================
          ROW 1: TOP 4 VISION UI KPI METRIC CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Today's Money / Total Candidates */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Total Candidates
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                +55%
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Today's Users / In Review */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              In Review
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white tracking-tight">
                {pending.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                +5%
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: New Clients / New Submissions */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              New Submissions
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white tracking-tight">
                +{stats?.submitted ?? 0}
              </span>
              <span className="text-xs font-bold text-rose-400">
                -14%
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Sales / Admitted Students */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Admitted Students
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white tracking-tight">
                {approved.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                +8%
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: MIDDLE 3 VISION UI CARDS (Welcome + Radial Gauge + Quota Tracking)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1 (Width ~5 cols): Cosmic Jellyfish Welcome Card */}
        <div className="lg:col-span-5 vision-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Cosmic Jellyfish & Wave Glowing Background Illustration */}
          <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none select-none opacity-85 overflow-hidden">
            <svg
              className="w-full h-full object-cover transform translate-x-4"
              viewBox="0 0 320 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="jellyGlow" cx="60%" cy="40%" r="55%" fx="60%" fy="35%">
                  <stop offset="0%" stopColor="#00d8d6" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#0075ff" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#7551ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#060b26" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tentacleGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#00d8d6" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#0075ff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#7551ff" stopOpacity="0.1" />
                </linearGradient>
                <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>

              {/* Ambient Glow */}
              <circle cx="210" cy="110" r="90" fill="url(#jellyGlow)" filter="url(#softBlur)" />

              {/* Jellyfish Bell (Head) */}
              <path
                d="M 150,110 C 145,50 275,50 270,110 C 265,125 240,135 210,135 C 180,135 155,125 150,110 Z"
                fill="url(#jellyGlow)"
                stroke="#00d8d6"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Inner Rim Light */}
              <path
                d="M 160,110 C 165,65 255,65 260,110"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.6"
              />

              {/* Flowing Tentacles */}
              <path
                d="M 175,130 C 170,165 195,190 185,240 C 180,265 170,275 165,280"
                stroke="url(#tentacleGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 195,135 C 200,170 180,205 205,255 C 215,275 220,285 225,290"
                stroke="url(#tentacleGrad)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M 215,135 C 225,175 235,195 220,245 C 210,265 205,275 200,285"
                stroke="url(#tentacleGrad)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 235,132 C 245,160 260,195 250,240 C 245,260 235,270 230,280"
                stroke="url(#tentacleGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 250,125 C 265,150 255,185 270,230 C 275,250 280,270 285,280"
                stroke="url(#tentacleGrad)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Floating Bioluminescent Sparkles */}
              <circle cx="160" cy="70" r="1.5" fill="#ffffff" opacity="0.8" />
              <circle cx="245" cy="65" r="2" fill="#00d8d6" opacity="0.9" />
              <circle cx="210" cy="50" r="1" fill="#ffffff" opacity="0.6" />
              <circle cx="185" cy="180" r="1.5" fill="#00d8d6" opacity="0.7" />
              <circle cx="225" cy="210" r="2" fill="#ffffff" opacity="0.8" />
              <circle cx="240" cy="160" r="1.5" fill="#7551ff" opacity="0.8" />
            </svg>
          </div>

          {/* Text Content Overlay */}
          <div className="relative z-10 space-y-2 max-w-[65%]">
            <span className="text-xs text-slate-400 font-semibold">Welcome back,</span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {userName}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Glad to see you again! Review admissions, track student matriculation, and configure intake cycles.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              to="/admin/admission-periods"
              className="inline-flex items-center text-xs font-bold text-white hover:text-[#0075ff] transition group"
            >
              <span>Manage Intake Cycles</span>
              <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Card 2 (Width ~3.5 cols): Vision UI Radial Semi-Circle Gauge ("Satisfaction / Admission Rate") */}
        <div className="lg:col-span-3 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-white">Admission Rate</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.active_period ? stats.active_period.name : 'From all cycles'}
            </p>
          </div>

          {/* Glowing Semi-Circle Radial Progress Gauge */}
          <div className="flex flex-col items-center justify-center my-1 relative">
            <div className="relative w-44 h-24 flex items-end justify-center overflow-visible">
              <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0075ff" />
                    <stop offset="100%" stopColor="#00d8d6" />
                  </linearGradient>
                  <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00d8d6" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Track Background Arc */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  stroke="#1a1f37"
                  strokeWidth="11"
                  strokeLinecap="round"
                />

                {/* Filled Neon Arc */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset={gaugeOffset}
                  filter="url(#gaugeGlow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Glowing Icon */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a10.973 10.973 0 00-.25 2.349v1.2a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2a1 1 0 00.553-.894v-1.2c0-.796-.088-1.58-.25-2.349l2.644-1.131a1 1 0 000-1.84l-7-3zM5.5 13.5v-2.293l4 1.714 4-1.714V13.5l-4 1.714-4-1.714z" />
                </svg>
              </div>
            </div>

            {/* Score pill inside card */}
            <div className="vision-card rounded-xl px-5 py-2 mt-2 text-center w-full max-w-[200px] border border-white/10">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="text-xl font-black text-white">{approvedPercent}%</div>
              <div className="text-[10px] text-slate-400">Based on qualifications</div>
            </div>
          </div>
        </div>

        {/* Card 3 (Width ~3.5 cols): Vision UI Score Ring ("Referral / Quota Tracking") */}
        <div className="lg:col-span-4 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Department Quotas</h3>
            <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">
              •••
            </button>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center py-2">
            {/* Left Quota Stats */}
            <div className="col-span-6 space-y-3">
              <div className="vision-card rounded-xl p-3 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Capacity
                </span>
                <span className="text-sm font-black text-white mt-0.5 block">
                  1,500 Seats
                </span>
              </div>
              <div className="vision-card rounded-xl p-3 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Enrolled
                </span>
                <span className="text-sm font-black text-[#00d8d6] mt-0.5 block">
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
                      <stop offset="100%" stopColor="#00d8d6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="55"
                    cy="55"
                    r="44"
                    fill="none"
                    stroke="#1a1f37"
                    strokeWidth="9"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r="44"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="9"
                    strokeDasharray="276"
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Quota Index
                  </span>
                  <span className="text-xl font-black text-white leading-tight">
                    9.4
                  </span>
                  <span className="text-[9px] text-slate-400">Total Score</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Fulfillment</span>
            <span className="font-bold text-emerald-400">78% Optimal</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: BOTTOM 2 CHARTS (Area Chart + Pill Bar Chart with 4 Sub-metrics)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Applications Pipeline SVG Area Chart (Width ~7 cols) */}
        <div className="lg:col-span-7 vision-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Applications Pipeline Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center">
              <span className="text-emerald-400 font-bold mr-1.5">(+24%) more</span>
              <span>than previous academic cycle</span>
            </p>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="w-full h-56 mt-4 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0075ff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0075ff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d8d6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00d8d6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Dotted Horizontal Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="165" x2="600" y2="165" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="210" x2="600" y2="210" stroke="rgba(255,255,255,0.12)" />

              {/* Curve 1: Background Subtle Cyan Glow Area */}
              <path
                d="M 0,210 L 0,110 C 40,80 80,180 120,170 C 160,160 200,120 240,110 C 280,100 320,130 360,120 C 400,110 440,70 480,90 C 520,110 560,150 600,140 L 600,210 Z"
                fill="url(#cyanAreaGrad)"
              />
              <path
                d="M 0,110 C 40,80 80,180 120,170 C 160,160 200,120 240,110 C 280,100 320,130 360,120 C 400,110 440,70 480,90 C 520,110 560,150 600,140"
                fill="none"
                stroke="#00d8d6"
                strokeWidth="2"
              />

              {/* Curve 2: Main Vivid Neon Blue Wave Area */}
              <path
                d="M 0,210 L 0,170 C 50,150 90,80 140,80 C 190,80 220,160 270,150 C 320,140 350,60 410,50 C 470,40 520,120 600,90 L 600,210 Z"
                fill="url(#blueAreaGrad)"
              />
              <path
                d="M 0,170 C 50,150 90,80 140,80 C 190,80 220,160 270,150 C 320,140 350,60 410,50 C 470,40 520,120 600,90"
                fill="none"
                stroke="#0075ff"
                strokeWidth="3.5"
              />

              {/* Key Data Point Markers */}
              <circle cx="140" cy="80" r="4.5" fill="#0075ff" stroke="#ffffff" strokeWidth="2" />
              <circle cx="410" cy="50" r="5" fill="#00d8d6" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          {/* Month Labels along bottom */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-3 px-1">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Chart 2: Vertical Pill Bar Chart with 4 Sub-metrics (Width ~5 cols) */}
        <div className="lg:col-span-5 vision-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Top Bar Chart Container */}
            <div className="w-full h-36 bg-[#0b1437]/80 rounded-2xl p-4 border border-white/5 flex items-end justify-between space-x-2">
              {[45, 70, 95, 30, 80, 50, 75, 40, 85, 60, 90, 65].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full max-w-[8px] rounded-full bg-white/90 group-hover:bg-[#0075ff] transition-all duration-300 shadow-sm"
                  ></div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-bold text-white">Active TVET Applicants</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-bold mr-1">(+23%)</span> than last week
              </p>
            </div>
          </div>

          {/* 4 Bottom Mini Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
            {/* Metric 1 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <div className="w-5 h-5 rounded-md bg-[#0075ff] flex items-center justify-center text-white text-[10px]">
                  👥
                </div>
                <span className="text-[10px] font-bold">Candidates</span>
              </div>
              <div className="text-sm font-black text-white pl-0.5">
                {total.toLocaleString()}
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <div className="w-5 h-5 rounded-md bg-[#0075ff] flex items-center justify-center text-white text-[10px]">
                  ⏳
                </div>
                <span className="text-[10px] font-bold">In Review</span>
              </div>
              <div className="text-sm font-black text-white pl-0.5">
                {pending.toLocaleString()}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <div className="w-5 h-5 rounded-md bg-[#0075ff] flex items-center justify-center text-white text-[10px]">
                  🎓
                </div>
                <span className="text-[10px] font-bold">Admitted</span>
              </div>
              <div className="text-sm font-black text-white pl-0.5">
                {approved.toLocaleString()}
              </div>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <div className="w-5 h-5 rounded-md bg-[#0075ff] flex items-center justify-center text-white text-[10px]">
                  🏢
                </div>
                <span className="text-[10px] font-bold">Programs</span>
              </div>
              <div className="text-sm font-black text-white pl-0.5">
                6 Tracks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: RECENT CANDIDATE DOSSIERS TABLE (Vision UI Projects Table Style)
      ========================================================================= */}
      <div className="vision-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Recent Candidate Submissions</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
              <span>Live intake pipeline for verification and admission</span>
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#1a1f37] hover:bg-[#0075ff] text-white text-xs font-semibold border border-white/10 transition shadow-sm"
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
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3.5 px-3">Candidate</th>
                  <th className="pb-3.5 px-3">Department & Track</th>
                  <th className="pb-3.5 px-3">Status</th>
                  <th className="pb-3.5 px-3">Dossier Completion</th>
                  <th className="pb-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                          {app.applicant_name ? app.applicant_name.charAt(0) : 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {app.applicant_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {app.application_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-medium">{app.department}</div>
                      <div className="text-[11px] text-slate-400">{app.occupation}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Verified</span>
                          <span className="font-bold text-white">
                            {app.status === 'approved' ? '100%' : app.status === 'under_review' ? '75%' : '40%'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            style={{
                              width: app.status === 'approved' ? '100%' : app.status === 'under_review' ? '75%' : '40%',
                            }}
                            className={`h-full rounded-full ${
                              app.status === 'approved'
                                ? 'bg-emerald-400'
                                : app.status === 'under_review'
                                ? 'bg-[#0075ff]'
                                : 'bg-amber-400'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#0075ff]/20 hover:bg-[#0075ff] text-[#0075ff] hover:text-white font-bold transition text-[11px] border border-[#0075ff]/30"
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
