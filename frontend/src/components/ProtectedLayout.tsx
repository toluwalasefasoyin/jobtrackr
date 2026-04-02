import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const ProtectedLayout = () => {
  return (
    <div className="flex min-h-screen bg-surface text-on-surface dark:bg-inverse-surface dark:text-inverse-on-surface">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* TopBar */}
        <TopBar />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
