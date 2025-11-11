import React, { useState, useEffect } from 'react';
import { Activity, User } from '../../types';
import ActivityFeedItem from './ActivityFeedItem';
import { RefreshCw, Zap } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  currentUser: User;
  onViewDesign: (projectId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddComment?: (activityId: string, comment: string, attachment?: File) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  currentUser,
  onViewDesign,
  isLoading = false,
  onRefresh,
  onAddComment,
}) => {
  const [displayActivities, setDisplayActivities] = useState<Activity[]>(activities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Sort activities by timestamp (newest first)
    const sortedActivities = [...activities].sort((a, b) => {
      try {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA; // Newest first
      } catch {
        return 0;
      }
    });
    setDisplayActivities(sortedActivities);
  }, [activities]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLastUpdate(new Date());
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleAddComment = (activityId: string, comment: string, attachment?: File) => {
    if (onAddComment) {
      onAddComment(activityId, comment, attachment);
    } else {
      console.log(`Comment added to activity ${activityId}: ${comment}`, attachment);
    }
  };

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (isLoading && displayActivities.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin">
          <RefreshCw size={32} className="text-brand-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Activity Feed
          </h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {displayActivities.length} {displayActivities.length === 1 ? 'update' : 'updates'} • Updated {formatLastUpdate()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border hover:border-brand-accent dark:hover:border-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Real-time indicator */}
      {displayActivities.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Zap size={16} className="text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Real-time updates enabled. Feed will refresh automatically when designers upload new versions.
          </p>
        </div>
      )}

      {/* Activity List */}
      {displayActivities.length > 0 ? (
        <div className="space-y-2">
          {displayActivities.map((activity) => (
            <ActivityFeedItem
              key={activity.id}
              item={activity}
              currentUser={currentUser}
              onViewDesign={onViewDesign}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
          <div className="mb-4">
            <div className="inline-block p-4 rounded-full bg-light-bg dark:bg-dark-bg">
              <RefreshCw size={32} className="text-light-text-secondary dark:text-dark-text-secondary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
            No Activity Yet
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto">
            Recent project updates, comments, and design uploads will appear here. Check back soon or ask your designer to upload a new version!
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
