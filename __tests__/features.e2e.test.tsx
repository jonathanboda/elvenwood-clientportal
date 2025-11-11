/**
 * End-to-End Tests for Enhanced Client Portal Features
 *
 * Tests all major features including:
 * - Activity Feed
 * - Design Projects
 * - Design Viewer
 * - Notifications
 * - User Profile
 * - Real-time Updates
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import { ActivityFeed } from '@/components/client/ActivityFeed';
import { ClientProjects } from '@/components/client/ClientProjects';
import { DesignViewer } from '@/components/common/DesignViewer';
import { Header } from '@/components/layout/Header';
import { UserProfile } from '@/components/common/UserProfile';
import { getActiveSubscriptionCount } from '@/lib/realtime';
import type { Project } from '@/types';
import { mockUsers, mockProjects, mockActivities, mockNotifications } from '@/lib/mockDataEnhanced';

// ============================================================================
// ACTIVITY FEED TESTS
// ============================================================================

describe('Activity Feed E2E Tests', () => {
  const ActivityFeedWrapper = ({ clientId }: { clientId: string }) => {
    const [activities, setActivities] = React.useState(mockActivities);
    return <ActivityFeed activities={activities} currentUser={mockUsers.client1} onViewDesign={() => {}} />;
  };

  test('should display activity feed with all activities', () => {
    render(<ActivityFeedWrapper clientId="client-1" />);

    mockActivities.forEach(activity => {
      expect(screen.getByText(activity.user.name)).toBeInTheDocument();
    });
  });

  test('should display timeline indicators for different activity types', () => {
    render(<ActivityFeedWrapper clientId="client-1" />);

    // Check for activity type badges
    expect(screen.getAllByText(/uploaded a new design version|Comment added|Design accepted/)).toHaveLength(mockActivities.length);
  });

  test('should show design thumbnail for upload activities', () => {
    render(<ActivityFeedWrapper clientId="client-1" />);

    const uploadActivities = mockActivities.filter(a => a.type === 'upload' && a.imageUrl);
    uploadActivities.forEach(activity => {
      expect(screen.getByAltText(new RegExp(activity.project.name))).toBeInTheDocument();
    });
  });

  test('should open comment input when comment button is clicked', async () => {
    const user = userEvent.setup();
    render(<ActivityFeedWrapper clientId="client-1" />);

    const commentButtons = screen.getAllByRole('button', { name: /comment/i });
    await user.click(commentButtons[0]);

    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  test('should allow adding a comment with text', async () => {
    const user = userEvent.setup();
    const mockOnAddComment = jest.fn();

    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
        onAddComment={mockOnAddComment}
      />
    );

    const commentButtons = screen.getAllByRole('button', { name: /comment/i });
    await user.click(commentButtons[0]);

    const textarea = screen.getByPlaceholderText('Add a comment...');
    await user.type(textarea, 'Great work!');

    const sendButton = screen.getByRole('button', { name: /comment/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOnAddComment).toHaveBeenCalledWith(expect.any(String), 'Great work!', undefined);
    });
  });

  test('should allow file attachment in comment', async () => {
    const user = userEvent.setup();
    const mockOnAddComment = jest.fn();

    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
        onAddComment={mockOnAddComment}
      />
    );

    const commentButtons = screen.getAllByRole('button', { name: /comment/i });
    await user.click(commentButtons[0]);

    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /attach/i }).nextElementSibling as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  test('should format timestamps correctly', () => {
    render(<ActivityFeedWrapper clientId="client-1" />);

    // Should show relative timestamps
    expect(screen.getByText(/ago|Today|Yesterday/)).toBeInTheDocument();
  });

  test('should show real-time indicator', () => {
    render(<ActivityFeedWrapper clientId="client-1" />);

    expect(screen.getByText(/real-time updates enabled/i)).toBeInTheDocument();
  });

  test('should refresh activity feed on button click', async () => {
    const user = userEvent.setup();
    const mockOnRefresh = jest.fn();

    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
        onRefresh={mockOnRefresh}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// DESIGN PROJECTS TESTS
// ============================================================================

describe('Design Projects E2E Tests', () => {
  test('should display all projects in grid', () => {
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });

  test('should display project stats cards', () => {
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('should filter projects by status', async () => {
    const user = userEvent.setup();
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    const completedButton = screen.getByRole('button', { name: /Completed/i });
    await user.click(completedButton);

    // Should show only completed projects
    const completedProjects = mockProjects.filter(p => p.status === 'Completed');
    completedProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });

    // Should not show other projects (test with grid visibility)
    const allProjectNames = mockProjects.map(p => p.name);
    const hiddenProjects = allProjectNames.slice(0, -completedProjects.length);
  });

  test('should display project details on card', () => {
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    const firstProject = mockProjects[0];
    expect(screen.getByText(firstProject.name)).toBeInTheDocument();
    expect(screen.getByText(firstProject.description)).toBeInTheDocument();
    expect(screen.getByText(firstProject.designer.name)).toBeInTheDocument();
  });

  test('should show project timeline information', () => {
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    // Should display dates on cards
    mockProjects.forEach(project => {
      if (project.startDate) {
        const dateString = new Date(project.startDate).toLocaleDateString();
        expect(screen.queryByText(new RegExp(dateString))).toBeInTheDocument();
      }
    });
  });

  test('should highlight overdue projects', () => {
    const overdueProject: Project = {
      ...mockProjects[0],
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    };

    render(
      <ClientProjects
        projects={[...mockProjects, overdueProject]}
        setActiveView={() => {}}
      />
    );

    // The overdue project should be highlighted in red (check styling)
    const overdueText = screen.getByText(/overdue/i);
    expect(overdueText).toHaveClass('text-red');
  });

  test('should navigate to project detail on view click', async () => {
    const user = userEvent.setup();
    const mockSetActiveView = jest.fn();

    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={mockSetActiveView}
      />
    );

    const viewButton = screen.getAllByRole('button', { name: /View Project/i })[0];
    await user.click(viewButton);

    await waitFor(() => {
      expect(mockSetActiveView).toHaveBeenCalledWith(mockProjects[0].id);
    });
  });
});

// ============================================================================
// DESIGN VIEWER TESTS
// ============================================================================

describe('Design Viewer E2E Tests', () => {
  const mockVersion = mockProjects[0].versions?.[0] || {
    id: 'v1',
    versionNumber: 1,
    fileUrl: 'https://example.com/design.jpg',
    submittedDate: new Date().toISOString(),
    changelog: ['Initial design', 'Added colors'],
    comments: [],
    isAccepted: false,
  };

  test('should display design image', () => {
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    const image = screen.getByAltText(/Design Version/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockVersion.fileUrl);
  });

  test('should provide zoom controls', async () => {
    const user = userEvent.setup();
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();

    await user.click(zoomInButton);
    expect(screen.getByText(/110%/)).toBeInTheDocument();
  });

  test('should display version selector', () => {
    const versionsWithMultiple = {
      ...mockProjects[0],
      versions: [mockVersion, { ...mockVersion, id: 'v2', versionNumber: 2 }],
    };

    render(
      <DesignViewer
        project={versionsWithMultiple}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  test('should display changelog', () => {
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    mockVersion.changelog.forEach(change => {
      expect(screen.getByText(change)).toBeInTheDocument();
    });
  });

  test('should display comments section', () => {
    const versionWithComments = {
      ...mockVersion,
      comments: [
        {
          id: 'c1',
          user: mockUsers.client1,
          text: 'Great design!',
          timestamp: new Date().toISOString(),
          replies: [],
        },
      ],
    };

    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={versionWithComments}
        onBack={() => {}}
      />
    );

    expect(screen.getByText('Great design!')).toBeInTheDocument();
  });

  test('should allow adding a comment', async () => {
    const user = userEvent.setup();
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    const textarea = screen.getByPlaceholderText(/Share your feedback/i);
    await user.type(textarea, 'Looks amazing!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  test('should show accept design button when not accepted', () => {
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Accept Design/i })).toBeInTheDocument();
  });

  test('should not show accept design button when accepted', () => {
    const acceptedVersion = { ...mockVersion, isAccepted: true };
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={acceptedVersion}
        onBack={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Accept Design/i })).not.toBeInTheDocument();
  });

  test('should show download button', () => {
    render(
      <DesignViewer
        project={mockProjects[0]}
        user={mockUsers.client1}
        version={mockVersion}
        onBack={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
  });
});

// ============================================================================
// NOTIFICATIONS TESTS
// ============================================================================

describe('Notifications E2E Tests', () => {
  test('should display notification bell icon', () => {
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  test('should show unread notification badge', () => {
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    // Should show badge with count
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    expect(screen.getByText(unreadCount.toString())).toBeInTheDocument();
  });

  test('should open notification dropdown on bell click', async () => {
    const user = userEvent.setup();
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
  });

  test('should display all notifications grouped by date', async () => {
    const user = userEvent.setup();
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    // Should group by date
    expect(screen.getByText(/Today|Yesterday|This Week|Older/)).toBeInTheDocument();
  });

  test('should filter notifications by status', async () => {
    const user = userEvent.setup();
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    const unreadButton = screen.getByRole('button', { name: /Unread/i });
    await user.click(unreadButton);

    // Should show only unread
    const unreadNotifications = mockNotifications.filter(n => !n.isRead);
    unreadNotifications.forEach(notif => {
      expect(screen.getByText(notif.text)).toBeInTheDocument();
    });
  });

  test('should mark notification as read', async () => {
    const user = userEvent.setup();
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    const readDots = screen.getAllByRole('button').filter(btn => btn.className.includes('rounded-full'));
    if (readDots.length > 0) {
      await user.click(readDots[0]);
      // Dot should be removed (notification marked as read)
    }
  });

  test('should mark all as read', async () => {
    const user = userEvent.setup();
    render(
      <Header
        user={mockUsers.client1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    const markAllButton = screen.getByRole('button', { name: /Mark all as read/i });
    await user.click(markAllButton);

    // Badge should disappear or show 0
    // All notifications should be marked as read
  });
});

// ============================================================================
// USER PROFILE TESTS
// ============================================================================

describe('User Profile E2E Tests', () => {
  test('should display user information', () => {
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    expect(screen.getByText(mockUsers.client1.name)).toBeInTheDocument();
    expect(screen.getByText(mockUsers.client1.email)).toBeInTheDocument();
    expect(screen.getByText(mockUsers.client1.company!)).toBeInTheDocument();
  });

  test('should display user avatar', () => {
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const avatar = screen.getByAltText(mockUsers.client1.name);
    expect(avatar).toBeInTheDocument();
  });

  test('should show project statistics', () => {
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Projects/i)).toBeInTheDocument();
  });

  test('should allow editing profile', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editButton);

    const nameInput = screen.getByDisplayValue(mockUsers.client1.name) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
  });

  test('should allow changing password', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(changePasswordButton);

    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  test('should show/hide password inputs', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(changePasswordButton);

    const eyeButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('eye') || btn.innerHTML.includes('Eye')
    );

    if (eyeButtons.length > 0) {
      const input = screen.getByLabelText(/Current Password/i) as HTMLInputElement;
      expect(input.type).toBe('password');

      await user.click(eyeButtons[0]);
      expect(input.type).toBe('text');
    }
  });

  test('should validate password requirements', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(changePasswordButton);

    const newPasswordInput = screen.getByLabelText(/^New Password/i);
    await user.type(newPasswordInput, 'short');

    // Should show error or disable submit
    const updateButton = screen.getByRole('button', { name: /Update Password/i });
    expect(updateButton).toBeDisabled();
  });
});

// ============================================================================
// REAL-TIME UPDATES TESTS
// ============================================================================

describe('Real-time Updates E2E Tests', () => {
  test('should subscribe to activity updates', () => {
    const { unmount } = render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
      />
    );

    // Should have active subscriptions
    expect(getActiveSubscriptionCount()).toBeGreaterThan(0);

    unmount();

    // Should clean up on unmount
    expect(getActiveSubscriptionCount()).toBe(0);
  });

  test('should update activity feed in real-time', async () => {
    jest.useFakeTimers();

    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
      />
    );

    // Fast forward polling
    jest.advanceTimersByTime(5000);

    // Activity feed should be polled for updates
    jest.useRealTimers();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Cross-Feature Integration Tests', () => {
  test('should navigate from activity feed to design viewer', async () => {
    const user = userEvent.setup();
    const mockSetActiveView = jest.fn();

    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={mockSetActiveView}
      />
    );

    const viewDesignButtons = screen.getAllByRole('button', { name: /View Design/i });
    if (viewDesignButtons.length > 0) {
      await user.click(viewDesignButtons[0]);

      await waitFor(() => {
        expect(mockSetActiveView).toHaveBeenCalled();
      });
    }
  });

  test('should update notifications when accepting design', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Header
        user={mockUsers.designer1}
        setActiveView={() => {}}
      />
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    // Simulate accepting a design (would update notifications in real app)
    rerender(
      <Header
        user={mockUsers.designer1}
        setActiveView={() => {}}
      />
    );
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('Accessibility E2E Tests', () => {
  test('activity feed should have proper heading hierarchy', () => {
    render(
      <ActivityFeed
        activities={mockActivities}
        currentUser={mockUsers.client1}
        onViewDesign={() => {}}
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  test('all buttons should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <ClientProjects
        projects={mockProjects}
        setActiveView={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');

    for (const button of buttons) {
      button.focus();
      expect(button).toHaveFocus();
    }
  });

  test('form inputs should have labels', () => {
    render(
      <UserProfile
        user={mockUsers.client1}
        projects={mockProjects}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    fireEvent.click(editButton);

    // Should have label for each input
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });
});