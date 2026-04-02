import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, username } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-purple-400 border-b-2 border-purple-400'
      : 'text-gray-400 hover:text-white';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            JobTrackr
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className={`${isActive('/dashboard')} transition pb-1`}>
            Dashboard
          </Link>
          <Link to="/analytics" className={`${isActive('/analytics')} transition pb-1`}>
            Analytics
          </Link>
          <Link to="/profile" className={`${isActive('/profile')} transition pb-1`}>
            Profile
          </Link>
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center gap-6">
          <div className="h-8">
            <NotificationBell />
          </div>
          
          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{username}</p>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
