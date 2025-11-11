import React, { useState } from 'react';
import { Project, User, View, Activity } from '../../types.ts';
import ActivityFeed from './ActivityFeed';
import ProjectsGrid from './ProjectsGrid';
import { Grid3x3, Zap } from 'lucide-react';

interface ClientDashboardProps {
  projects: Project[];
  activities?: Activity[];
  user: User;
  setActiveView: (view: View) => void;
}

type DashboardView = 'feed' | 'projects';

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  projects,
  activities = [],
  user,
  setActiveView,
}) => {
  const [dashboardView, setDashboardView] = useState<DashboardView>('feed');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleViewDesign = (projectId: string) => {
    setActiveView(projectId as View);
  };

  return (
    <div className="w-full">
      {/* Header with View Toggle */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Welcome back, {user.name}!
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
          Manage your design projects and stay updated with real-time activity
        </p>

        {/* View Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setDashboardView('feed')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              dashboardView === 'feed'
                ? 'bg-gradient-to-r from-brand-accent to-blue-600 text-white shadow-lg'
                : 'bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            <Zap size={20} />
            Activity Feed
          </button>
          <button
            onClick={() => setDashboardView('projects')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              dashboardView === 'projects'
                ? 'bg-gradient-to-r from-brand-accent to-blue-600 text-white shadow-lg'
                : 'bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            <Grid3x3 size={20} />
            Projects ({projects.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl">
        {dashboardView === 'feed' ? (
          <ActivityFeed
            activities={activities}
            currentUser={user}
            onViewDesign={handleViewDesign}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">
              Your Projects
            </h2>
            <ProjectsGrid projects={projects} onSelectProject={setActiveView} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;