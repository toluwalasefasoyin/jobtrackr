import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
    { path: '/interviews', icon: 'calendar_month', label: 'Interviews' },
    { path: '/analytics', icon: 'insert_chart', label: 'Analytics' },
    { path: '/profile', icon: 'settings', label: 'Profile' },
  ];

  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 flex-col p-4 gap-2 bg-surface-container-low pt-20 z-40 font-body text-sm tracking-wide">
      <div className="mb-8 px-4">
        <h2 className="text-indigo-500 font-black text-lg">JobTrackr</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">Command Center</p>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-300 ${
              isActive(item.path)
                ? 'text-white bg-indigo-500/10'
                : 'text-slate-500 hover:bg-white/5'
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={
                isActive(item.path)
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              {item.icon}
            </span>
            <span className={isActive(item.path) ? 'font-semibold' : ''}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-auto space-y-1 pt-4 border-t border-white/5">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-white/5 transition-all duration-300 rounded-md"
        >
          <span className="material-symbols-outlined text-lg">help_outline</span>
          <span>Help</span>
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-white/5 transition-all duration-300 rounded-md"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
