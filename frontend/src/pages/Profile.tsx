import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Profile: React.FC = () => {
  const { username } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [notifications, setNotifications] = useState({
    emailOnNewJob: true,
    emailOnUpdate: true,
    emailOnOffer: true,
    pushNotifications: true,
  });
  const [profileForm, setProfileForm] = useState({
    fullName: 'John Doe',
    email: username || '',
    phone: '+1 (555) 123-4567',
    bio: 'Job seeker actively looking for software engineering opportunities',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveNotifications = () => {
    setSuccessMessage('Notification preferences saved!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 px-4 py-3 bg-green-500/20 border border-green-400/50 rounded-lg text-green-100 text-sm">
            {successMessage}
          </div>
        )}

        {/* Profile Information Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-400/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold">
              {profileForm.fullName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profileForm.fullName}</h2>
              <p className="text-purple-300">{username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="bg-gradient-to-r from-purple-500 via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            Save Profile Changes
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>

          <div className="space-y-4 mb-8">
            {[
              { key: 'emailOnNewJob', label: 'Email notifications for new job matches', description: 'Get emailed when new opportunities match your criteria' },
              { key: 'emailOnUpdate', label: 'Email on application updates', description: 'Receive emails when applications are updated' },
              { key: 'emailOnOffer', label: 'Email on job offers', description: 'Get notified immediately when you receive an offer' },
              { key: 'pushNotifications', label: 'Push notifications', description: 'Receive browser push notifications' },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-blue-400/20 hover:bg-white/10 transition">
                <input
                  type="checkbox"
                  id={key}
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-purple-400/60 bg-white/10 accent-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor={key} className="block text-sm font-medium text-white cursor-pointer">
                    {label}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveNotifications}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            Save Notification Settings
          </button>
        </div>

        {/* Theme Settings */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-400/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Theme</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {['light', 'dark', 'auto'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t as 'light' | 'dark' | 'auto')}
                className={`p-6 rounded-xl transition-all ${
                  theme === t
                    ? 'bg-amber-500/30 border-2 border-amber-400/60 shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 border border-amber-400/20 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">
                  {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'}
                </div>
                <p className="font-semibold text-white capitalize">{t} Mode</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t === 'light'
                    ? 'Light theme'
                    : t === 'dark'
                    ? 'Dark theme'
                    : 'System default'}
                </p>
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-400">
            Current theme: <span className="font-semibold text-amber-300 capitalize">{theme}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
