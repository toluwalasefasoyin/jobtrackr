import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const googleUsername = searchParams.get('username');

    if (token && googleUsername) {
      login(token, googleUsername);
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, login, navigate]);

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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', username);
      login(res.data.token, username);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body flex flex-col">
      <main className="flex-grow flex items-center justify-center relative overflow-hidden px-4">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-fixed-dim blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-fixed blur-[120px]"></div>
        </div>

        {/* Auth Container */}
        <div className="container max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl">
          {/* Visual Side */}
          <div className="hidden lg:flex lg:col-span-5 bg-surface-container-low p-12 flex-col justify-between relative overflow-hidden">
            <div className="z-10">
              <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tight mb-2">JobTrackr</h1>
              <p className="font-headline font-semibold text-on-surface-variant text-lg">The Executive Curator</p>
            </div>
            <div className="z-10">
              <h2 className="font-headline font-bold text-3xl text-on-surface leading-tight mb-4">Master your career journey with editorial precision.</h2>
              <p className="text-on-surface-variant leading-relaxed max-w-xs">Organize, track, and secure your next executive role with our calm, authoritative interface.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-surface-container-highest rounded-2xl -rotate-12 opacity-40"></div>
            <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-primary-container/10 rounded-2xl -rotate-6"></div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10 lg:hidden text-center">
                <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tight">JobTrackr</h1>
              </div>

              <header className="mb-10">
                <h3 className="font-headline font-bold text-2xl text-black mb-2">Welcome Back</h3>
                <p className="text-black text-sm">Please enter your details to access your curator dashboard.</p>
              </header>

              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-[11px] uppercase tracking-widest text-black ml-1 font-bold">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-slate-400"
                    placeholder="curator@executive.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label text-[11px] uppercase tracking-widest text-black font-bold">Password</label>
                    <a className="text-xs text-primary font-semibold hover:underline" href="#">Forgot?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 pr-12 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 px-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm text-black" htmlFor="remember">Remember me for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-headline font-bold py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      {timerCount > 0 ? `Initializing... (${timerCount}s)` : 'Authenticating...'}
                    </span>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest bg-white px-4">
                  <span className="text-slate-400 font-bold">Or continue with</span>
                </div>
              </div>

              {/* Social Button */}
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
                  className="flex items-center justify-center space-x-3 w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-full transition-all border border-slate-200 shadow-sm"
                >
                  <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/firebaseapp/v8.10.0/images/favicon.png" />
                  <span>Sign in with Google</span>
                </a>
              </div>

              <footer className="mt-10 text-center">
                <p className="text-slate-500 text-sm font-medium">
                  New to the platform?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline">
                    Register Account
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface dark:bg-inverse-surface border-t border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant opacity-70">
            © 2024 JobTrackr Executive
          </div>
          <nav className="flex space-x-8">
            <a className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant opacity-70 hover:text-primary transition-colors" href="#">Help Center</a>
            <a className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant opacity-70 hover:text-primary transition-colors" href="#">Documentation</a>
            <a className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant opacity-70 hover:text-primary transition-colors" href="#">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Login;