import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Client } from '../../types.ts';

interface NewProjectModalProps {
  onClose: () => void;
  onConfirm: (projectData: { name: string; brief: string; clientId: string; invitedClient?: { name: string, email: string } }) => void;
  clients: Client[];
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onConfirm, clients }) => {
  const [projectName, setProjectName] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'invite-new');
  
  const [invitedClientName, setInvitedClientName] = useState('');
  const [invitedClientEmail, setInvitedClientEmail] = useState('');

  const isInvitingNewClient = selectedClientId === 'invite-new';

  const handleConfirm = () => {
    if (isInvitingNewClient) {
        if (!projectName.trim() || !projectBrief.trim() || !invitedClientName.trim() || !invitedClientEmail.trim()) {
            alert('Please fill out all fields for the new project and client.');
            return;
        }
        onConfirm({
            name: projectName,
            brief: projectBrief,
            clientId: 'invite-new',
            invitedClient: { name: invitedClientName, email: invitedClientEmail }
        });
    } else {
        if (!projectName.trim() || !projectBrief.trim() || !selectedClientId) {
            alert('Please fill out all fields.');
            return;
        }
        onConfirm({
            name: projectName,
            brief: projectBrief,
            clientId: selectedClientId,
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors">
          <X size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-light/80 dark:bg-brand-dark/30 p-2 rounded-lg">
                <FolderPlus className="h-6 w-6 text-brand-accent" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Create New Project</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Enter the details for the new project.</p>
            </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Downtown Loft Redesign"
              className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Assign Client</label>
            <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border focus:ring-brand-accent focus:border-brand-accent"
            >
                <option value="invite-new">-- Invite New Client --</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name} - {client.company}</option>
                ))}
            </select>
          </div>
          
          {isInvitingNewClient && (
            <div className="p-4 bg-brand-light/50 dark:bg-brand-dark/20 rounded-lg space-y-3 border border-brand-accent/20">
                 <h4 className="text-sm font-semibold text-brand-accent">New Client Details</h4>
                 <div>
                    <label htmlFor="new-client-name" className="block text-xs font-medium text-light-text dark:text-dark-text mb-1">Full Name</label>
                    <input id="new-client-name" type="text" value={invitedClientName} onChange={(e) => setInvitedClientName(e.target.value)} placeholder="e.g., Jane Doe" className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border text-sm"/>
                 </div>
                 <div>
                    <label htmlFor="new-client-email" className="block text-xs font-medium text-light-text dark:text-dark-text mb-1">Email</label>
                    <input id="new-client-email" type="email" value={invitedClientEmail} onChange={(e) => setInvitedClientEmail(e.target.value)} placeholder="e.g., jane@example.com" className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border text-sm"/>
                 </div>
            </div>
          )}

          <div>
            <label htmlFor="project-brief" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Project Brief</label>
            <textarea
              id="project-brief"
              rows={5}
              value={projectBrief}
              onChange={(e) => setProjectBrief(e.target.value)}
              placeholder="Provide a detailed brief for the project..."
              className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-brand-accent text-white hover:opacity-90 font-medium transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;