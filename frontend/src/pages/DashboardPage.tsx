import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const currentSection = () => {
    if (location.pathname.includes('/profile')) return 'Profile';
    if (location.pathname.includes('/applications/new')) return 'New Application';
    if (location.pathname.includes('/applications')) return 'Applications';
    return 'Dashboard';
  };

  const isStaff = user?.role === 'admin' || user?.role === 'registrar';

  return (
    <div className="min-h-screen bg-[#060b26] text-slate-200 flex flex-row font-sans selection:bg-[#0075ff] selection:text-white">
      {/* =========================================================================
          LEFT SIDEBAR (Vision UI Dark Glass Sidebar)
      ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 p-4 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full vision-card rounded-3xl p-5 flex flex-col justify-between overflow-y-auto">
          {/* Top Brand & Logo */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 px-2 py-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0075ff] via-[#102a71] to-[#7551ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <span className="font-black text-sm tracking-widest">HTC</span>
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white uppercase block">
                  STUDENT PORTAL
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                  Hawagalan TVET
                </span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

            {/* Main Menu Links */}
            <div className="space-y-1.5">
              <Link
                to="/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/dashboard')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/dashboard')
                      ? 'bg-[#0075ff] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f37] text-[#0075ff]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/dashboard/profile"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/dashboard/profile')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/dashboard/profile')
                      ? 'bg-[#0075ff] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f37] text-[#0075ff]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>My Profile</span>
              </Link>

              <Link
                to="/dashboard/applications"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/dashboard/applications')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/dashboard/applications')
                      ? 'bg-[#0075ff] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f37] text-[#0075ff]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>My Applications</span>
              </Link>
            </div>

            {/* Account Pages Section */}
            <div className="pt-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-4 mb-2 block">
                ACCOUNT PAGES
              </span>

              <div className="space-y-1.5">
                {isStaff && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-emerald-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span>Admin Portal</span>
                  </Link>
                )}

                {/* Theme Toggle in Sidebar */}
                <div className="pt-2">
                  <ThemeToggle showLabel={true} className="w-full justify-center py-2.5" />
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom "Need help?" Vision UI Card */}
          <div className="relative mt-6 rounded-2xl p-4 overflow-hidden bg-gradient-to-br from-[#0075ff]/25 to-[#7551ff]/20 border border-white/10">
            <div className="relative z-10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0075ff] flex items-center justify-center text-white shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-white">Need Help?</div>
              <p className="text-[11px] text-slate-300">
                Hawagalan Registrar Office is open Mon-Fri 8:30am - 5:00pm.
              </p>
              <a
                href="mailto:admissions@hawagalan.edu.et"
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition mt-2"
              >
                Contact Registrar
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN CONTENT AREA
      ========================================================================= */}
      <div className="flex-1 min-h-screen lg:ml-72 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Floating Glassbar Header */}
        <header className="vision-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-2xl">
          {/* Breadcrumbs & Page Title */}
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span>Pages</span>
              <span>/</span>
              <span className="text-white capitalize">{currentSection()}</span>
            </div>
            <h1 className="text-lg font-bold text-white capitalize mt-0.5">
              {currentSection()}
            </h1>
          </div>

          {/* Right Action Icons & Profile Pill */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#1a1f37] border border-white/10 text-slate-300 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Vision UI Search Box */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Type here..."
                className="w-48 xl:w-56 pl-9 pr-3 py-1.5 rounded-xl vision-input text-xs placeholder:text-slate-500 font-medium"
              />
            </div>

            {/* Staff Switch Pill (if user is staff) */}
            {isStaff && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:scale-105 transition"
              >
                <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse"></span>
                Admin Portal
              </Link>
            )}

            {/* Profile Avatar Pill */}
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] flex items-center justify-center font-bold text-xs text-white uppercase shadow-md shadow-blue-500/30">
                {user?.name ? user.name.charAt(0) : user?.email?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#1a1f37] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Routes */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}
    </div>
  );
};

export default DashboardPage;
