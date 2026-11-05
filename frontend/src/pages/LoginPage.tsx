import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat();
        errorMessage = errorList.join(' ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@hawagalan.edu.et');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b26] p-4 font-sans relative overflow-hidden">
      {/* Vision UI Decorative ambient glowing circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0075ff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#7551ff]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full vision-card rounded-3xl p-8 sm:p-10 space-y-6 relative z-10 border border-white/10 shadow-2xl">
        {/* Brand Crest & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0075ff] to-[#7551ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
            <span className="font-black text-xl tracking-wider">HTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Hawagalan TVET College Student & Staff Portal
          </p>
        </div>

        {/* Quick helper pill for Admin */}
        <div className="bg-[#0f1535] border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="font-bold text-white">Staff Login Demo:</span>
            <div className="text-[11px] text-[#00d8d6]">admin@hawagalan.edu.et</div>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-2.5 py-1 bg-[#0075ff] hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] shadow-sm transition"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-start space-x-2 backdrop-blur-md">
            <span className="text-base">⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium"
              placeholder="e.g. candidate@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium"
              placeholder="Enter your account password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-[#0075ff] hover:bg-[#0060df] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In to Portal'
            )}
          </button>

          <div className="text-center pt-2 text-xs text-slate-400">
            <span>New applicant? </span>
            <Link to="/register" className="font-bold text-[#0075ff] hover:text-[#00d8d6] underline underline-offset-2">
              Create an account now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
