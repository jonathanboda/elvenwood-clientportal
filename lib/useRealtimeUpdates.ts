/**
 * React Hook for Real-time Updates
 *
 * Provides easy-to-use hooks for subscribing to real-time updates
 * with automatic cleanup and React integration.
 *
 * Usage:
 *
 * function MyComponent() {
 *   const [activities, setActivities] = useState([]);
 *
 *   useRealtimeActivityFeed(clientId, (update) => {
 *     setActivities(prev => [update, ...prev]);
 *   });
 *
 *   return <div>Activities: {activities.length}</div>;
 * }
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  subscribeToProjectUpdates,
  subscribeToActivityFeed,
  subscribeToNotifications,
  RealtimeCallback,
  RealtimeUpdate,
} from './realtime';

/**
 * Hook to subscribe to project-specific updates
 *
 * @param projectId - The project ID to subscribe to
 * @param onUpdate - Callback function when updates occur
 * @param enabled - Whether to enable the subscription (default: true)
 * @param pollInterval - Polling interval in milliseconds (default: 5000)
 */
export function useRealtimeProjectUpdates(
  projectId: string,
  onUpdate: RealtimeCallback,
  enabled = true,
  pollInterval = 5000
): void {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) return;

    // Subscribe to updates
    unsubscribeRef.current = subscribeToProjectUpdates(
      projectId,
      onUpdate,
      pollInterval
    );

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [projectId, enabled, onUpdate, pollInterval]);
}

/**
 * Hook to subscribe to activity feed updates
 *
 * @param clientId - The client ID to subscribe to
 * @param onUpdate - Callback function when updates occur
 * @param enabled - Whether to enable the subscription (default: true)
 * @param pollInterval - Polling interval in milliseconds (default: 5000)
 */
export function useRealtimeActivityFeed(
  clientId: string,
  onUpdate: RealtimeCallback,
  enabled = true,
  pollInterval = 5000
): void {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !clientId) return;

    unsubscribeRef.current = subscribeToActivityFeed(
      clientId,
      onUpdate,
      pollInterval
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [clientId, enabled, onUpdate, pollInterval]);
}

/**
 * Hook to subscribe to user notifications
 *
 * @param userId - The user ID to subscribe to
 * @param onUpdate - Callback function when updates occur
 * @param enabled - Whether to enable the subscription (default: true)
 * @param pollInterval - Polling interval in milliseconds (default: 3000)
 */
export function useRealtimeNotifications(
  userId: string,
  onUpdate: RealtimeCallback,
  enabled = true,
  pollInterval = 3000
): void {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    unsubscribeRef.current = subscribeToNotifications(
      userId,
      onUpdate,
      pollInterval
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, enabled, onUpdate, pollInterval]);
}

/**
 * Hook to track the last received update
 *
 * @returns The last update received
 */
export function useLastRealtimeUpdate(): RealtimeUpdate | null {
  const [lastUpdate, setLastUpdate] = React.useState<RealtimeUpdate | null>(null);

  const handleUpdate = useCallback((update: RealtimeUpdate) => {
    setLastUpdate(update);
  }, []);

  return lastUpdate;
}

// Import React for useState used in useLastRealtimeUpdate
import React from 'react';
