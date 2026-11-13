import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import CollegeLogo from '../../components/CollegeLogo';

const AdminLayout: React.FC = () => {
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
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const currentSection = () => {
    if (location.pathname.includes('/applications')) return 'Applications';
    if (location.pathname.includes('/admission-periods')) return 'Admission Periods';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#060b26] text-slate-200 flex flex-row font-sans selection:bg-[#0075ff] selection:text-white">
      {/* =========================================================================
          LEFT SIDEBAR (Vision UI Style)
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
              <CollegeLogo size={40} />
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white uppercase block">
                  REGISTRAR & ADMIN
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
                  Hawa Gelan TVET
                </span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

            {/* Main Menu Links */}
            <div className="space-y-1.5">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/admin/dashboard')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/admin/dashboard')
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
                to="/admin/applications"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/admin/applications')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/admin/applications')
                      ? 'bg-[#0075ff] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f37] text-[#0075ff]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Applications</span>
              </Link>

              <Link
                to="/admin/students"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/admin/students')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/admin/students')
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                      : 'bg-[#1a1f37] text-emerald-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a10.974 10.974 0 01-1.25 5.949A1 1 0 004.91 15.5h10.18a1 1 0 00.91-1.5 10.974 10.974 0 01-1.25-5.949l2.644-1.131a1 1 0 000-1.84l-7-3zM5.986 8.367l4.014 1.72 4.014-1.72-4.014-1.72-4.014 1.72z" />
                  </svg>
                </div>
                <span>Admitted Students & IDs</span>
              </Link>

              <Link
                to="/admin/admission-periods"
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive('/admin/admission-periods')
                    ? 'bg-[#1a1f37] text-white shadow-md shadow-blue-950/50 border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isActive('/admin/admission-periods')
                      ? 'bg-[#0075ff] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f37] text-[#0075ff]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Admission Periods</span>
              </Link>
            </div>

            {/* Account Pages Section */}
            <div className="pt-4 space-y-1.5">
              <span className="px-4 text-[11px] font-bold tracking-wider text-slate-500 uppercase block">
                ACCOUNT PAGES
              </span>

              <Link
                to="/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1f37] text-cyan-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Student View</span>
              </Link>

              {/* Theme Toggle in Sidebar */}
              <div className="pt-2">
                <ThemeToggle showLabel={true} className="w-full justify-center py-2.5" />
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 transition text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Bottom Card (Vision UI "Need help?" banner) */}
          <div className="mt-6 pt-4">
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#0075ff]/20 via-[#7551ff]/20 to-transparent border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-sm shadow-md mb-3">
                ?
              </div>
              <h4 className="text-xs font-bold text-white">Need help?</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Hawa Gelan TVET College Support & Admissions Desk</p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold text-white tracking-wider uppercase transition">
                  Staff Guide
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* =========================================================================
          MAIN CANVAS
      ========================================================================= */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Floating Glass Header */}
        <header className="sticky top-0 z-30 px-4 sm:px-8 py-4">
          <div className="vision-card rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4">
            {/* Left: Breadcrumbs & Section Title */}
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                <Link to="/admin/dashboard" className="hover:text-white transition">Pages</Link>
                <span>/</span>
                <span className="text-white font-semibold">{currentSection()}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                {currentSection()}
              </h1>
            </div>

            {/* Right: Search, Profile Pill & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Search Box */}
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Type here..."
                  className="vision-input text-xs rounded-xl pl-9 pr-4 py-2 w-44 lg:w-56 focus:w-64 transition-all"
                />
                <svg
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-500/20">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white max-w-[130px] truncate">
                    {user?.email}
                  </div>
                  <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Administrator' : 'Registrar'}
                  </div>
                </div>
              </div>

              {/* Mobile Sidebar Hamburger */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl vision-card text-slate-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 pt-2">
          <Outlet />
        </main>

        {/* Dark Footer */}
        <footer className="px-4 sm:px-8 py-5 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 pt-4">
            <div>
              © {new Date().getFullYear()} <strong>Hawa Gelan TVET College</strong> • Admissions & Student Management
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Vision UI Architecture Active</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
