import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'registrar') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      const userObj = (userData as any)?.user || userData;
      const role = userObj?.role;

      if (role === 'admin' || role === 'registrar' || email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      let errorMessage = 'Invalid email address or password. Please try again.';
      if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat();
        errorMessage = errorList.join(' ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401 || err.response?.status === 422) {
        errorMessage = 'Invalid email address or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b26] text-slate-200 font-sans relative flex flex-col justify-between selection:bg-[#0075ff] selection:text-white overflow-x-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#0075ff]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#7551ff]/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* =========================================================================
          TOP NAVIGATION BAR
      ========================================================================= */}
      <header className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-between relative z-20">
        <Link to="/login" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0075ff] via-[#102a71] to-[#7551ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition">
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
        </Link>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <a
            href="https://hawagalantvt.edu.et"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            ← College Website
          </a>
          <Link
            to="/register"
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0075ff] hover:bg-[#0060df] shadow-md shadow-blue-500/30 transition transform hover:-translate-y-0.5"
          >
            Register
          </Link>
        </div>
      </header>

      {/* =========================================================================
          AUTHENTICATION CARD
      ========================================================================= */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-20">
        <div className="max-w-md w-full vision-card rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Glowing Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent"></div>

          {/* Header Title */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center mx-auto text-[#0075ff] shadow-inner mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-400">
              Enter your credentials to access your portal
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs mb-5 flex items-start space-x-2.5 backdrop-blur-md">
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0f1535] border-white/20 text-[#0075ff] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-slate-300">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-[#0075ff] hover:bg-[#0060df] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-5"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-3 text-xs text-slate-400">
              <span>Don't have an account yet? </span>
              <Link to="/register" className="font-bold text-[#0075ff] hover:text-[#00d8d6] underline underline-offset-2 transition">
                Register as Candidate
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* =========================================================================
          FOOTER
      ========================================================================= */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-500 relative z-20">
        <span>© {new Date().getFullYear()} Hawagalan TVET College • Admissions & Student Management</span>
      </footer>
    </div>
  );
};

export default LoginPage;
