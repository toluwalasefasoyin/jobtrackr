import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Timer feature: Wait 3 seconds with a visual countdown
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 3; i > 0; i--) {
      setTimerCount(i);
      await wait(1000);
    }
    setTimerCount(0);

    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password });
      login(res.data.token, username);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-noise pointer-events-none"></div>
      <div className="absolute inset-0 kinetic-gradient pointer-events-none"></div>
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[440px]">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 ghost-border">
              <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tighter text-white uppercase">
              JobTrackr
            </h1>
            <p className="text-on-surface-variant text-sm mt-1 tracking-wide">
              Enter the command center
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-low rounded-xl p-8 deep-shadow relative overflow-hidden">
            {/* Subtle Inset Glow */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-error-container/20 border border-error/30 rounded-lg text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg group-focus-within:text-primary transition-colors">
                    alternate_email
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all duration-300"
                    id="username"
                    placeholder="commander@jobtrackr.io"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
                    href="#"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 pl-10 pr-12 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all duration-300"
                    id="password"
                    placeholder="••••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 rounded-lg text-sm tracking-tight hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      {timerCount > 0 ? `Initializing... (${timerCount}s)` : 'Authenticating...'}
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="bg-surface-container-low px-4 text-outline">or connect with</span>
              </div>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest ghost-border rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest ghost-border rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-lg">terminal</span>
                GitHub
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-8 text-on-surface-variant text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all"
            >
              Create workspace
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 flex justify-between items-end relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              System Status: Nominal
            </span>
          </div>
          <p className="text-[10px] text-outline/50 uppercase tracking-tighter">
            © 2024 JobTrackr Engineering Group
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              Architecture
            </p>
            <p className="text-[10px] text-outline/50">v2.4.1-stable</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              Security
            </p>
            <p className="text-[10px] text-outline/50">AES-256 Encrypted</p>
          </div>
        </div>
      </footer>

      {/* Abstract Shapes */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};

export default Login;