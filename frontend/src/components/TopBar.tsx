import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopBar: React.FC = () => {
  const { username, logout } = useAuth();

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-2xl flex items-center justify-between px-6 py-3 font-body antialiased">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-white">JobTrackr</span>
        <div className="hidden md:flex items-center gap-6">
          <a
            className="text-white font-semibold hover:text-indigo-400 transition-colors duration-200"
            href="/dashboard"
          >
            Dashboard
          </a>
          <a
            className="text-slate-400 font-medium hover:text-indigo-400 transition-colors duration-200"
            href="/analytics"
          >
            Analytics
          </a>
          <a
            className="text-slate-400 font-medium hover:text-indigo-400 transition-colors duration-200"
            href="/profile"
          >
            Profile
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              {username || 'User'}
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase">Active Session</span>
          </div>
          <div className="w-8 h-8 rounded-lg overflow-hidden ghost-border bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary-fixed font-bold text-sm">
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
