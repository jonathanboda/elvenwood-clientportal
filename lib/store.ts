import { create } from 'zustand';

// User Store
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'designer' | 'client';
  avatar_url?: string;
  company_name?: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));

// Projects Store
export interface Project {
  id: string;
  project_name: string;
  description?: string;
  designer_id: string;
  client_id?: string;
  client_email?: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ProjectsStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  openSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  closeSnackbar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  openSnackbar: (message, severity = 'info') =>
    set({
      snackbar: {
        open: true,
        message,
        severity,
      },
    }),
  closeSnackbar: () =>
    set((state) => ({
      snackbar: {
        ...state.snackbar,
        open: false,
      },
    })),
}));

// Versions Store
export interface Version {
  id: string;
  project_id: string;
  version_number: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  changelog?: string;
  uploaded_by?: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved';
  created_at: string;
  updated_at: string;
}

interface VersionsStore {
  versions: Version[];
  setVersions: (versions: Version[]) => void;
  addVersion: (version: Version) => void;
  updateVersion: (id: string, updates: Partial<Version>) => void;
  deleteVersion: (id: string) => void;
}

export const useVersionsStore = create<VersionsStore>((set) => ({
  versions: [],
  setVersions: (versions) => set({ versions }),
  addVersion: (version) =>
    set((state) => ({ versions: [version, ...state.versions] })),
  updateVersion: (id, updates) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),
  deleteVersion: (id) =>
    set((state) => ({
      versions: state.versions.filter((v) => v.id !== id),
    })),
}));

// Comments Store
export interface Comment {
  id: string;
  version_id: string;
  project_id: string;
  author_id: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file';
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

interface CommentsStore {
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
}

export const useCommentsStore = create<CommentsStore>((set) => ({
  comments: [],
  setComments: (comments) => set({ comments }),
  addComment: (comment) =>
    set((state) => ({ comments: [comment, ...state.comments] })),
  updateComment: (id, updates) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    })),
}));
