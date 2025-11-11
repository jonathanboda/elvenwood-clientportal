export type Portal = 'client' | 'designer';

export type View = 'dashboard' | 'projects' | 'feedback' | 'profile' | string; // string for project IDs

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Client' | 'Designer';
  avatarUrl: string; // Corresponds to avatar_url
  company?: string;
}

// Represents a client that has been invited but has not yet signed up.
export interface InvitedClient {
    name: string;
    email: string;
    isPlaceholder: true; // Used as a type guard
}

// Simplified Client type for dropdowns, etc.
export interface Client {
    id: string;
    name: string;
    company?: string;
}

export type ProjectStatus = 'In Progress' | 'In Review' | 'Awaiting Approval' | 'Completed';

export interface Project {
  id:string;
  name: string;
  description: string;
  client: User | InvitedClient; // Client can be a full user or a placeholder
  designer: User;
  status: ProjectStatus;
  thumbnailUrl: string; // Corresponds to thumbnail_url
  versions: DesignVersion[];
  startDate?: string; // Corresponds to start_date
  endDate?: string; // Corresponds to end_date
}

export interface DesignVersion {
  id: string;
  versionNumber: number; // Corresponds to version_number
  fileUrl: string; // Corresponds to file_url
  submittedDate: string; // Corresponds to submitted_date
  changelog: string[];
  comments: Comment[];
  isAccepted: boolean; // Corresponds to is_accepted
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  imageUrl?: string; // Corresponds to image_url
  replies: Reply[];
}

export interface Reply {
    id: string;
    user: User;
    text: string;
    timestamp: string;
}

export interface Notification {
  id: string;
  text: string;
  date: string;
  isRead: boolean; // Corresponds to is_read
}

export interface Activity {
  id: string;
  user: User;
  type: 'comment' | 'upload' | 'acceptance';
  project: { id: string, name: string };
  versionId: string; // ID of the design version this activity relates to
  timestamp: string;
  postText?: string; // Corresponds to post_text
  commentText?: string; // Corresponds to comment_text
  imageUrl?: string; // Corresponds to image_url
}

export interface Invite {
    id: string;
    email: string;
    name: string;
    projectId: string;
    status: 'pending' | 'accepted';
}