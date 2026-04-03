import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: 'Application Tracking',
      description: 'Keep all your job applications organized in one centralized command center. Track statuses from Applied to Offer.',
      icon: 'format_list_bulleted'
    },
    {
      title: 'Analytics & Insights',
      description: 'Visualize your success rate with beautiful charts. Understand your interview-to-offer ratio at a glance.',
      icon: 'monitoring'
    },
    {
      title: 'Interview Calendar',
      description: 'Never miss an opportunity. Auto-sync interview dates and view your upcoming schedule in a dedicated layout.',
      icon: 'calendar_month'
    },
    {
      title: 'Automated Job Discovery',
      description: 'Built-in scraping functionality to find relevant roles on autopilot based on your precise targeting.',
      icon: 'search_insights'
    }
  ];

  const faqs = [
    {
      q: 'How much does JobTrackr cost?',
      a: 'JobTrackr is currently completely free and open-source for personal use.'
    },
    {
      q: 'Will my data be sold to recruiters?',
      a: 'Absolutely not. You are the sole owner of your application metadata.'
    },
    {
      q: 'Can I export my data later?',
      a: 'Yes, your dashboard offers an export feature that dumps your records into a universally accepted CSV.'
    }
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface overflow-x-hidden selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/20 blur-[120px]"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.15]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary drop-shadow-[0_0_10px_rgba(192,193,255,0.5)]">
            rocket_launch
          </span>
          <span className="text-2xl font-black tracking-tighter text-white">JobTrackr</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-on-surface-variant uppercase tracking-widest">
          <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="#faq" className="hover:text-white transition-colors cursor-pointer">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white hover:text-primary transition-colors">
            Log in
          </Link>
          <Link to="/register" className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            Start Tracking
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low ghost-border mb-8 text-xs font-bold text-primary uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Now featuring Job Discovery
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 max-w-4xl tracking-tight">
          Your Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Command Center</span> for Job Hunting.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
          JobTrackr centralizes every application, interview scheduling, and auto-discovers jobs. Treat your career progression like a mission-critical operation.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register" className="w-full sm:w-auto bg-gradient-to-b from-primary to-primary-container text-on-primary-fixed px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
            Initialize Workspace
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-surface-container hover:bg-surface-container-high transition-colors ghost-border flex items-center justify-center gap-2">
            Explore Capabilities
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Enterprise-Grade Tools.</h2>
          <p className="text-on-surface-variant font-medium">Bespoke features engineered for ambitious professionals.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-surface-container-low ghost-border rounded-2xl p-8 hover:bg-surface-container transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 px-6 lg:px-12 max-w-3xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">System Queries</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-surface-container-lowest ghost-border rounded-xl flex flex-col overflow-hidden">
              <button
                className="flex items-center justify-between p-6 w-full text-left focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="text-lg font-bold text-white">{faq.q}</span>
                <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  openFaq === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-on-surface-variant">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-on-surface-variant text-sm font-bold uppercase tracking-widest bg-surface-container-lowest mt-auto">
        JobTrackr Platform © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;
