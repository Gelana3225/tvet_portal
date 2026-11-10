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
    const config: Record<string, { bg: string; dot: string; label: string; text: string }> = {
      draft: { bg: 'bg-slate-500/15 border-slate-500/30', dot: 'bg-slate-400', label: 'Draft (Incomplete)', text: 'text-slate-300' },
      submitted: { bg: 'bg-[#0075ff]/15 border-[#0075ff]/30', dot: 'bg-[#0075ff] animate-ping', label: 'Submitted (Pending Review)', text: 'text-[#0075ff]' },
      under_review: { bg: 'bg-amber-500/15 border-amber-500/30', dot: 'bg-amber-400', label: 'Under Review', text: 'text-amber-400' },
      correction_required: { bg: 'bg-orange-500/15 border-orange-500/30', dot: 'bg-orange-400', label: 'Action Required (Correction Needed)', text: 'text-orange-400' },
      approved: { bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Admitted & Approved ✓', text: 'text-emerald-400' },
      rejected: { bg: 'bg-rose-500/15 border-rose-500/30', dot: 'bg-rose-400', label: 'Not Admitted', text: 'text-rose-400' },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${c.dot}`}></span>
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
          <p className="text-sm font-bold text-white">Loading Your Admission Portal...</p>
          <p className="text-xs text-slate-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  const candidateFirstName = profile?.first_name 
    ? profile.first_name 
    : user?.name ? user.name.split(' ')[0] : 'Student';

  // Determine which step the student is currently on
  const isProfileComplete = !!(profile && profile.first_name && profile.phone);
  const hasApplication = !!latestApp;
  const isSubmitted = latestApp && latestApp.status !== 'draft';
  const hasUploadedDocs = latestApp && (latestApp.documents?.length > 0);
  const isAdmitted = latestApp && latestApp.status === 'approved';
  const needsCorrection = latestApp && latestApp.status === 'correction_required';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* =========================================================================
          HERO BANNER: ACTION-DRIVEN REGISTRATION HERO
      ========================================================================= */}
      <div className="vision-card-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#0075ff]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0075ff]/20 text-[#00d8d6] text-xs font-bold border border-[#0075ff]/30">
              <span className="w-2 h-2 rounded-full bg-[#00d8d6] animate-pulse"></span>
              <span>{activePeriod ? `${activePeriod.name} (${activePeriod.academic_year})` : 'Fall 2026 Admissions Open'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {candidateFirstName}!
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {!hasApplication
                ? 'Welcome to Hawagalan TVET College. Complete your 3-step registration below to apply for upcoming vocational programs.'
                : needsCorrection
                ? 'The Admissions Office has reviewed your file and requested adjustments on your documents.'
                : isAdmitted
                ? `Congratulations! You have been officially admitted to Hawagalan TVET College. Your Student ID has been generated.`
                : isSubmitted
                ? `Your application #${latestApp.application_number} is currently with the Registrar Admissions Committee.`
                : 'You have an application in progress. Complete your document uploads to submit it for review.'}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!hasApplication ? (
              <Link
                to={!isProfileComplete ? '/dashboard/profile' : '/dashboard/applications/new'}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
              >
                <span>🚀 Start My Application</span>
              </Link>
            ) : needsCorrection ? (
              <Link
                to={`/dashboard/applications/${latestApp.id}`}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-2xl shadow-xl shadow-orange-500/30 transition"
              >
                <span>⚠️ Fix & Resubmit Documents</span>
              </Link>
            ) : !isSubmitted ? (
              <Link
                to={`/dashboard/applications/${latestApp.id}`}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
              >
                <span>✏️ Continue Application</span>
              </Link>
            ) : (
              <Link
                to={`/dashboard/applications/${latestApp.id}`}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-2xl border border-white/20 transition"
              >
                <span>📄 View Submitted Dossier</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE 4-STEP REGISTRATION CHECKLIST
      ========================================================================= */}
      <div className="vision-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>📋</span>
            <span>Your Registration Checklist</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete each step below to finalize your registration and secure your admission spot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STEP 1: Personal Profile */}
          <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
            isProfileComplete
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                {isProfileComplete ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span>✓ Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span>Incomplete</span>
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">1. Personal & Contact Profile</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provide your legal full name (Ethiopian 3-name system), contact phone number, local residence address (Woreda & Kebele), and emergency contact.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard/profile"
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isProfileComplete
                    ? 'bg-white/10 hover:bg-white/20 text-slate-200'
                    : 'bg-[#0075ff] hover:bg-[#0060df] text-white shadow-md shadow-blue-500/30'
                }`}
              >
                <span>{isProfileComplete ? 'View / Edit Profile' : 'Complete Profile Now →'}</span>
              </Link>
            </div>
          </div>

          {/* STEP 2: Choose TVET Program */}
          <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
            hasApplication
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : !isProfileComplete
              ? 'bg-white/[0.01] border-white/5 opacity-70'
              : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                {hasApplication ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span>✓ Program Selected</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Not Started</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">2. Select Your TVET Program</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {hasApplication ? (
                  <>
                    Selected: <strong className="text-white">{latestApp.department?.name || 'Department'}</strong> • {latestApp.occupation?.name || 'Occupation'} ({latestApp.qualification_level?.name || 'Level'})
                  </>
                ) : (
                  'Choose your technical department (Information Technology, Construction, Automotive, Electrical, Plumbing, Agriculture) and your target Level.'
                )}
              </p>
            </div>

            <div className="pt-2">
              {hasApplication ? (
                <Link
                  to={`/dashboard/applications/${latestApp.id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition"
                >
                  <span>View Program Choice</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard/applications/new"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0075ff] hover:bg-[#0060df] text-white shadow-md shadow-blue-500/30 transition"
                >
                  <span>Choose Program →</span>
                </Link>
              )}
            </div>
          </div>

          {/* STEP 3: Upload Documents */}
          <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
            hasUploadedDocs
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : !hasApplication
              ? 'bg-white/[0.01] border-white/5 opacity-70'
              : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                {hasUploadedDocs ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span>✓ Documents Uploaded</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Pending Upload</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">3. Upload Required Documents</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upload your Grade 10 / Grade 12 educational certificate, official academic transcript, and Kebele / National ID card for verification.
              </p>
            </div>

            <div className="pt-2">
              {hasApplication ? (
                <Link
                  to={`/dashboard/applications/${latestApp.id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0075ff] hover:bg-[#0060df] text-white shadow-md shadow-blue-500/30 transition"
                >
                  <span>{hasUploadedDocs ? 'Manage Documents' : 'Upload Documents Now →'}</span>
                </Link>
              ) : (
                <span className="text-xs text-slate-500 italic">Select program first to unlock upload</span>
              )}
            </div>
          </div>

          {/* STEP 4: Review & Admission */}
          <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
            isAdmitted
              ? 'bg-emerald-500/20 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10'
              : isSubmitted
              ? 'bg-[#0075ff]/10 border-[#0075ff]/30'
              : 'bg-white/[0.01] border-white/5 opacity-70'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
                {isAdmitted ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white">
                    <span>🎓 Admitted</span>
                  </span>
                ) : isSubmitted ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span>In Review</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Waiting for Submission</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">4. Admission & Student ID</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAdmitted ? (
                  <>
                    Congratulations! Your Student Matriculation ID has been issued. You are officially enrolled for this academic year.
                  </>
                ) : isSubmitted ? (
                  'Your application is currently under formal review by the Registrar. You will be notified once verified.'
                ) : (
                  'After you upload all required documents and click submit, the Registrar will review your file and generate your official College Student ID.'
                )}
              </p>
            </div>

            <div className="pt-2">
              {hasApplication && (
                <Link
                  to={`/dashboard/applications/${latestApp.id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition"
                >
                  <span>Track Review Status →</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: APPLICATION STATUS DETAILS & CONTACT SUPPORT
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Application Summary */}
        <div className="lg:col-span-2 vision-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">My Active Application</h3>
              <p className="text-xs text-slate-400 mt-0.5">Summary of your current application dossier</p>
            </div>
            {latestApp && getStatusBadge(latestApp.status)}
          </div>

          {latestApp ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Application Number</span>
                  <span className="font-mono text-sm font-bold text-[#0075ff] mt-0.5 block">{latestApp.application_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Department</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{latestApp.department?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Occupation / Trade</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{latestApp.occupation?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Qualification Level</span>
                  <span className="text-sm font-semibold text-[#00d8d6] mt-0.5 block">{latestApp.qualification_level?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Admission Period</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{latestApp.admission_period?.name || 'Current Intake'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Documents Attached</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{latestApp.documents?.length || 0} Files</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <span className="text-xs text-slate-400">
                  {latestApp.submitted_at 
                    ? `Submitted on: ${new Date(latestApp.submitted_at).toLocaleDateString('en-GB')}` 
                    : 'Application is currently in draft mode'}
                </span>
                <Link
                  to={`/dashboard/applications/${latestApp.id}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0075ff]/20 hover:bg-[#0075ff] text-[#0075ff] hover:text-white text-xs font-bold transition border border-[#0075ff]/30"
                >
                  <span>Open Full Application →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0075ff]/10 flex items-center justify-center mx-auto text-[#0075ff] text-xl">
                📝
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not started an application yet. Click the button below to choose your desired vocational trade.
              </p>
              <Link
                to={!isProfileComplete ? '/dashboard/profile' : '/dashboard/applications/new'}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition"
              >
                <span>Start New Application</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Help & Registrar Contact */}
        <div className="vision-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#0075ff]/20 text-[#0075ff] flex items-center justify-center font-bold text-sm">
                📞
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Need Help Registering?</h3>
                <p className="text-[11px] text-slate-400">Registrar Admissions Help Desk</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you have questions about required documents, TVET qualification levels, or deadlines, contact our admissions office:
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">📞 Phone:</span>
                <span className="font-semibold text-white">+251 91 100 0000 / 025 111 2233</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">✉️ Email:</span>
                <span className="font-semibold text-[#00d8d6]">admissions@hawagalantvt.edu.et</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">📍 Campus:</span>
                <span className="text-white">Hawagalan Main Campus, Registrar Office</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">⏰ Hours:</span>
                <span className="text-slate-300">Mon - Fri: 8:30 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <a
              href="https://hawagalantvt.edu.et"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition"
            >
              ← Visit College Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardHomePage;
