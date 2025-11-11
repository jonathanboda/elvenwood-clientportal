/**
 * Enhanced Mock Data for Testing
 *
 * This file provides comprehensive mock data for testing the enhanced
 * Activity Feed, Notifications, and Design Viewer components.
 */

import { Activity, Notification, User, Project, DesignVersion, Comment } from '@/types';

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers = {
  client1: {
    id: 'client-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Client',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    company: 'Johnson Interiors',
  } as User,

  client2: {
    id: 'client-2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'Client',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    company: 'Chen Design Group',
  } as User,

  designer1: {
    id: 'designer-1',
    name: 'Emma Williams',
    email: 'emma.williams@example.com',
    role: 'Designer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  } as User,

  designer2: {
    id: 'designer-2',
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@example.com',
    role: 'Designer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  } as User,
};

// ============================================================================
// MOCK PROJECTS
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Modern Living Room Redesign',
    description: 'Complete living room interior design with focus on contemporary aesthetics and functionality.',
    client: mockUsers.client1,
    designer: mockUsers.designer1,
    status: 'In Progress',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    versions: [],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-2',
    name: 'Kitchen Renovation Project',
    description: 'Full kitchen renovation with modern appliances and custom cabinetry.',
    client: mockUsers.client1,
    designer: mockUsers.designer2,
    status: 'In Review',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    versions: [],
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-3',
    name: 'Bedroom Makeover',
    description: 'Cozy bedroom design with emphasis on comfort and relaxation.',
    client: mockUsers.client2,
    designer: mockUsers.designer1,
    status: 'Completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    versions: [],
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-4',
    name: 'Home Office Setup',
    description: 'Professional home office design with ergonomic furniture and modern workspace.',
    client: mockUsers.client2,
    designer: mockUsers.designer2,
    status: 'In Progress',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    versions: [],
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// MOCK DESIGN VERSIONS
// ============================================================================

export const mockDesignVersions: DesignVersion[] = [
  {
    id: 'version-1-1',
    versionNumber: 1,
    fileUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    changelog: [
      'Initial concept with modern color palette',
      'Added contemporary furniture suggestions',
      'Included lighting design',
      '3D renderings of layout options',
    ],
    comments: [],
    isAccepted: false,
  },
  {
    id: 'version-1-2',
    versionNumber: 2,
    fileUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    changelog: [
      'Updated color scheme based on client feedback',
      'Adjusted furniture placement for better flow',
      'Enhanced lighting solutions',
      'Added window treatment designs',
      'Material samples included',
    ],
    comments: [],
    isAccepted: false,
  },
  {
    id: 'version-1-3',
    versionNumber: 3,
    fileUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    changelog: [
      'Final adjustments to accent colors',
      'Added detailed budget breakdown',
      'Timeline for implementation',
      'Vendor contact information',
    ],
    comments: [],
    isAccepted: false,
  },
];

// ============================================================================
// MOCK COMMENTS
// ============================================================================

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    user: mockUsers.client1,
    text: 'Love the color palette! Very close to what I envisioned. Just need to adjust the sofa size a bit.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: undefined,
    replies: [
      {
        id: 'reply-1-1',
        user: mockUsers.designer1,
        text: 'Perfect! I can adjust the sofa dimensions. Would you prefer a 3-seater or a sectional?',
        timestamp: new Date(Date.now() - 3.8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'reply-1-2',
        user: mockUsers.client1,
        text: 'A sectional would be better for our space. Thanks!',
        timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'comment-2',
    user: mockUsers.designer1,
    text: 'I have updated the floor plan with the new sectional arrangement and better traffic flow.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: undefined,
    replies: [],
  },
  {
    id: 'comment-3',
    user: mockUsers.client1,
    text: 'The new version looks fantastic! Just one more question about the storage solution under the TV.',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
    replies: [
      {
        id: 'reply-3-1',
        user: mockUsers.designer1,
        text: 'Great question! I\'ve included floating shelves for flexibility and a built-in cabinet below. You can choose between open or closed storage.',
        timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

// ============================================================================
// MOCK ACTIVITY FEED
// ============================================================================

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    user: mockUsers.designer1,
    type: 'upload',
    project: {
      id: mockProjects[0].id,
      name: mockProjects[0].name,
    },
    versionId: 'version-1-3',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Uploaded Version 3 - Final design with all your feedback incorporated',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'activity-2',
    user: mockUsers.client1,
    type: 'comment',
    project: {
      id: mockProjects[0].id,
      name: mockProjects[0].name,
    },
    versionId: 'version-1-3',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Added feedback on the latest design version',
    commentText: 'The new version looks fantastic! Just one more question about the storage solution under the TV.',
  },
  {
    id: 'activity-3',
    user: mockUsers.designer2,
    type: 'upload',
    project: {
      id: mockProjects[1].id,
      name: mockProjects[1].name,
    },
    versionId: 'version-2-1',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Initial kitchen concept with modern appliances and custom cabinetry',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'activity-4',
    user: mockUsers.designer1,
    type: 'upload',
    project: {
      id: mockProjects[2].id,
      name: mockProjects[2].name,
    },
    versionId: 'version-3-1',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Final bedroom design - cozy and relaxing',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'activity-5',
    user: mockUsers.client2,
    type: 'comment',
    project: {
      id: mockProjects[2].id,
      name: mockProjects[2].name,
    },
    versionId: 'version-3-1',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Approved the bedroom design',
    commentText: 'Perfect! This is exactly what we wanted. Beautiful work!',
  },
  {
    id: 'activity-6',
    user: mockUsers.designer2,
    type: 'upload',
    project: {
      id: mockProjects[3].id,
      name: mockProjects[3].name,
    },
    versionId: 'version-4-1',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    postText: 'Home office setup with ergonomic furniture',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
];

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    text: 'Designer uploaded a new design version',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    text: 'Comment added to your design',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-3',
    text: 'Design has been accepted',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-4',
    text: 'New version v2 is ready for review',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'notif-5',
    text: 'Project status updated to In Review',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'notif-6',
    text: 'Client comment on version 1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'notif-7',
    text: 'Project deadline approaching - 14 days left',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get mock project with populated versions and comments
 */
export function getProjectWithVersions(projectId: string): Project {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) return mockProjects[0];

  return {
    ...project,
    versions: mockDesignVersions.map(v => ({
      ...v,
      comments: mockComments,
    })),
  };
}

/**
 * Get client's activity feed
 */
export function getClientActivityFeed(clientId: string): Activity[] {
  return mockActivities.filter(a => {
    const project = mockProjects.find(p => p.id === a.project.id);
    if (!project) return false;
    const clientMatches = 'id' in project.client && project.client.id === clientId;
    return clientMatches || project.designer.id === clientId;
  });
}

/**
 * Get designer's recent projects
 */
export function getDesignerProjects(designerId: string): Project[] {
  return mockProjects.filter(p => p.designer.id === designerId);
}

/**
 * Get client's projects
 */
export function getClientProjects(clientId: string): Project[] {
  return mockProjects.filter(p => 'id' in p.client && p.client.id === clientId);
}

/**
 * Update notification read status
 */
export function updateNotificationReadStatus(
  notificationId: string,
  isRead: boolean
): void {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = isRead;
  }
}

/**
 * Add new comment to a version
 */
export function addCommentToVersion(
  versionId: string,
  comment: Omit<Comment, 'id'>
): Comment {
  const newComment: Comment = {
    ...comment,
    id: `comment-${Date.now()}`,
  };

  const version = mockDesignVersions.find(v => v.id === versionId);
  if (version) {
    version.comments.push(newComment);
  }

  return newComment;
}

/**
 * Add new activity
 */
export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const newActivity: Activity = {
    ...activity,
    id: `activity-${Date.now()}`,
  };

  mockActivities.unshift(newActivity);
  return newActivity;
}

/**
 * Export all mock data
 */
export const allMockData = {
  users: mockUsers,
  projects: mockProjects,
  versions: mockDesignVersions,
  comments: mockComments,
  activities: mockActivities,
  notifications: mockNotifications,
};
