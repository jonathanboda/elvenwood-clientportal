import React from 'react';
import { Project, View, ProjectStatus } from '../../types.ts';
import { Eye, User } from 'lucide-react';

interface DesignerProjectsProps {
  projects: Project[];
  setActiveView: (view: View) => void;
}

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const baseClasses = 'text-xs font-medium px-2.5 py-1 rounded-md';
  let colorClasses = '';

  switch (status) {
    case 'In Progress':
      colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      break;
    case 'In Review':
      colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      break;
    case 'Completed':
      colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      break;
    case 'Awaiting Approval':
        colorClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
        break;
    default:
      colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


const ProjectCard: React.FC<{ project: Project; onClick: () => void; }> = ({ project, onClick }) => {
    return (
        <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
            <img src={project.thumbnailUrl} alt={project.name} className="w-full h-48 object-cover" />
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text pr-2">{project.name}</h3>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 flex-grow">{project.description}</p>
                <div className="border-t border-light-border dark:border-dark-border pt-4 mt-auto">
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">CLIENT</p>
                    <div className="flex items-center gap-2">
                        {/* FIX: Use direct type guard to correctly narrow the type of project.client within JSX. */}
                        {'isPlaceholder' in project.client ? (
                            <div className="h-8 w-8 rounded-full bg-light-bg-secondary dark:bg-dark-bg flex items-center justify-center">
                                <User size={16} className="text-light-text-secondary dark:text-dark-text-secondary"/>
                            </div>
                        ) : (
                            <img src={project.client.avatarUrl} alt={project.client.name} className="h-8 w-8 rounded-full" />
                        )}
                        <span className="text-sm font-medium">{project.client.name} {'isPlaceholder' in project.client && <span className="text-xs text-light-text-secondary">(Invited)</span>}</span>
                    </div>
                     <button 
                        onClick={onClick}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-brand-accent text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
                    >
                        <Eye size={16} /> View Project
                    </button>
                </div>
            </div>
        </div>
    );
}

const DesignerProjects: React.FC<DesignerProjectsProps> = ({ projects, setActiveView }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-8">All Projects</h1>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onClick={() => setActiveView(project.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
          <h2 className="text-xl font-semibold">No Projects Found</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">You haven't been assigned to any projects yet.</p>
        </div>
      )}
    </div>
  );
};

export default DesignerProjects;