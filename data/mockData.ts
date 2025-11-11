// FIX: Removed erroneous file marker from the top of the file.
// FIX: Corrected import path for types.ts from data directory.
import { User, Project, Notification, Activity } from '../types.ts';

// USERS
export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  role: 'Client',
  avatarUrl: 'https://i.pravatar.cc/150?u=alexjohnson',
  company: 'Innovate Corp.',
};

export const mockDesigner: User = {
  id: 'user-2',
  name: 'Samantha Ray',
  email: 's.ray@elvenwood.co',
  role: 'Designer',
  avatarUrl: 'https://i.pravatar.cc/150?u=samantharay',
  company: 'Elvenwood Design',
};

export const mockClients: User[] = [
    mockUser,
    {
        id: 'user-3',
        name: 'Michael Chen',
        email: 'm.chen@techsolutions.com',
        role: 'Client',
        avatarUrl: 'https://i.pravatar.cc/150?u=michaelchen',
        company: 'Tech Solutions',
    },
    {
        id: 'user-4',
        name: 'Jessica Williams',
        email: 'jess.w@marketgrow.io',
        role: 'Client',
        avatarUrl: 'https://i.pravatar.cc/150?u=jessicawilliams',
        company: 'MarketGrow',
    }
];

// PROJECTS
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Modern Kitchen Remodel',
    description: 'A complete overhaul of a residential kitchen to create a modern, open-concept space with high-end appliances.',
    client: mockUser,
    designer: mockDesigner,
    status: 'In Review',
    thumbnailUrl: 'https://picsum.photos/seed/proj-1/400/300',
    versions: [
      {
        id: 'v1-1',
        versionNumber: 1,
        fileUrl: 'https://picsum.photos/seed/v1-1/1200/800',
        submittedDate: '2023-10-20T10:00:00Z',
        changelog: ['Initial design concept', '3D renders of the layout'],
        isAccepted: false,
        comments: [
            {
                id: 'c1-1',
                user: mockUser,
                text: 'Looks great overall! Can we explore a different backsplash tile?',
                timestamp: '3 days ago',
                replies: [
                    {
                        id: 'r1-1',
                        user: mockDesigner,
                        text: 'Absolutely, I will provide some alternatives in the next version.',
                        timestamp: '2 days ago'
                    }
                ]
            }
        ],
      },
    ],
  },
  {
    id: 'proj-2',
    name: 'Downtown Office Space',
    description: 'Design a collaborative and vibrant office space for a tech startup, focusing on modular furniture and natural light.',
    client: mockClients[1],
    designer: mockDesigner,
    status: 'Completed',
    thumbnailUrl: 'https://picsum.photos/seed/proj-2/400/300',
    versions: [
        {
            id: 'v2-1',
            versionNumber: 1,
            fileUrl: 'https://picsum.photos/seed/v2-1/1200/800',
            submittedDate: '2023-09-15T14:30:00Z',
            changelog: ['Initial floor plan', 'Mood board for color palette'],
            isAccepted: false,
            comments: [],
        },
        {
            id: 'v2-2',
            versionNumber: 2,
            fileUrl: 'https://picsum.photos/seed/v2-2/1200/800',
            submittedDate: '2023-09-25T11:00:00Z',
            changelog: ['Updated floor plan with client feedback', 'Added furniture selection'],
            isAccepted: true,
            comments: [],
        },
    ],
  },
  {
    id: 'proj-3',
    name: 'Luxury Hotel Lobby',
    description: 'A design proposal for a 5-star hotel lobby, featuring a grand staircase, custom lighting, and a water feature.',
    client: mockClients[2],
    designer: mockDesigner,
    status: 'In Progress',
    thumbnailUrl: 'https://picsum.photos/seed/proj-3/400/300',
    versions: [],
  },
];


// NOTIFICATIONS
export const mockNotifications: Notification[] = [
    { id: 'notif-1', text: 'Samantha Ray uploaded a new version for Modern Kitchen Remodel.', date: '2023-10-20T10:00:00Z', isRead: false },
    { id: 'notif-2', text: 'Your design for Downtown Office Space was approved.', date: '2023-09-25T11:05:00Z', isRead: false },
    { id: 'notif-3', text: 'Michael Chen left a comment on Downtown Office Space.', date: '2023-09-24T18:00:00Z', isRead: true },
];

// ACTIVITY FEED
export const mockActivityFeed: Activity[] = [
    {
        id: 'act-1',
        user: mockDesigner,
        type: 'upload',
        project: { id: 'proj-1', name: 'Modern Kitchen Remodel' },
        versionId: 'version-1-2',
        timestamp: '2 hours ago',
        postText: 'Hey @Alex Johnson, I\'ve uploaded the revised kitchen design with the new backsplash options you requested. I\'ve included 3 different tile patterns that match the modern aesthetic. Let me know your thoughts!',
        imageUrl: 'https://picsum.photos/seed/v1-2/1200/800',
    },
    {
        id: 'act-2',
        user: mockUser,
        type: 'comment',
        project: { id: 'proj-1', name: 'Modern Kitchen Remodel' },
        versionId: 'version-1-2',
        timestamp: '1 hour ago',
        commentText: 'The middle tile option looks perfect! Can we also explore the lighting fixtures around the island?',
    },
    {
        id: 'act-3',
        user: mockDesigner,
        type: 'upload',
        project: { id: 'proj-3', name: 'Luxury Hotel Lobby' },
        versionId: 'version-3-1',
        timestamp: '6 hours ago',
        postText: 'Initial concept sketches for the Luxury Hotel Lobby project are ready for review. This version includes the grand staircase design and preliminary lighting layouts. Looking forward to your feedback!',
        imageUrl: 'https://picsum.photos/seed/v3-1/1200/800',
    },
    {
        id: 'act-4',
        user: mockClients[1],
        type: 'comment',
        project: { id: 'proj-2', name: 'Downtown Office Space' },
        versionId: 'version-2-1',
        timestamp: '1 day ago',
        commentText: 'We love the collaborative workspace layout! This is exactly what we envisioned for our team.',
    },
    {
        id: 'act-5',
        user: mockDesigner,
        type: 'acceptance',
        project: { id: 'proj-2', name: 'Downtown Office Space' },
        versionId: 'version-2-1',
        timestamp: '1 day ago',
        postText: 'Great news! Your design has been officially accepted and approved for implementation. We\'re excited to move forward with the Downtown Office Space project!',
        imageUrl: 'https://picsum.photos/seed/v2-2/1200/800',
    },
    {
        id: 'act-6',
        user: mockDesigner,
        type: 'upload',
        project: { id: 'proj-1', name: 'Modern Kitchen Remodel' },
        versionId: 'version-1-1',
        timestamp: '3 days ago',
        postText: 'First design iteration is ready! This includes the initial layout concept, 3D renderings, and appliance selections. Please review and share your initial thoughts.',
        imageUrl: 'https://picsum.photos/seed/v1-1/1200/800',
    }
];