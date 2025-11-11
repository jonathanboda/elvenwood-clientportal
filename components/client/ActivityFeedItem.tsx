import React, { useState } from 'react';
import { Activity, User } from '../../types';
import { MessageSquare, Paperclip, Eye, Upload, Check } from 'lucide-react';

interface ActivityFeedItemProps {
  item: Activity;
  currentUser: User;
  onViewDesign: (projectId: string) => void;
  onAddComment: (activityId: string, comment: string, attachment?: File) => void;
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  item,
  currentUser,
  onViewDesign,
  onAddComment,
}) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (commentText.trim() || selectedFile) {
      setIsSubmitting(true);
      try {
        onAddComment(item.id, commentText, selectedFile || undefined);
        setCommentText('');
        setSelectedFile(null);
        setUploadProgress(0);
        setShowCommentInput(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getActivityIcon = () => {
    if (item.type === 'upload') {
      return <Upload size={20} className="text-blue-600 dark:text-blue-400" />;
    } else if (item.type === 'comment') {
      return <MessageSquare size={20} className="text-green-600 dark:text-green-400" />;
    }
    return <Check size={20} className="text-purple-600 dark:text-purple-400" />;
  };

  const getActivityTitle = () => {
    if (item.type === 'upload') {
      return `Designer uploaded a new design version`;
    } else if (item.type === 'comment') {
      return `Comment added`;
    }
    return 'Design accepted';
  };

  const getActivityBadgeColor = () => {
    if (item.type === 'upload') {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    } else if (item.type === 'comment') {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    }
    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else if (days < 7) {
        return `${days}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="flex gap-4 mb-6 group">
      {/* Timeline Indicator */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-light-bg-secondary dark:bg-dark-bg border-2 border-light-border dark:border-dark-border flex items-center justify-center group-hover:border-brand-accent dark:group-hover:border-brand-accent transition-colors">
          {getActivityIcon()}
        </div>
        <div className="w-0.5 h-12 bg-light-border dark:border-dark-border mt-2"></div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-light-border dark:border-dark-border hover:shadow-md transition-shadow overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 flex-1">
                <img
                  src={item.user.avatarUrl}
                  alt={item.user.name}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-light-text dark:text-dark-text text-sm">
                      {item.user.name}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getActivityBadgeColor()}`}>
                      {getActivityTitle()}
                    </span>
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    {item.project.name} • {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            {item.postText && (
              <p className="text-light-text dark:text-dark-text text-sm mb-3 whitespace-pre-wrap">
                {item.postText}
              </p>
            )}

            {/* Design Thumbnail */}
            {item.type === 'upload' && item.imageUrl && (
              <div className="my-3 rounded-lg overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
                <img
                  src={item.imageUrl}
                  alt={`${item.project.name} design`}
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
            )}

            {/* Comment Block */}
            {item.commentText && (
              <div className="bg-light-bg-secondary dark:bg-dark-bg/50 border-l-4 border-brand-accent rounded p-3 my-3">
                <p className="text-light-text dark:text-dark-text text-sm italic">
                  "{item.commentText}"
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 border-t border-light-border dark:border-dark-border bg-light-bg-secondary/30 dark:bg-dark-bg/20 flex items-center gap-3">
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent dark:hover:text-brand-accent font-medium p-2 -ml-2 rounded-md transition-colors text-sm"
            >
              <MessageSquare size={16} />
              Comment
            </button>
            {item.type === 'upload' && (
              <button
                onClick={() => onViewDesign(item.project.id)}
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-brand-accent to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
              >
                <Eye size={16} />
                View Design
              </button>
            )}
          </div>

          {/* Comment Input */}
          {showCommentInput && (
            <div className="px-4 py-4 border-t border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg/50">
              <div className="flex items-start gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    className="w-full bg-light-bg dark:bg-dark-bg-secondary p-3 rounded-lg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm resize-none"
                  />

                  {/* File Upload Preview */}
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-light-bg dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
                      <Paperclip size={16} className="text-brand-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full h-2 bg-light-border dark:border-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-accent to-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent dark:hover:text-brand-accent cursor-pointer transition-colors p-2 -ml-2 rounded-md text-sm">
                      <Paperclip size={16} />
                      <span>Attach</span>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowCommentInput(false);
                          setCommentText('');
                          setSelectedFile(null);
                        }}
                        className="px-4 py-2 rounded-lg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() && !selectedFile || isSubmitting}
                        className="px-4 py-2 rounded-lg bg-brand-accent text-white font-medium hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Sending...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
