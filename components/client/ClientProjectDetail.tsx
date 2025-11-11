import React, { useState } from 'react';
import { Project, User, View, DesignVersion } from '../../types.ts';
import DesignViewer from '../common/DesignViewer.tsx';
import AcceptDesignModal from '../common/AcceptDesignModal.tsx';
import { ArrowLeft } from 'lucide-react';

interface ClientProjectDetailProps {
  project: Project;
  user: User;
  setActiveView: (view: View) => void;
  onAcceptDesign: (projectId: string, versionId: string, note?: string) => void;
}

const ClientProjectDetail: React.FC<ClientProjectDetailProps> = ({ project, user, setActiveView, onAcceptDesign }) => {
  const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null);
  const [versionToAccept, setVersionToAccept] = useState<DesignVersion | null>(null);

  const handleAcceptConfirm = (note: string) => {
    if (versionToAccept) {
      onAcceptDesign(project.id, versionToAccept.id, note);
      setVersionToAccept(null);
    }
  };

  if (selectedVersion) {
    return <DesignViewer project={project} user={user} version={selectedVersion} onBack={() => setSelectedVersion(null)} />;
  }
  
  const sortedVersions = [...project.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersionNumber = sortedVersions.length > 0 ? sortedVersions[0].versionNumber : 0;
  const isProjectAccepted = sortedVersions.some(v => v.isAccepted);

  const getStatusChip = (status: string) => {
    const baseClasses = 'text-xs font-medium px-2.5 py-1 rounded-full';
    switch (status) {
      case 'In Review':
        return `bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ${baseClasses}`;
      case 'In Progress':
        return `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ${baseClasses}`;
      case 'Completed':
        return `bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ${baseClasses}`;
      default:
        return `bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ${baseClasses}`;
    }
  };
  
  return (
    <div>
       <button onClick={() => setActiveView('projects')} className="flex items-center gap-2 text-sm font-semibold text-brand-accent mb-4 hover:underline">
            <ArrowLeft size={16} />
            Back to All Projects
        </button>

      <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{project.name}</h1>
            <span className={getStatusChip(project.status)}>{project.status}</span>
        </div>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-4xl">{project.description}</p>
        
        <div className="pt-6 border-t border-light-border dark:border-dark-border">
          <h3 className="text-base font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Assigned Designer</h3>
          <div className="flex items-center gap-3">
            <img src={project.designer.avatarUrl} alt={project.designer.name} className="h-10 w-10 rounded-full"/>
            <div>
              <p className="font-semibold text-light-text dark:text-dark-text">{project.designer.name}</p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Lead Interior Designer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md">
        <div className="p-6 border-b border-light-border dark:border-dark-border">
            <h2 className="text-2xl font-semibold">Design Versions</h2>
        </div>
        <ul className="divide-y divide-light-border dark:divide-dark-border">
            {sortedVersions.map(version => {
                const canAccept = version.versionNumber === latestVersionNumber && !isProjectAccepted;
                return (
                    <li key={version.id} className="px-6 py-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                       <div className="flex-1">
                            <h3 className="font-semibold text-lg text-light-text dark:text-dark-text">Version {version.versionNumber}</h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                Uploaded: {new Date(version.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            <ul className="mt-3 space-y-1">
                                {version.changelog.map((change, index) => (
                                    <li key={index} className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{change}</li>
                                ))}
                            </ul>
                       </div>
                       <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => setSelectedVersion(version)} className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border font-medium text-sm transition-colors">
                                View Design
                            </button>
                            {version.isAccepted ? (
                                <span className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium text-sm">Accepted</span>
                            ) : (
                                <button
                                    onClick={() => setVersionToAccept(version)}
                                    disabled={!canAccept}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                        canAccept
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Accept Design
                                </button>
                            )}
                       </div>
                    </li>
                );
            })}
        </ul>
      </div>

      {versionToAccept && (
        <AcceptDesignModal 
            versionNumber={versionToAccept.versionNumber}
            onClose={() => setVersionToAccept(null)}
            onConfirm={handleAcceptConfirm}
        />
      )}
    </div>
  );
};

export default ClientProjectDetail;