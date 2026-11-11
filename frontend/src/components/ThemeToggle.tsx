import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme mode"
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 group cursor-pointer ${
        isDark
          ? 'bg-white/10 hover:bg-white/15 text-yellow-300 border border-white/15 shadow-sm shadow-black/40'
          : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border border-slate-300 shadow-sm shadow-slate-200'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          /* Sun Icon for switching to Light */
          <svg
            className="w-4 h-4 transform group-hover:rotate-45 transition-transform duration-300 text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          /* Moon Icon for switching to Dark */
          <svg
            className="w-4 h-4 transform group-hover:-rotate-12 transition-transform duration-300 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold capitalize select-none">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

