import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const programs = [
    {
      title: 'Information Communication Technology (ICT)',
      desc: 'Software development, database administration, network engineering, and hardware maintenance.',
      level: 'Level I - V',
      icon: '💻',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      title: 'Automotive & Electro-Mechanical',
      desc: 'Automotive electrical systems, engine overhaul, chassis maintenance, and diagnostics.',
      level: 'Level I - IV',
      icon: '⚙️',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Electrical & Power Systems',
      desc: 'Industrial motor control, domestic wiring, renewable solar installations, and power grids.',
      level: 'Level I - IV',
      icon: '⚡',
      color: 'from-yellow-400 to-amber-600',
    },
    {
      title: 'Construction & Civil Drafting',
      desc: 'Building construction, architectural drafting, surveying, and material quality assessment.',
      level: 'Level I - IV',
      icon: '🏗️',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Accounting & Business Management',
      desc: 'Financial records, payroll management, procurement, inventory logistics, and marketing.',
      level: 'Level I - IV',
      icon: '📊',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Health & Clinical TVET Care',
      desc: 'Health extension, pharmacy assistance, clinical records, and community healthcare support.',
      level: 'Level I - IV',
      icon: '🩺',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b26] text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#0075ff] selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0075ff]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-[#7551ff]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#00d8d6]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* =========================================================================
          TOP FLOATING GLASS NAVBAR
      ========================================================================= */}
      <nav className="fixed top-4 inset-x-4 sm:inset-x-8 max-w-7xl mx-auto z-50 vision-card rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0075ff] via-[#102a71] to-[#7551ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
            <span className="font-black text-sm tracking-widest">HTC</span>
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-white uppercase block leading-tight">
              Hawagalan TVET
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
              College Admissions Portal
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
          <a href="#about" className="hover:text-white transition">About College</a>
          <a href="#programs" className="hover:text-white transition">Academic Programs</a>
          <a href="#roadmap" className="hover:text-white transition">Admission Steps</a>
          <a href="#contact" className="hover:text-white transition">Contact Office</a>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0075ff] hover:bg-[#0060df] shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
          >
            Register Now
          </Link>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION
      ========================================================================= */}
      <section className="pt-36 sm:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Intake Live Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full vision-card border border-[#0075ff]/40 shadow-lg shadow-blue-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00d8d6] uppercase tracking-wider">
              2026/2027 Academic Year Intake Is Live
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Empowering Your Future Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d8d6] via-[#0075ff] to-[#7551ff]">
              Technical Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Hawagalan TVET College provides accredited technical & vocational education, industrial workshop training, and government-certified diploma qualifications across 6 core fields.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
            >
              <span>Apply for Admission</span>
              <span className="ml-2">→</span>
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl vision-card hover:bg-white/10 text-white text-sm font-bold border border-white/15 transition shadow-lg"
            >
              <svg className="w-4 h-4 mr-2 text-[#0075ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Student & Staff Sign In</span>
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="vision-card rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">6+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Accredited Departments
              </div>
            </div>

            <div className="vision-card rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#00d8d6]">Level I - V</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Certified Qualifications
              </div>
            </div>

            <div className="vision-card rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">1,500+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Active College Trainees
              </div>
            </div>

            <div className="vision-card rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">98%</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Industry Employment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROGRAMS SHOWCASE
      ========================================================================= */}
      <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-[#0075ff] uppercase tracking-widest block">
            Vocational Disciplines
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Programs Designed for Industry Demand
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select from our nationally standardized technical fields equipped with modern tools and hands-on laboratory workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, idx) => (
            <div
              key={idx}
              className="vision-card rounded-3xl p-6 relative overflow-hidden group hover:border-[#0075ff]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#0075ff]/20 text-[#00d8d6] font-bold text-[11px] border border-[#0075ff]/30">
                    {p.level}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#0075ff] transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Government Certified</span>
                <Link
                  to="/register"
                  className="font-bold text-[#0075ff] group-hover:text-[#00d8d6] flex items-center transition"
                >
                  <span>Apply Now</span>
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          ADMISSION ROADMAP
      ========================================================================= */}
      <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="vision-card rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0075ff] uppercase tracking-widest block">
              Application Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Simple 4-Step Registration Process
            </h2>
            <p className="text-xs text-slate-400">
              Submit your candidate dossier entirely online and track verification status from your applicant dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="vision-card rounded-2xl p-5 border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-[#0075ff] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/40">
                1
              </div>
              <h4 className="text-sm font-bold text-white mt-4">Create Account</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Register with your primary email address and create your secure portal password.
              </p>
            </div>

            <div className="vision-card rounded-2xl p-5 border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-[#0075ff] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/40">
                2
              </div>
              <h4 className="text-sm font-bold text-white mt-4">Complete Profile</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Provide your legal identity, contact numbers, emergency contact, and photo.
              </p>
            </div>

            <div className="vision-card rounded-2xl p-5 border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-[#0075ff] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/40">
                3
              </div>
              <h4 className="text-sm font-bold text-white mt-4">Select TVET Program</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Choose your department, desired occupation, and upload your educational certificates.
              </p>
            </div>

            <div className="vision-card rounded-2xl p-5 border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-emerald-500/40">
                4
              </div>
              <h4 className="text-sm font-bold text-white mt-4">Admissions & ID</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Registrar reviews and approves your submission, generating your official student ID.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
            >
              <span>Get Started Now</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
      ========================================================================= */}
      <footer id="contact" className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-xs text-slate-400">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] flex items-center justify-center text-white font-black text-xs shadow-md">
              HTC
            </div>
            <div>
              <span className="font-bold text-white block">Hawagalan TVET College</span>
              <span className="text-[11px] text-slate-500">Ministry of Labor & Skills Accredited Institution</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <span>📞 Registrar: +251 25 111 2345</span>
            <span>✉️ admissions@hawagalan.edu.et</span>
            <Link to="/login" className="hover:text-white transition">Staff Login</Link>
            <Link to="/register" className="hover:text-white transition">Apply Online</Link>
          </div>

          <div className="text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} Hawagalan TVET College. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
