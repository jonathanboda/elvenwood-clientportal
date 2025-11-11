"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface Version {
  id: string;
  version_number: number;
  changelog: string;
  file_name: string;
  file_path: string;
  created_at: string;
  uploaded_by: {
    full_name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  author: {
    full_name: string;
  };
  created_at: string;
}

interface Project {
  id: string;
  project_name: string;
  description: string;
  status: string;
  designer: {
    full_name: string;
  };
  client_email: string;
  client_id: string;
  designer_id: string;
  versions: Version[];
  comments: Comment[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [commentText, setCommentText] = useState("");
  const [commentAttachment, setCommentAttachment] = useState<File | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
    fetchUserRole();

    // Set up real-time subscription for comments
    const channel = supabase
      .channel(`project-${projectId}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Comment change detected:', payload);
          // Refresh project data when comments change
          fetchProject();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from("projects")
        .select(
          `
          id,
          project_name,
          description,
          status,
          client_email,
          client_id,
          designer_id,
          designer:profiles!projects_designer_id_fkey(full_name),
          versions(
            id,
            version_number,
            changelog,
            file_name,
            file_path,
            created_at,
            uploaded_by:profiles(full_name)
          ),
          comments(
            id,
            content,
            attachment_url,
            attachment_name,
            author:profiles!comments_author_id_fkey(full_name),
            created_at
          )
        `
        )
        .eq("id", projectId)
        .single();

      if (queryError) throw queryError;

      setProject(data);
      if (data.versions.length > 0) {
        setSelectedVersionId(data.versions[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setUserRole(profile.role);
    } catch (err: any) {
      console.error("Error fetching user role:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComment(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      let attachmentUrl = null;
      let attachmentName = null;

      // Upload attachment if one is selected
      if (commentAttachment) {
        const formData = new FormData();
        formData.append("file", commentAttachment);
        formData.append("projectId", projectId);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload attachment");
        }

        const uploadData = await uploadResponse.json();
        attachmentUrl = uploadData.data.url;
        attachmentName = uploadData.data.fileName;
      }

      const { data: newComment, error: commentError } = await supabase
        .from("comments")
        .insert({
          version_id: selectedVersionId,
          project_id: projectId,
          author_id: user.id,
          content: commentText,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        })
        .select()
        .single();

      if (commentError) throw commentError;

      // Create notification for the other party
      if (project && newComment) {
        try {
          // Get current user's profile to get their name
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const userName = userProfile?.full_name || "Someone";

          // Determine who to notify
          const notifyUserId =
            user.id === project.designer_id
              ? project.client_id
              : project.designer_id;

          if (notifyUserId) {
            // Create notification message
            const hasAttachment = attachmentUrl ? " with an attachment" : "";
            const message = `${userName} commented on ${project.project_name}${hasAttachment}: "${commentText.substring(0, 100)}${commentText.length > 100 ? "..." : ""}"`;

            // Call notification API
            await fetch("/api/notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: notifyUserId,
                project_id: projectId,
                comment_id: newComment.id,
                type: "new_comment",
                title: `New comment on ${project.project_name}`,
                message: message,
              }),
            });
          }
        } catch (notifError) {
          // Don't fail the whole operation if notification fails
          console.error("Failed to create notification:", notifError);
        }
      }

      setCommentText("");
      setCommentAttachment(null);
      await fetchProject();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-6">
              <div className="text-sm text-red-700">
                {error || "Project not found"}
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedVersion = project.versions.find((v) => v.id === selectedVersionId);
  const versionComments = selectedVersion
    ? project.comments.filter((c) => c.version_id === selectedVersionId)
    : [];

  // Format relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format full datetime
  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Sort comments by created_at DESC (newest first)
  const sortedComments = [...project.comments].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mt-4">
              {project.project_name}
            </h1>
            {project.description && (
              <p className="mt-2 text-lg text-gray-600">{project.description}</p>
            )}
          </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Designer</p>
          <p className="text-lg font-semibold text-gray-900">
            {project.designer?.full_name || "Designer"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Client Email</p>
          <p className="text-lg font-semibold text-gray-900">
            {project.client_email}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {project.status}
          </p>
        </div>
      </div>

      {/* Design Versions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Design Versions
        </h2>

        {project.versions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No design versions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.versions.map((version) => (
              <button
                key={version.id}
                onClick={() => setSelectedVersionId(version.id)}
                className={`w-full text-left p-5 border-2 rounded-xl transition-all duration-200 ${
                  selectedVersionId === version.id
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Version {version.version_number}
                      </span>
                      {selectedVersionId === version.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Selected
                        </span>
                      )}
                    </div>
                    {version.changelog && (
                      <p className="text-sm text-gray-700 mb-2">
                        {version.changelog}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{version.uploaded_by?.full_name}</span>
                      <span>•</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(version.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a
                    href={`/api/download?path=${encodeURIComponent(version.file_path)}&name=${encodeURIComponent(version.file_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts on this design..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (optional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setCommentAttachment(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {commentAttachment && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {commentAttachment.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submittingComment ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post Comment
              </>
            )}
          </button>
        </form>

        {/* Comments List */}
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-4 text-gray-500 font-medium">No comments yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-600 bg-gray-50 rounded-r-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {comment.author?.full_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {comment.author?.full_name}
                    </p>
                    <p className="text-gray-700 mt-2 leading-relaxed">{comment.content}</p>
                    {comment.attachment_url && (
                      <div className="mt-3">
                        <a
                          href={comment.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {comment.attachment_name || 'View Design'}
                        </a>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-gray-700 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(comment.created_at)}
                      </span>
                      <span className="text-gray-500">
                        {formatFullDateTime(comment.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
