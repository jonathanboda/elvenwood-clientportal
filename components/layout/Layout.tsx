import React from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { Portal, View, User } from '../../types.ts';

interface LayoutProps {
  portal: Portal;
  setPortal: (portal: Portal) => void;
  activeView: View;
  setActiveView: (view: View) => void;
  user: User;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ portal, setPortal, activeView, setActiveView, user, children }) => {
  return (
    <div className="flex h-screen bg-light-bg-secondary dark:bg-dark-bg text-light-text dark:text-dark-text font-sans">
      <Sidebar 
        portal={portal} 
        setPortal={setPortal} 
        activeView={activeView} 
        setActiveView={setActiveView}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setActiveView={setActiveView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg-secondary dark:bg-dark-bg p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};