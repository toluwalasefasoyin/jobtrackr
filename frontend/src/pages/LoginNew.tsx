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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', username);
      login(res.data.token);
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
          <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-inverse-surface">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10 lg:hidden text-center">
                <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tight">JobTrackr</h1>
              </div>

              <header className="mb-10">
                <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">Welcome Back</h3>
                <p className="text-on-surface-variant text-sm">Please enter your details to access your curator dashboard.</p>
              </header>

              {error && (
                <div className="mb-6 px-4 py-3 bg-error-container border border-error-container rounded-lg text-on-error-container text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant ml-1 font-semibold">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant"
                    placeholder="curator@executive.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Password</label>
                    <a className="text-xs text-primary font-semibold hover:underline" href="#">Forgot?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 pr-12 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 px-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <label className="text-sm text-on-surface-variant" htmlFor="remember">Remember me for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest bg-white dark:bg-inverse-surface px-4">
                  <span className="text-on-surface-variant">Or continue with</span>
                </div>
              </div>

              {/* Social Button */}
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-center space-x-3 w-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant font-semibold py-4 rounded-full transition-all border border-outline-variant/10">
                  <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/firebaseapp/v8.10.0/images/favicon.png" />
                  <span>Sign in with Google</span>
                </button>
              </div>

              <footer className="mt-10 text-center">
                <p className="text-on-surface-variant text-sm">
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
