/**
 * Real-time Updates Service
 *
 * This module provides real-time functionality for the client portal using:
 * 1. Polling for immediate updates (default interval: 5 seconds)
 * 2. Supabase Realtime subscriptions for production
 * 3. Event-based callbacks for UI updates
 *
 * Usage:
 *
 * const unsubscribe = subscribeToProjectUpdates(projectId, (update) => {
 *   console.log('Project updated:', update);
 *   // Update your state/UI here
 * });
 *
 * // Clean up when component unmounts
 * return () => unsubscribe();
 */

import { createClient } from '@/lib/supabase';

export type RealtimeEvent =
  | 'version-uploaded'
  | 'comment-added'
  | 'design-accepted'
  | 'project-updated'
  | 'notification-sent';

export interface RealtimeUpdate {
  event: RealtimeEvent;
  projectId: string;
  data: Record<string, any>;
  timestamp: string;
}

export type RealtimeCallback = (update: RealtimeUpdate) => void;

// Store active subscriptions
const activeSubscriptions = new Map<string, NodeJS.Timer>();
const eventListeners = new Map<string, Set<RealtimeCallback>>();

/**
 * Subscribe to real-time updates for a specific project
 *
 * @param projectId - The project ID to subscribe to
 * @param callback - Function called when updates occur
 * @param pollInterval - Polling interval in milliseconds (default: 5000)
 * @returns Unsubscribe function
 */
export function subscribeToProjectUpdates(
  projectId: string,
  callback: RealtimeCallback,
  pollInterval = 5000
): () => void {
  const subscriptionKey = `project-${projectId}`;

  // Add callback to listeners
  if (!eventListeners.has(subscriptionKey)) {
    eventListeners.set(subscriptionKey, new Set());
  }
  eventListeners.get(subscriptionKey)?.add(callback);

  // Set up polling if not already running
  if (!activeSubscriptions.has(subscriptionKey)) {
    const pollTimer = setInterval(() => {
      pollProjectUpdates(projectId);
    }, pollInterval);

    activeSubscriptions.set(subscriptionKey, pollTimer);
  }

  // Return unsubscribe function
  return () => {
    const listeners = eventListeners.get(subscriptionKey);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        // No more listeners, stop polling
        const timer = activeSubscriptions.get(subscriptionKey);
        if (timer) {
          clearInterval(timer as any);
          activeSubscriptions.delete(subscriptionKey);
        }
        eventListeners.delete(subscriptionKey);
      }
    }
  };
}

/**
 * Subscribe to activity feed updates for a client
 *
 * @param clientId - The client ID to subscribe to
 * @param callback - Function called when updates occur
 * @param pollInterval - Polling interval in milliseconds (default: 5000)
 * @returns Unsubscribe function
 */
export function subscribeToActivityFeed(
  clientId: string,
  callback: RealtimeCallback,
  pollInterval = 5000
): () => void {
  const subscriptionKey = `activity-${clientId}`;

  if (!eventListeners.has(subscriptionKey)) {
    eventListeners.set(subscriptionKey, new Set());
  }
  eventListeners.get(subscriptionKey)?.add(callback);

  if (!activeSubscriptions.has(subscriptionKey)) {
    const pollTimer = setInterval(() => {
      pollActivityFeedUpdates(clientId);
    }, pollInterval);

    activeSubscriptions.set(subscriptionKey, pollTimer);
  }

  return () => {
    const listeners = eventListeners.get(subscriptionKey);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        const timer = activeSubscriptions.get(subscriptionKey);
        if (timer) {
          clearInterval(timer as any);
          activeSubscriptions.delete(subscriptionKey);
        }
        eventListeners.delete(subscriptionKey);
      }
    }
  };
}

/**
 * Subscribe to notifications for a user
 *
 * @param userId - The user ID to subscribe to
 * @param callback - Function called when updates occur
 * @param pollInterval - Polling interval in milliseconds (default: 3000)
 * @returns Unsubscribe function
 */
export function subscribeToNotifications(
  userId: string,
  callback: RealtimeCallback,
  pollInterval = 3000
): () => void {
  const subscriptionKey = `notifications-${userId}`;

  if (!eventListeners.has(subscriptionKey)) {
    eventListeners.set(subscriptionKey, new Set());
  }
  eventListeners.get(subscriptionKey)?.add(callback);

  if (!activeSubscriptions.has(subscriptionKey)) {
    const pollTimer = setInterval(() => {
      pollNotifications(userId);
    }, pollInterval);

    activeSubscriptions.set(subscriptionKey, pollTimer);
  }

  return () => {
    const listeners = eventListeners.get(subscriptionKey);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        const timer = activeSubscriptions.get(subscriptionKey);
        if (timer) {
          clearInterval(timer as any);
          activeSubscriptions.delete(subscriptionKey);
        }
        eventListeners.delete(subscriptionKey);
      }
    }
  };
}

/**
 * Poll for project updates
 * In production, this would query the database for new versions, comments, etc.
 */
async function pollProjectUpdates(projectId: string): Promise<void> {
  try {
    const supabase = createClient();

    // Check for new versions
    const { data: versions, error: versionsError } = await supabase
      .from('versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    if (versions && versions.length > 0) {
      const latestVersion = versions[0];
      emitUpdate(`project-${projectId}`, {
        event: 'version-uploaded',
        projectId,
        data: latestVersion,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for new comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (commentsError) throw commentsError;

    if (comments && comments.length > 0) {
      const latestComment = comments[0];
      emitUpdate(`project-${projectId}`, {
        event: 'comment-added',
        projectId,
        data: latestComment,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error polling project updates:', error);
  }
}

/**
 * Poll for activity feed updates
 */
async function pollActivityFeedUpdates(clientId: string): Promise<void> {
  try {
    const supabase = createClient();

    // Get client's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', clientId);

    if (projectsError) throw projectsError;

    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);

      // Check for recent versions
      const { data: versions, error: versionsError } = await supabase
        .from('versions')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      if (versions && versions.length > 0) {
        emitUpdate(`activity-${clientId}`, {
          event: 'version-uploaded',
          projectId: versions[0].project_id,
          data: versions[0],
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error polling activity feed updates:', error);
  }
}

/**
 * Poll for notifications
 */
async function pollNotifications(userId: string): Promise<void> {
  try {
    const supabase = createClient();

    // Check for unread notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (notifications && notifications.length > 0) {
      const notification = notifications[0];
      emitUpdate(`notifications-${userId}`, {
        event: 'notification-sent',
        projectId: notification.project_id || '',
        data: notification,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error polling notifications:', error);
  }
}

/**
 * Emit an update to all listeners for a subscription
 */
function emitUpdate(subscriptionKey: string, update: RealtimeUpdate): void {
  const listeners = eventListeners.get(subscriptionKey);
  if (listeners) {
    listeners.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in realtime callback:', error);
      }
    });
  }
}

/**
 * Clean up all active subscriptions
 */
export function unsubscribeAll(): void {
  activeSubscriptions.forEach(timer => {
    clearInterval(timer as any);
  });
  activeSubscriptions.clear();
  eventListeners.clear();
}

/**
 * Get the number of active subscriptions (for debugging)
 */
export function getActiveSubscriptionCount(): number {
  return activeSubscriptions.size;
}

/**
 * Alternative: Direct Supabase Realtime subscription (for production)
 *
 * This would replace the polling approach with true real-time updates
 * when Supabase Realtime is properly configured and enabled.
 */
export function subscribeWithSupabaseRealtime(
  channel: string,
  event: string,
  callback: (payload: any) => void
): () => void {
  try {
    const supabase = createClient();

    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', { event, schema: 'public' }, callback)
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  } catch (error) {
    console.error('Error setting up Supabase Realtime:', error);
    return () => {};
  }
}
