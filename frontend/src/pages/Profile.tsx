import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { username } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: username || 'User',
    email: username || '',
    phone: '',
    bio: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axios.get('/user/profile');
        setProfileForm({
          fullName: response.data.fullName || username || 'User',
          email: response.data.email || username || '',
          phone: response.data.phone || '',
          bio: response.data.bio || '',
        });
      } catch (err) {
        // Suppress console error regarding sensitive data
      }
    };
    loadProfile();
  }, [username]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/user/profile', {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        bio: profileForm.bio,
      });
      setSuccessMessage('Profile updated successfully!');
      
      const response = await axios.get('/user/profile');
      setProfileForm({
        fullName: response.data.fullName || username || 'User',
        email: response.data.email || username || '',
        phone: response.data.phone || '',
        bio: response.data.bio || '',
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSuccessMessage('Failed to update profile');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 lg:px-12 py-8 pb-12 w-full max-w-5xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">
          <span>Overview</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Profile</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          System Profile
        </h1>
        <p className="text-on-surface-variant">Manage your command center identity</p>
      </header>

      {successMessage && (
        <div className="mb-6 px-4 py-3 bg-primary/20 border border-primary/50 text-primary rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {successMessage}
        </div>
      )}

      <div className="bg-surface-container rounded-xl ghost-border p-8">
        <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-4xl font-bold text-on-primary-fixed shadow-[0_0_20px_rgba(192,193,255,0.2)]">
            {profileForm.fullName[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{profileForm.fullName}</h2>
            <p className="text-primary font-bold text-sm tracking-wide">ID: {username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => handleProfileChange('fullName', e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Phone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Bio / Role</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={3}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed px-6 py-3 rounded-lg font-bold text-sm tracking-tight hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Save Configuration'}
          {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
        </button>
      </div>
    </div>
  );
};

export default Profile;
