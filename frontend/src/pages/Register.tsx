import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special symbol.');
      return;
    }

    setLoading(true);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 3; i > 0; i--) {
      setTimerCount(i);
      await wait(1000);
    }
    setTimerCount(0);

    try {
      const res = await api.post<AuthResponse>('/auth/register', { username, email, password });
      login(res.data.token, username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 antialiased bg-background text-on-surface selection:bg-primary selection:text-on-primary">
      {/* Atmospheric Background Treatment */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 blur-[160px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full kinetic-gradient"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary-container/20 blur-[160px] rounded-full"></div>
      </div>

      <main className="w-full max-w-[440px]">
        {/* Brand Anchor */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span
                className="material-symbols-outlined text-on-primary-fixed"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                rocket_launch
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tighter text-on-surface">JobTrackr</h1>
          </div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2">
            Build your future.
          </h2>
          <p className="text-on-surface-variant text-sm font-medium">
            Create your command center and start tracking.
          </p>
        </header>

        {/* Registration Card */}
        <div className="glass-card rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="mb-6 px-4 py-3 bg-error-container/20 border border-error/30 rounded-lg text-error text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label
                className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">alternate_email</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">lock_open</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-12 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-outline ml-1">
                Must be at least 8 characters with one special symbol.
              </p>
            </div>

            {/* CTA Button */}
            <button
              className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed py-4 rounded-xl font-bold tracking-tight shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span>
                {loading ? (timerCount > 0 ? `Initializing... (${timerCount}s)` : 'Creating account...') : 'Create account'}
              </span>
              {!loading && (
                <span className="material-symbols-outlined text-lg translate-x-0 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Footer Action */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Trust */}
        <footer className="mt-12 grid grid-cols-3 gap-4 opacity-40">
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">
              verified_user
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              Secure SSL
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">
              encrypted
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              256-bit AES
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">
              cloud_done
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              Cloud Sync
            </span>
          </div>
        </footer>
      </main>

      {/* Decorative Abstract Element */}
      <div className="fixed top-12 right-12 hidden lg:block w-32 h-32 opacity-20 pointer-events-none">
        <div className="w-full h-full border border-primary/40 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/40 -rotate-45"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/40 rotate-45"></div>
      </div>
    </div>
  );
};

export default Register;