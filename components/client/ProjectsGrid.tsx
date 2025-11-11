import React from 'react';
import { Project, View } from '../../types';
import { Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProjectsGridProps {
  projects: Project[];
  onSelectProject: (view: View) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle size={20} className="text-green-500" />;
    case 'In Review':
      return <AlertCircle size={20} className="text-orange-500" />;
    case 'In Progress':
      return <Clock size={20} className="text-blue-500" />;
    case 'Awaiting Approval':
      return <AlertCircle size={20} className="text-yellow-500" />;
    default:
      return <Clock size={20} className="text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'In Review':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'In Progress':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'Awaiting Approval':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No date set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProjectCard: React.FC<{
  project: Project;
  onSelectProject: (view: View) => void;
}> = ({ project, onSelectProject }) => {
  const isCompleted = project.status === 'Completed';

  return (
    <div
      onClick={() => onSelectProject(project.id as View)}
      className="group bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md border border-light-border dark:border-dark-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span>{project.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2 group-hover:text-brand-accent transition-colors">
          {project.name}
        </h3>

        {/* Designer Info */}
        <div className="flex items-center gap-2 mb-4">
          <img
            src={project.designer.avatarUrl}
            alt={project.designer.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Designed by
            </p>
            <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">
              {project.designer.name}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="flex-shrink-0" />
            <span>Start: {formatDate(project.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="flex-shrink-0" />
            <span>End: {formatDate(project.endDate)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Design Versions Info */}
        {project.versions && project.versions.length > 0 && (
          <div className="mb-4 p-3 bg-light-bg-secondary dark:bg-dark-bg/50 rounded">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text mb-1">
              Versions: {project.versions.length}
            </p>
            <div className="flex gap-2 flex-wrap">
              {project.versions.slice(0, 3).map((version) => (
                <span
                  key={version.id}
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    version.isAccepted
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  v{version.versionNumber} {version.isAccepted && '✓'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProject(project.id as View);
          }}
          className="w-full bg-gradient-to-r from-brand-accent to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all text-center group-hover:scale-105 duration-200"
        >
          View Project
        </button>
      </div>
    </div>
  );
};

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, onSelectProject }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
        <AlertCircle size={48} className="mx-auto mb-4 text-light-text-secondary dark:text-dark-text-secondary" />
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
          No Projects Yet
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Your assigned projects will appear here. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelectProject={onSelectProject}
        />
      ))}
    </div>
  );
};

export default ProjectsGrid;
