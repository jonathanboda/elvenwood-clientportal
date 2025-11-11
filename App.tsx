import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout.tsx';
import ClientDashboard from './components/client/ClientDashboard.tsx';
import ClientProjects from './components/client/ClientProjects.tsx';
import DesignerDashboard from './components/designer/DesignerDashboard.tsx';
import DesignerProjects from './components/designer/DesignerProjects.tsx';
import UserProfile from './components/common/UserProfile.tsx';
import ClientProjectDetail from './components/client/ClientProjectDetail.tsx';
import DesignerProjectDetail from './components/designer/DesignerProjectDetail.tsx';
import { Portal, View, User, Project, DesignVersion, Client, Invite, InvitedClient } from './types.ts';
import DesignerFeedback from './components/designer/DesignerFeedback.tsx';
import { mockDesigner, mockProjects, mockClients } from './data/mockData.ts';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState<Portal>('designer');
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    // Simulate loading and setting a default user
    setUser(mockDesigner);
    setProjects(mockProjects);
    setPortal(mockDesigner.role === 'Client' ? 'client' : 'designer');
    setLoading(false);
  }, []);

  const handleSetPortal = (newPortal: Portal) => {
    setPortal(newPortal);
    setActiveView('dashboard');
  };
  
  const handleAcceptDesign = (projectId: string, versionId: string, note?: string) => {
    setProjects(prevProjects => {
      return prevProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'Completed',
            versions: p.versions.map(v => v.id === versionId ? { ...v, isAccepted: true } : v)
          };
        }
        return p;
      });
    });
    console.log(`Design accepted for project ${projectId}, version ${versionId} with note: "${note}"`);
  };

  const handleUploadVersion = (projectId: string, changelog: string[], fileUrl: string) => {
    setProjects(prevProjects => {
      return prevProjects.map(p => {
        if (p.id === projectId) {
          const latestVersion = p.versions.reduce((max, v) => v.versionNumber > max ? v.versionNumber : max, 0) || 0;
          const newVersion: DesignVersion = {
            id: `v-${p.id}-${latestVersion + 1}`,
            versionNumber: latestVersion + 1,
            fileUrl,
            changelog,
            submittedDate: new Date().toISOString(),
            comments: [],
            isAccepted: false,
          };
          return {
            ...p,
            status: 'In Review',
            versions: [...p.versions, newVersion],
          };
        }
        return p;
      });
    });
  };
  
  const handleCreateProject = (projectData: { name: string; brief: string; clientId: string; invitedClient?: { name: string, email: string }}) => {
     if (!user) return;

     const newProjectId = `proj-${Date.now()}`;
     let clientForProject: User | InvitedClient;

     if (projectData.invitedClient) {
        // This is a new, invited client
        clientForProject = {
            name: projectData.invitedClient.name,
            email: projectData.invitedClient.email,
            isPlaceholder: true,
        };
        const newInvite: Invite = {
            id: `invite-${Date.now()}`,
            email: projectData.invitedClient.email,
            name: projectData.invitedClient.name,
            projectId: newProjectId,
            status: 'pending'
        };
        setInvites(prev => [newInvite, ...prev]);

     } else {
        // This is an existing client
        const existingClient = clients.find(c => c.id === projectData.clientId);
        if (!existingClient) {
            console.error("Client not found for new project");
            return;
        }
        // Construct a full User object for the project
        clientForProject = {
            id: existingClient.id,
            name: existingClient.name,
            company: existingClient.company,
            role: 'Client',
            avatarUrl: `https://i.pravatar.cc/150?u=${existingClient.id}`,
            email: `${existingClient.name.toLowerCase().replace(' ', '.')}@example.com`,
        };
     }

     const newProject: Project = {
        id: newProjectId,
        name: projectData.name,
        description: projectData.brief,
        client: clientForProject,
        designer: user,
        status: 'In Progress',
        thumbnailUrl: `https://picsum.photos/seed/${newProjectId}/400/300`,
        versions: [],
     };

     setProjects(prevProjects => [newProject, ...prevProjects]);
     setActiveView('projects');
  };
  
  const handleAcceptInvite = (inviteId: string) => {
    const invite = invites.find(inv => inv.id === inviteId);
    if (!invite) return;

    // 1. Create a new canonical user for the client
    const newClientId = `user-${Date.now()}`;
    const newClientUser: User = {
        id: newClientId,
        name: invite.name,
        email: invite.email,
        role: 'Client',
        avatarUrl: `https://i.pravatar.cc/150?u=${newClientId}`,
        company: 'Newly Joined Inc.',
    };

    // 2. Add them to the main clients list
    setClients(prev => [...prev, newClientUser]);

    // 3. Update the project to use the new canonical user
    setProjects(prev => prev.map(p => {
        if (p.id === invite.projectId) {
            return { ...p, client: newClientUser };
        }
        return p;
    }));

    // 4. Mark the invite as used
    setInvites(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status: 'accepted' } : inv));
  };


  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-light-bg dark:bg-dark-bg">
            <Loader className="animate-spin text-brand-accent" size={48} />
        </div>
    )
  }

  const renderContent = () => {
    const projectDetailId = typeof activeView === 'string' && activeView.startsWith('proj-') ? activeView : null;

    if (projectDetailId) {
      const project = projects.find(p => p.id === projectDetailId);
      if (!project) return <div>Project not found</div>;

      if ('isPlaceholder' in project.client) {
         return <DesignerProjectDetail project={project} user={user} setActiveView={setActiveView} onUploadVersion={handleUploadVersion} />;
      }
      
      return portal === 'client'
        ? <ClientProjectDetail project={project} user={user} setActiveView={setActiveView} onAcceptDesign={handleAcceptDesign} />
        : <DesignerProjectDetail project={project} user={user} setActiveView={setActiveView} onUploadVersion={handleUploadVersion} />;
    }

    switch(activeView) {
      case 'dashboard':
        return portal === 'client' 
          ? <ClientDashboard projects={projects} user={user} setActiveView={setActiveView} /> 
          : <DesignerDashboard projects={projects} user={user} clients={clients} invites={invites.filter(i => i.status === 'pending')} onAcceptInvite={handleAcceptInvite} setActiveView={setActiveView} onCreateProject={handleCreateProject} />;
      case 'projects':
        return portal === 'client'
          ? <ClientProjects projects={projects} setActiveView={setActiveView} />
          : <DesignerProjects projects={projects} setActiveView={setActiveView} />;
      case 'feedback':
          return <DesignerFeedback projects={projects} setActiveView={setActiveView} />;
      case 'profile':
        return <UserProfile user={user} projects={projects} />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Layout
      portal={portal}
      setPortal={handleSetPortal}
      activeView={activeView}
      setActiveView={setActiveView}
      user={user}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;