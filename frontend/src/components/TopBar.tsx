import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopBar: React.FC = () => {
  const { username } = useAuth();

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl font-headline font-semibold text-lg border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <span className="text-lg font-extrabold text-primary dark:text-primary-fixed">JobTrackr</span>
        <div className="hidden md:flex items-center bg-surface-container-low dark:bg-surface-container rounded-full px-4 py-2 w-96 group focus-within:ring-2 ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-normal text-on-surface dark:text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search applications..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-high dark:hover:bg-white/10 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-surface-container-high dark:hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <div className="h-10 w-10 rounded-full bg-secondary-container overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm">
            {username?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
