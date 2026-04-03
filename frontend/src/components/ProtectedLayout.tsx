import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useSessionTimer } from '../hooks/useSessionTimer';

const ProtectedLayout = () => {
  const { showModal, extendSession, logoutSession } = useSessionTimer();

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 relative min-h-screen">
        {/* TopBar */}
        <TopBar />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-mesh relative z-0">
          <Outlet />
        </main>
      </div>

      {/* Timeout Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-surface-container-low ghost-border rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tertiary/50 to-transparent"></div>
            <div className="flex items-center gap-3 mb-4 text-tertiary">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h2 className="text-xl font-black text-white tracking-tight">Session Paused</h2>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mb-8 leading-relaxed">
              For your security, you are about to be logged out due to 15 minutes of inactivity. Do you need more time?
            </p>
            <div className="flex gap-3">
              <button
                onClick={logoutSession}
                className="flex-1 bg-surface-container ghost-border hover:bg-surface-bright text-on-surface py-3 rounded-xl font-bold transition-all text-sm"
              >
                Log Out
              </button>
              <button
                onClick={extendSession}
                className="flex-1 bg-gradient-to-b from-tertiary to-tertiary-container text-on-tertiary-container py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-tertiary/20 hover:brightness-110 active:scale-95"
              >
                Extend Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedLayout;
