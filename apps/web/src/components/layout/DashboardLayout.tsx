import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { NotificationProvider } from '../../contexts/NotificationContext';

const DashboardLayout: React.FC = () => {
  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default DashboardLayout;
