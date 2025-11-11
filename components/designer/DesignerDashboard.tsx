import React, { useState } from 'react';
import { Project, User, View, Comment as CommentType, Client, Invite } from '../../types.ts';
import { Briefcase, CheckCircle, Clock, FolderPlus, MessageSquare, Send } from 'lucide-react';
import NewProjectModal from './NewProjectModal.tsx';

interface DesignerDashboardProps {
  projects: Project[];
  user: User;
  clients: Client[];
  invites: Invite[];
  setActiveView: (view: View) => void;
  onCreateProject: (projectData: { name: string; brief: string; clientId: string; invitedClient?: {name: string, email: string} }) => void;
  onAcceptInvite: (inviteId: string) => void;
}

interface EnrichedComment extends CommentType {
    projectName: string;
    projectId: string;
}

const StatCard: React.FC<{ label: string, value: number, icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="bg-light-bg dark:bg-dark-bg-secondary p-5 rounded-lg shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-full bg-brand-light dark:bg-brand-dark/50">
            <Icon className="h-6 w-6 text-brand-accent" />
        </div>
        <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
        </div>
    </div>
);

const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ projects, user, clients, invites, setActiveView, onCreateProject, onAcceptInvite }) => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const stats = {
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    inReview: projects.filter(p => p.status === 'In Review' || p.status === 'Awaiting Approval').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  };
  
    const allComments: EnrichedComment[] = projects.reduce((acc, project) => {
        project.versions.forEach(version => {
            version.comments.forEach(comment => {
                acc.push({ ...comment, projectName: project.name, projectId: project.id });
            });
        });
        return acc;
    }, [] as EnrichedComment[]).slice(0, 4); 

  return (
    <div>
        <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Here's what's happening with your projects today.</p>
            </div>
            <button onClick={() => setShowNewProjectModal(true)} className="flex items-center justify-center gap-2 bg-brand-accent text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm">
                <FolderPlus size={18} /> Create New Project
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="In Progress" value={stats.inProgress} icon={Clock} />
            <StatCard label="In Review" value={stats.inReview} icon={Briefcase} />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Feedback */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MessageSquare size={20}/> Recent Feedback</h2>
                <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-sm">
                    {allComments.length > 0 ? (
                        <ul className="divide-y divide-light-border dark:divide-dark-border">
                            {allComments.map(comment => (
                                <li key={comment.id} className="p-4 flex items-start gap-3 hover:bg-light-bg-secondary/50 dark:hover:bg-dark-bg/50">
                                    <img src={comment.user.avatarUrl} alt={comment.user.name} className="h-9 w-9 rounded-full mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold">{comment.user.name}</span> commented on <span className="font-semibold">{comment.projectName}</span>
                                        </p>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 italic">"{comment.text}"</p>
                                        <button onClick={() => setActiveView(comment.projectId)} className="mt-2 text-xs font-bold text-brand-accent hover:underline">
                                            VIEW PROJECT
                                        </button>
                                    </div>
                                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">{comment.timestamp}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            <p>No recent feedback from clients.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Pending Invites */}
            <div>
                 <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Send size={20}/> Pending Invites</h2>
                <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-sm">
                     {invites.length > 0 ? (
                        <ul className="divide-y divide-light-border dark:divide-dark-border">
                            {invites.map(invite => (
                                <li key={invite.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{invite.name}</p>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{invite.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => onAcceptInvite(invite.id)}
                                        className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                    >
                                        Simulate Accept Invite
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="p-8 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            <p>No pending client invitations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>


        {showNewProjectModal && (
            <NewProjectModal 
                clients={clients}
                onClose={() => setShowNewProjectModal(false)}
                onConfirm={(data) => {
                    onCreateProject(data);
                    setShowNewProjectModal(false);
                }}
            />
        )}
    </div>
  );
};

export default DesignerDashboard;