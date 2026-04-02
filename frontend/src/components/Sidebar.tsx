import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/analytics', icon: 'query_stats', label: 'Insights' },
    { path: '/profile', icon: 'settings', label: 'Profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full py-8 px-4 flex flex-col justify-between h-screen w-64 bg-surface-container-low dark:bg-inverse-surface font-headline font-medium text-sm hidden lg:flex z-40 transition-all duration-300 ease-in-out">
      <div className="flex flex-col gap-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-black">
            <span className="material-symbols-outlined text-xl">work</span>
          </div>
          <div>
            <div className="text-xl font-black text-primary tracking-tight">The Executive</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Curator</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
                isActive(item.path)
                  ? 'text-primary dark:text-primary-fixed font-bold border-r-4 border-primary bg-white dark:bg-white/10 shadow-sm'
                  : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface dark:hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined" style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2">
        <button className="w-full mb-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
          New Application
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-all duration-300"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-all duration-300"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
