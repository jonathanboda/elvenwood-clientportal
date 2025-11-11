import React, { useState } from 'react';
import { Project, User as UserType, View, DesignVersion } from '../../types.ts';
import DesignViewer from '../common/DesignViewer.tsx';
import UploadVersionModal from './UploadVersionModal.tsx';
import { ArrowLeft, Upload, CheckCircle, User } from 'lucide-react';

interface DesignerProjectDetailProps {
  project: Project;
  user: UserType;
  setActiveView: (view: View) => void;
  onUploadVersion: (projectId: string, changelog: string[], fileUrl: string) => void;
}

const DesignerProjectDetail: React.FC<DesignerProjectDetailProps> = ({ project, user, setActiveView, onUploadVersion }) => {
  const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const isInvitedClient = 'isPlaceholder' in project.client;

  const handleUploadConfirm = (changelog: string[], fileUrl: string) => {
    onUploadVersion(project.id, changelog, fileUrl);
    setIsUploading(false);
  };

  if (selectedVersion) {
    if (isInvitedClient) {
        // Comments are disabled for invited clients. A real app might handle this differently.
        alert("Cannot view version details for an invited client until they sign up.");
        return null;
    }
    return <DesignViewer project={project} user={user} version={selectedVersion} onBack={() => setSelectedVersion(null)} />;
  }
  
  const sortedVersions = [...project.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersionNumber = sortedVersions.length > 0 ? sortedVersions[0].versionNumber : 0;
  const isProjectCompleted = project.status === 'Completed';

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
        <div className="flex flex-col md:flex-row justify-between md:items-start mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{project.name}</h1>
              <span className={`mt-2 inline-block ${getStatusChip(project.status)}`}>{project.status}</span>
            </div>
            {!isProjectCompleted && (
                <button
                    onClick={() => setIsUploading(true)}
                    className="flex-shrink-0 flex items-center gap-2 bg-brand-accent text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Upload size={18} /> Upload New Version
                </button>
            )}
        </div>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-4xl">{project.description}</p>
        
        <div className="pt-6 border-t border-light-border dark:border-dark-border">
          <h3 className="text-base font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Client</h3>
          <div className="flex items-center gap-3">
            {/* FIX: Replaced variable with direct check to ensure TypeScript correctly narrows the type for `avatarUrl`. */}
            {'isPlaceholder' in project.client ? (
                <div className="h-10 w-10 rounded-full bg-light-bg-secondary dark:bg-dark-bg flex items-center justify-center">
                    <User size={20} className="text-light-text-secondary dark:text-dark-text-secondary"/>
                </div>
            ) : (
                <img src={project.client.avatarUrl} alt={project.client.name} className="h-10 w-10 rounded-full"/>
            )}
            <div>
              <p className="font-semibold text-light-text dark:text-dark-text">{project.client.name} {isInvitedClient && <span className="text-xs font-normal text-light-text-secondary">(Invited)</span>}</p>
              {/* FIX: Replaced variable with direct check to ensure TypeScript correctly narrows the type for `company`. */}
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{'isPlaceholder' in project.client ? project.client.email : project.client.company}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md">
        <div className="p-6 border-b border-light-border dark:border-dark-border">
            <h2 className="text-2xl font-semibold">Design Versions</h2>
        </div>
        <ul className="divide-y divide-light-border dark:divide-dark-border">
            {sortedVersions.map(version => (
                <li key={version.id} className="px-6 py-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                   <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-light-text dark:text-dark-text">Version {version.versionNumber}</h3>
                            {version.isAccepted && <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle size={14}/> Approved</span>}
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Uploaded: {new Date(version.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                   </div>
                   <button 
                        onClick={() => setSelectedVersion(version)} 
                        disabled={isInvitedClient}
                        className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border font-medium text-sm transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        View & Comment
                   </button>
                </li>
            ))}
             {sortedVersions.length === 0 && <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-8">No versions have been uploaded yet.</p>}
        </ul>
      </div>

      {isUploading && (
        <UploadVersionModal 
            latestVersionNumber={latestVersionNumber}
            onClose={() => setIsUploading(false)}
            onConfirm={handleUploadConfirm}
        />
      )}
    </div>
  );
};

export default DesignerProjectDetail;