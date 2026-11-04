import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Admin Header */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center">
                <span className="bg-blue-600 text-white text-xs uppercase font-extrabold px-2 py-1 rounded tracking-wider mr-2">
                  Staff
                </span>
                <h1 className="text-lg font-bold text-white tracking-wide">
                  Hawagalan TVET College
                </h1>
              </div>
              <div className="hidden md:flex md:space-x-4">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/dashboard')
                      ? 'bg-slate-800 text-white border-b-2 border-blue-400'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/admin/applications"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/applications')
                      ? 'bg-slate-800 text-white border-b-2 border-blue-400'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Applications
                </Link>
                <Link
                  to="/admin/admission-periods"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/admission-periods')
                      ? 'bg-slate-800 text-white border-b-2 border-blue-400'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Admission Periods
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs uppercase font-semibold text-blue-400">
                  {user?.role === 'admin' ? 'System Administrator' : 'Registrar Staff'}
                </div>
                <div className="text-sm text-gray-300">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

