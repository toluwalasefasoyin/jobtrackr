import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import type { JobApplication } from '../types';

const Interviews: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/applications');
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications');
      setLoading(false);
    }
  };

  const interviewApps = applications.filter((app) => app.status === 'INTERVIEW' || app.interviewDate);

  // Simple calendar math
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getInterviewsForDate = (date: number) => {
    return interviewApps.filter((app) => {
      if (!app.interviewDate) return false;
      const appDate = new Date(app.interviewDate);
      return appDate.getDate() === date && 
             appDate.getMonth() === currentMonth && 
             appDate.getFullYear() === currentYear;
    });
  };

  if (loading) return <div className="text-center mt-12 text-on-surface">Loading calendar...</div>;
  if (error) return <div className="text-center mt-12 text-error">{error}</div>;

  return (
    <div className="px-6 lg:px-12 py-8 w-full max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2">
          Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Schedule</span>
        </h1>
        <p className="text-on-surface-variant font-medium">Tracking {monthNames[currentMonth]} {currentYear}</p>
      </header>

      <div className="bg-surface-container rounded-2xl ghost-border overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-low text-center py-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px] bg-outline-variant/10 gap-px">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
             <div key={`empty-${i}`} className="bg-surface-container/50"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const interviews = getInterviewsForDate(date);
            const isToday = date === today.getDate() && currentMonth === today.getMonth();

            return (
              <div key={date} className={`relative p-2 transition-colors ${isToday ? 'bg-primary/10' : 'bg-surface-container hover:bg-surface-container-high'}`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isToday ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}>
                  {date}
                </span>
                
                <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[70px] pr-1">
                  {interviews.map(interview => (
                    <div key={interview.id} className="text-[10px] bg-tertiary/20 border border-tertiary/30 text-tertiary font-bold px-1.5 py-1 rounded truncate">
                      {interview.company}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {interviewApps.length === 0 && (
        <div className="text-center text-on-surface-variant mt-8">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">calendar_month</span>
          <p>No interviews scheduled this month.</p>
        </div>
      )}
    </div>
  );
};

export default Interviews;
