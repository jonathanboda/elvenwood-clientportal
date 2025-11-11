import React, { useState } from 'react';
import { Project, User, DesignVersion, Comment as CommentType } from '../../types.ts';
import { ArrowLeft, MessageSquare, Paperclip, Send, Download, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface DesignViewerProps {
  project: Project;
  user: User;
  version: DesignVersion;
  onBack: () => void;
  onVersionChange?: (versionId: string) => void;
  onAcceptDesign?: () => void;
}

const Comment: React.FC<{ comment: CommentType }> = ({ comment }) => {
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
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <img src={comment.user.avatarUrl} alt={comment.user.name} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="bg-light-bg-secondary dark:bg-dark-bg rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm text-light-text dark:text-dark-text">{comment.user.name}</span>
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{formatTimestamp(comment.timestamp)}</span>
            </div>
            <p className="text-sm text-light-text dark:text-dark-text">{comment.text}</p>
            {comment.imageUrl && (
              <img src={comment.imageUrl} alt="comment attachment" className="mt-3 rounded-lg max-w-xs h-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-3 pl-3 border-l-2 border-light-border dark:border-dark-border space-y-3">
          {comment.replies.map(reply => (
            <div key={reply.id} className="flex items-start gap-3">
              <img src={reply.user.avatarUrl} alt={reply.user.name} className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-xs text-light-text dark:text-dark-text">{reply.user.name}</span>
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{formatTimestamp(reply.timestamp)}</span>
                  </div>
                  <p className="text-sm text-light-text dark:text-dark-text">{reply.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DesignViewer: React.FC<DesignViewerProps> = ({ project, user, version, onBack, onVersionChange, onAcceptDesign }) => {
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedFile) return;
    setIsSubmitting(true);
    try {
      console.log("New comment added:", newComment, selectedFile);
      // In a real app, this would trigger an API call to add the comment
      setNewComment("");
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-screen lg:h-auto overflow-hidden">
      {/* Main content - Design Image */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center flex-wrap gap-2 bg-light-bg dark:bg-dark-bg-secondary">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-brand-accent mb-3 hover:opacity-80 transition-opacity">
              <ArrowLeft size={18} />
              Back to Project
            </button>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              {project.name}
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Version {version.versionNumber} • Submitted {new Date(version.submittedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg rounded-lg p-1">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded transition-colors text-light-text-secondary dark:text-dark-text-secondary"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm font-medium text-light-text dark:text-dark-text px-2 min-w-[3rem] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded transition-colors text-light-text-secondary dark:text-dark-text-secondary"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            {version.fileUrl && (
              <a
                href={version.fileUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors text-light-text dark:text-dark-text font-medium text-sm"
              >
                <Download size={16} />
                Download
              </a>
            )}
            {!version.isAccepted && onAcceptDesign && (
              <button
                onClick={onAcceptDesign}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium text-sm"
              >
                <Check size={16} />
                Accept Design
              </button>
            )}
          </div>
        </div>

        {/* Version Selector */}
        {project.versions.length > 1 && (
          <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg/30 flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">Versions:</span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {project.versions.map(v => (
                <button
                  key={v.id}
                  onClick={() => onVersionChange?.(v.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    v.id === version.id
                      ? 'bg-brand-accent text-white shadow-lg'
                      : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  v{v.versionNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Design Image */}
        <div className="flex-1 p-4 bg-gray-100 dark:bg-dark-bg flex items-center justify-center overflow-auto">
          <img
            src={version.fileUrl}
            alt={`Design Version ${version.versionNumber}`}
            className="rounded-lg shadow-lg max-w-full max-h-full object-contain"
            style={{ width: `${zoomLevel}%` }}
          />
        </div>

        {/* Changelog */}
        {version.changelog && version.changelog.length > 0 && (
          <div className="px-4 py-3 border-t border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg/30">
            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase mb-2">Changelog</p>
            <ul className="text-sm text-light-text dark:text-dark-text space-y-1">
              {version.changelog.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-accent font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sidebar - Comments */}
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col overflow-hidden bg-light-bg dark:bg-dark-bg-secondary border-t lg:border-t-0 lg:border-l border-light-border dark:border-dark-border">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <h3 className="font-semibold flex items-center gap-2 text-lg text-light-text dark:text-dark-text">
            <MessageSquare size={20} />
            Feedback
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {version.comments.length} comment{version.comments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {version.comments.length > 0 ? (
            version.comments.map(c => <Comment key={c.id} comment={c} />)
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                No feedback yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0 space-y-3 bg-light-bg-secondary/30 dark:bg-dark-bg/30">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your feedback..."
            className="w-full bg-light-bg dark:bg-dark-bg-secondary p-3 rounded-lg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm resize-none text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary"
            rows={2}
          />

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-light-bg dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
              <Paperclip size={16} className="text-brand-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{selectedFile.name}</p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent dark:hover:text-brand-accent cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border text-sm font-medium">
              <Paperclip size={16} />
              <span>Attach</span>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
            </label>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() && !selectedFile || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignViewer;