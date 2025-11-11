import React, { useState, useMemo } from 'react';
import { Project, View, ProjectStatus } from '../../types.ts';
import { Eye, Calendar, Filter, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientProjectsProps {
  projects: Project[];
  setActiveView: (view: View) => void;
}

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const baseClasses = 'text-xs font-medium px-2.5 py-1 rounded-full';
  let colorClasses = '';

  switch (status) {
    case 'In Progress':
      colorClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      break;
    case 'In Review':
      colorClasses = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
      break;
    case 'Completed':
      colorClasses = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      break;
    case 'Awaiting Approval':
      colorClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
      break;
    default:
      colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const ProjectCard: React.FC<{ project: Project; onClick: (projectId: string) => void }> = ({ project, onClick }) => {
  const daysRemaining = project.endDate ?
    Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
    null;

  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  return (
    <div className="group bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col border border-light-border dark:border-dark-border hover:border-brand-accent dark:hover:border-brand-accent">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-light-bg-secondary dark:bg-dark-bg">
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text line-clamp-2 flex-1">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 flex-grow line-clamp-2">
          {project.description}
        </p>

        {/* Dates and Designer */}
        <div className="border-t border-light-border dark:border-dark-border pt-4 space-y-3">
          {/* Timeline */}
          {(project.startDate || project.endDate) && (
            <div className="text-xs space-y-1">
              {project.startDate && (
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  <span className="font-medium">Start:</span> {new Date(project.startDate).toLocaleDateString()}
                </p>
              )}
              {project.endDate && (
                <div>
                  <p className={`${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                    <span className="font-medium">End:</span> {new Date(project.endDate).toLocaleDateString()}
                    {daysRemaining !== null && (
                      <span className="ml-2">
                        {isOverdue
                          ? `(${Math.abs(daysRemaining)} days overdue)`
                          : `(${daysRemaining} days left)`}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Designer Info */}
          <div className="flex items-center gap-2 pt-2">
            <img
              src={project.designer.avatarUrl}
              alt={project.designer.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              {project.designer.name}
            </span>
          </div>

          {/* Version Count */}
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {project.versions?.length || 0} design version{(project.versions?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* View Button */}
        <button
          onClick={() => onClick(project.id)}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all text-sm group/btn"
        >
          <Eye size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
          View Project
        </button>
      </div>
    </div>
  );
};

const ClientProjects: React.FC<ClientProjectsProps> = ({ projects, setActiveView }) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'All'>('All');

  // Get unique statuses
  const statuses: (ProjectStatus | 'All')[] = ['All', ...new Set(projects.map(p => p.status)) as any];

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') {
      return projects;
    }
    return projects.filter(p => p.status === activeFilter);
  }, [projects, activeFilter]);

  // Stats
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    inReview: projects.filter(p => p.status === 'In Review').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-3">
          Design Projects
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          View all your design projects and provide feedback to your designer
        </p>
      </div>

      {/* Stats Cards */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border dark:border-dark-border">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">Total Projects</p>
            <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1">{stats.total}</p>
          </div>
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border dark:border-dark-border">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border dark:border-dark-border">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">In Review</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.inReview}</p>
          </div>
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border dark:border-dark-border">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
          <Filter size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
          <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === status
                    ? 'bg-brand-accent text-white shadow-lg'
                    : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={(projectId) => router.push(`/client-portal/projects/${projectId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
              <div className="mb-4">
                <div className="inline-block p-4 rounded-full bg-light-bg dark:bg-dark-bg">
                  <CheckCircle size={32} className="text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                No Projects with Status "{activeFilter}"
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Try selecting a different filter to view other projects
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
          <div className="mb-4">
            <div className="inline-block p-4 rounded-full bg-light-bg dark:bg-dark-bg">
              <Eye size={32} className="text-light-text-secondary dark:text-dark-text-secondary" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
            No Projects Yet
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            You don't have any projects assigned yet. Ask your designer to invite you to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientProjects;