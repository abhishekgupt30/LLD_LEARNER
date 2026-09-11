import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';

export const AppLayout: React.FC = () => {
  return (
    <div className="bg-[#0f131c] text-[#dfe2ee] min-h-screen antialiased flex flex-col">
      <TopNavigation />
      <main className="w-full pt-16 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
