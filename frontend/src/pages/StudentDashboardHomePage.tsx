import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationApi, profileApi, referenceApi } from '../services/api';

const StudentDashboardHomePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [activePeriod, setActivePeriod] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appsRes, periodRes] = await Promise.allSettled([
        profileApi.getProfile(),
        applicationApi.getApplications(),
        referenceApi.getActiveAdmissionPeriod(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.profile) {
        setProfile(profileRes.value.profile);
      }
      if (appsRes.status === 'fulfilled') {
        const apps = appsRes.value?.applications || [];
        setApplications(apps);
      }
      if (periodRes.status === 'fulfilled' && periodRes.value?.admission_period) {
        setActivePeriod(periodRes.value.admission_period);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; dot: string; label: string }> = {
      draft: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400', label: 'Draft' },
      submitted: { bg: 'bg-[#0075ff]/15 text-[#0075ff] border-[#0075ff]/30', dot: 'bg-[#0075ff] animate-ping', label: 'Submitted' },
      under_review: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', label: 'In Review' },
      correction_required: { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', label: 'Action Needed' },
      approved: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Admitted' },
      rejected: { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400', label: 'Not Admitted' },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`}></span>
        {c.label}
      </span>
    );
  };

  const latestApp = applications.length > 0 ? applications[0] : null;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center animate-spin">
          <div className="w-6 h-6 border-2 border-[#0075ff] border-t-transparent rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">Loading Student Portal...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving profile, applications, and intake schedule</p>
        </div>
      </div>
    );
  }

  // Verification readiness score
  const verificationPercent = latestApp?.status === 'approved' ? 100 : latestApp?.status === 'under_review' ? 75 : latestApp ? 50 : profile ? 35 : 15;
  const semiCircumference = 220;
  const gaugeOffset = semiCircumference - (semiCircumference * (verificationPercent / 100));

  const candidateName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || 'Applicant';

  return (
    <div className="space-y-6">
      {/* =========================================================================
          ROW 1: TOP 4 VISION UI KPI METRIC CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Application Status */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Application Status
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-lg font-black text-white tracking-tight capitalize">
                {latestApp ? latestApp.status.replace('_', ' ') : 'Not Started'}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {latestApp ? 'Active' : 'Open'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Profile Completion */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Profile Dossier
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white tracking-tight">
                {profile ? '100%' : '35%'}
              </span>
              <span className={`text-xs font-bold ${profile ? 'text-emerald-400' : 'text-amber-400'}`}>
                {profile ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Intake Cycle */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Intake Cycle
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-base font-black text-white tracking-tight truncate max-w-[140px]">
                {activePeriod ? activePeriod.name : 'Fall 2025'}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Live
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Official ID / TVET Program */}
        <div className="vision-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Matriculation ID
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-sm font-black text-[#00d8d6] tracking-tight font-mono">
                {latestApp?.application_number || 'HTC-PENDING'}
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
          ROW 2: MIDDLE 3 VISION UI CARDS (Cosmic Welcome + Radial Gauge + Quota/Track)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Cosmic Jellyfish Welcome Card (Width ~5 cols) */}
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
                <radialGradient id="studentJellyGlow" cx="60%" cy="40%" r="55%" fx="60%" fy="35%">
                  <stop offset="0%" stopColor="#00d8d6" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#0075ff" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#7551ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#060b26" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="studentTentacleGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#00d8d6" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#0075ff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#7551ff" stopOpacity="0.1" />
                </linearGradient>
                <filter id="studentSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>

              <circle cx="210" cy="110" r="90" fill="url(#studentJellyGlow)" filter="url(#studentSoftBlur)" />

              {/* Jellyfish Bell */}
              <path
                d="M 150,110 C 145,50 275,50 270,110 C 265,125 240,135 210,135 C 180,135 155,125 150,110 Z"
                fill="url(#studentJellyGlow)"
                stroke="#00d8d6"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Tentacles */}
              <path
                d="M 175,130 C 170,165 195,190 185,240 C 180,265 170,275 165,280"
                stroke="url(#studentTentacleGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 195,135 C 200,170 180,205 205,255 C 215,275 220,285 225,290"
                stroke="url(#studentTentacleGrad)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M 215,135 C 225,175 235,195 220,245 C 210,265 205,275 200,285"
                stroke="url(#studentTentacleGrad)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 235,132 C 245,160 260,195 250,240 C 245,260 235,270 230,280"
                stroke="url(#studentTentacleGrad)"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>

          {/* Text Content Overlay */}
          <div className="relative z-10 space-y-2 max-w-[65%]">
            <span className="text-xs text-slate-400 font-semibold">Welcome back,</span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {candidateName}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Glad to see you again! Track your admission review, submit certificates, and manage your technical profile.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              to="/dashboard/applications/new"
              className="inline-flex items-center text-xs font-bold text-white hover:text-[#0075ff] transition group"
            >
              <span>Apply for New TVET Program</span>
              <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Radial Semi-Circle Gauge ("Dossier Verification") */}
        <div className="lg:col-span-3 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-white">Verification Status</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Document check & registrar audit
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-1 relative">
            <div className="relative w-44 h-24 flex items-end justify-center overflow-visible">
              <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="studentGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0075ff" />
                    <stop offset="100%" stopColor="#00d8d6" />
                  </linearGradient>
                  <filter id="studentGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00d8d6" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Track Background */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  stroke="#1a1f37"
                  strokeWidth="11"
                  strokeLinecap="round"
                />

                {/* Neon Progress Arc */}
                <path
                  d="M 15 110 A 65 65 0 0 1 145 110"
                  fill="none"
                  stroke="url(#studentGaugeGrad)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset={gaugeOffset}
                  filter="url(#studentGaugeGlow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Glowing Icon */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0075ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="vision-card rounded-xl px-5 py-2 mt-2 text-center w-full max-w-[200px] border border-white/10">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="text-xl font-black text-white">{verificationPercent}%</div>
              <div className="text-[10px] text-slate-400">Dossier Completed</div>
            </div>
          </div>
        </div>

        {/* Card 3: TVET Program & Department Track */}
        <div className="lg:col-span-4 vision-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Program & Level Track</h3>
            <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">
              •••
            </button>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center py-2">
            <div className="col-span-6 space-y-3">
              <div className="vision-card rounded-xl p-3 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Department
                </span>
                <span className="text-xs font-black text-white mt-0.5 block truncate">
                  {latestApp?.department?.name || 'ICT & Automation'}
                </span>
              </div>
              <div className="vision-card rounded-xl p-3 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Level Tier
                </span>
                <span className="text-xs font-black text-[#00d8d6] mt-0.5 block truncate">
                  Level IV Diploma
                </span>
              </div>
            </div>

            <div className="col-span-6 flex items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 110 110">
                  <defs>
                    <linearGradient id="studentRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                    stroke="url(#studentRingGrad)"
                    strokeWidth="9"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * 0.88)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Readiness
                  </span>
                  <span className="text-xl font-black text-white leading-tight">
                    9.8
                  </span>
                  <span className="text-[9px] text-slate-400">Total Score</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Eligibility Status</span>
            <span className="font-bold text-emerald-400">Ready for Review</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: ADMISSION MILESTONES ROADMAP
      ========================================================================= */}
      <div className="vision-card rounded-2xl p-6">
        <div className="max-w-xl mb-4">
          <h3 className="text-base font-bold text-white">Your Admission Roadmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow these four key milestones to finalize your enrollment at Hawagalan TVET College.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className={`p-4 rounded-xl border transition ${profile ? 'bg-[#0075ff]/10 border-[#0075ff]/30 text-white' : 'vision-card border-white/10 text-slate-300'}`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${profile ? 'bg-[#0075ff] text-white shadow-md' : 'bg-[#1a1f37] text-slate-400'}`}>
                {profile ? '✓' : '1'}
              </span>
              <span className="text-xs font-bold text-white">1. Student Profile</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Legal names, contact numbers, address, and passport photo.
            </p>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xl border transition ${latestApp ? 'bg-[#0075ff]/10 border-[#0075ff]/30 text-white' : 'vision-card border-white/10 text-slate-300'}`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${latestApp ? 'bg-[#0075ff] text-white shadow-md' : 'bg-[#1a1f37] text-slate-400'}`}>
                {latestApp ? '✓' : '2'}
              </span>
              <span className="text-xs font-bold text-white">2. Program Choice</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Department, TVET occupation, and target level (Level I to V).
            </p>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xl border transition ${latestApp?.documents?.length > 0 ? 'bg-[#0075ff]/10 border-[#0075ff]/30 text-white' : 'vision-card border-white/10 text-slate-300'}`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${latestApp?.documents?.length > 0 ? 'bg-[#0075ff] text-white shadow-md' : 'bg-[#1a1f37] text-slate-400'}`}>
                {latestApp?.documents?.length > 0 ? '✓' : '3'}
              </span>
              <span className="text-xs font-bold text-white">3. Certificates</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              National exam results, previous diplomas, and ID proof.
            </p>
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-xl border transition ${latestApp?.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-white' : 'vision-card border-white/10 text-slate-300'}`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${latestApp?.status === 'approved' ? 'bg-emerald-500 text-white shadow-md' : 'bg-[#1a1f37] text-slate-400'}`}>
                {latestApp?.status === 'approved' ? '✓' : '4'}
              </span>
              <span className="text-xs font-bold text-white">4. Official ID</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Receive your matriculation ID and orientation schedule.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: RECENT APPLICATIONS TABLE
      ========================================================================= */}
      <div className="vision-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">My Admission Applications</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
              <span>Track status updates and official feedback</span>
            </p>
          </div>
          <Link
            to="/dashboard/applications/new"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#0075ff] hover:bg-[#0060df] text-white text-xs font-semibold shadow-lg shadow-blue-500/30 transition"
          >
            <span>+ Apply for New Program</span>
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <p>You haven't submitted any admission applications yet.</p>
            <Link
              to="/dashboard/applications/new"
              className="inline-block mt-3 text-xs font-bold text-[#0075ff] hover:underline"
            >
              Start your application now →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3.5 px-3">Application Number</th>
                  <th className="pb-3.5 px-3">Department & Occupation</th>
                  <th className="pb-3.5 px-3">Status</th>
                  <th className="pb-3.5 px-3">Submission Date</th>
                  <th className="pb-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {app.application_number}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-medium">{app.department?.name || 'TVET Program'}</div>
                      <div className="text-[11px] text-slate-400">{app.occupation?.name || 'General'}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Draft'}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/dashboard/applications/${app.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#0075ff]/20 hover:bg-[#0075ff] text-[#0075ff] hover:text-white font-bold transition text-[11px] border border-[#0075ff]/30"
                      >
                        View Dossier →
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

export default StudentDashboardHomePage;
