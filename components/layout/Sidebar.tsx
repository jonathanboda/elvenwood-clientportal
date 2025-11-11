import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, MessageSquare, Briefcase, Sun, Moon, LogOut, ChevronRight, User as UserIcon, Users } from 'lucide-react';
import { Portal, View, User } from '../../types.ts';

interface SidebarProps {
  portal: Portal;
  setPortal: (portal: Portal) => void;
  activeView: View;
  setActiveView: (view: View) => void;
  user: User;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; isActive: boolean; onClick: () => void; }> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
        ${isActive
          ? 'bg-brand-accent text-white'
          : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
        }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span>{label}</span>
    </a>
  );
};

const clientNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
];

const designerNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({ portal, setPortal, activeView, setActiveView, user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = portal === 'client' ? clientNav : designerNav;

  const handleSwitchPortal = () => {
    setPortal(portal === 'client' ? 'designer' : 'client');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-light-bg dark:bg-dark-bg-secondary flex flex-col border-r border-light-border dark:border-dark-border">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
        <h1 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">Elvenwood <ChevronRight size={18} className="text-brand-accent"/></h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
          />
        ))}
         <NavItem
            key='profile'
            icon={UserIcon}
            label='User Profile'
            isActive={activeView === 'profile'}
            onClick={() => setActiveView('profile')}
          />
      </nav>
      
      <div className="px-4 py-4 border-t border-light-border dark:border-dark-border">
          <div className="p-2">
            <div className="flex items-center gap-3">
              <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.role}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
             <button onClick={handleSwitchPortal} className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg">
                <Users className="h-5 w-5 mr-3"/>
                <span>Switch to {portal === 'client' ? 'Designer' : 'Client'}</span>
            </button>
             <button onClick={toggleDarkMode} className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg">
                {isDarkMode ? <Sun className="h-5 w-5 mr-3"/> : <Moon className="h-5 w-5 mr-3"/>}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <a href="#" onClick={(e) => {e.preventDefault(); alert("Logout functionality removed.")}} className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg">
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </a>
          </div>
      </div>
    </aside>
  );
};