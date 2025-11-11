"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface Version {
  id: string;
  version_number: number;
  changelog: string;
  file_name: string;
  file_path: string;
  created_at: string;
  project: {
    id: string;
    project_name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  author: {
    full_name: string;
  };
  author_id: string;
  created_at: string;
}

export default function DesignViewerPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const versionId = params.versionId as string;

  const [version, setVersion] = useState<Version | null>(null);
  const [designFileUrl, setDesignFileUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVersionAndComments();
  }, [versionId]);

  const fetchVersionAndComments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      setCurrentUser(user);

      // Fetch version details
      const { data: versionData, error: versionError } = await supabase
        .from("versions")
        .select(`
          id,
          version_number,
          changelog,
          file_name,
          file_path,
          created_at,
          project:projects(id, project_name)
        `)
        .eq("id", versionId)
        .single();

      if (versionError) {
        console.error("Error fetching version:", versionError);
        setLoading(false);
        return;
      }

      setVersion(versionData);

      // Get the design file URL from storage
      const fileUrl = `/api/download?path=${encodeURIComponent(versionData.file_path)}&name=${encodeURIComponent(versionData.file_name)}`;
      setDesignFileUrl(fileUrl);

      // Fetch comments for this version
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          attachment_url,
          attachment_name,
          author:profiles!comments_author_id_fkey(full_name),
          author_id,
          created_at
        `)
        .eq("version_id", versionId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      } else {
        setComments(commentsData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only images and PDFs are allowed");
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !version || !currentUser) {
      alert("Please enter some feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl = null;
      let attachmentName = null;

      // Upload attachment if one is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("projectId", version.project.id);

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

      // Insert comment into database
      const { data: newComment, error: commentError } = await supabase
        .from("comments")
        .insert({
          version_id: versionId,
          project_id: version.project.id,
          author_id: currentUser.id,
          content: feedbackText,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        })
        .select()
        .single();

      if (commentError) throw commentError;

      // Create notification for the designer
      if (newComment && version.project) {
        try {
          // Fetch the project to get designer_id
          const { data: projectData } = await supabase
            .from("projects")
            .select("designer_id")
            .eq("id", version.project.id)
            .single();

          if (projectData?.designer_id) {
            // Get current user's name
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", currentUser.id)
              .single();

            const userName = userProfile?.full_name || "A client";
            const hasAttachment = attachmentUrl ? " with an attachment" : "";
            const message = `${userName} commented on ${version.project.project_name}${hasAttachment}: "${feedbackText.substring(0, 100)}${feedbackText.length > 100 ? "..." : ""}"`;

            // Create notification
            const notifResponse = await fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: projectData.designer_id,
                project_id: version.project.id,
                comment_id: newComment.id,
                type: "new_comment",
                title: `New comment on ${version.project.project_name}`,
                message: message,
              }),
            });

            if (!notifResponse.ok) {
              console.error("Failed to create notification:", await notifResponse.text());
            } else {
              console.log("Notification created successfully for designer:", projectData.designer_id);
            }
          }
        } catch (notifError) {
          console.error("Failed to create notification:", notifError);
        }
      }

      // Refresh comments
      await fetchVersionAndComments();

      // Clear form
      setFeedbackText("");
      setSelectedFile(null);
      setFilePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      // Refresh comments
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment: " + err.message);
    }
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading design...</Typography>
        </Box>
      </Box>
    );
  }

  if (!version) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            Design version not found
          </Typography>
          <Button
            component={Link}
            href="/client-portal/design-viewer"
            sx={{ mt: 2 }}
            variant="contained"
          >
            Back to Projects
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ position: "sticky", top: 0, zIndex: 40, mb: 4 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Button
            component={Link}
            href="/client-portal/design-viewer"
            startIcon={<ArrowBackIcon />}
            color="primary"
            sx={{ mb: 2 }}
          >
            Back to Design Versions
          </Button>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {version.project.project_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Version {version.version_number} - {version.file_name}
            </Typography>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Design Canvas Section */}
        <Card elevation={1} sx={{ mb: 4, overflow: "hidden" }}>
          {/* Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", backgroundColor: "action.hover", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Zoom: {zoomLevel}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                onClick={handleZoomOut}
                size="small"
                title="Zoom Out"
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleResetZoom}
                size="small"
                title="Reset Zoom"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleZoomIn}
                size="small"
                title="Zoom In"
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
              <Divider orientation="vertical" sx={{ mx: 0.5, height: 24 }} />
              <IconButton
                component="a"
                href={designFileUrl}
                download={version.file_name}
                size="small"
                title="Download"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Design Image */}
          <Box sx={{ backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, overflow: "auto" }}>
            {designFileUrl ? (
              <Box
                component="img"
                src={designFileUrl}
                alt={version.file_name}
                sx={{
                  width: `${zoomLevel}%`,
                  height: "auto",
                  maxWidth: "100%",
                  transition: "width 0.2s ease",
                  cursor: "grab",
                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
              />
            ) : (
              <CircularProgress />
            )}
          </Box>
        </Card>

        {/* Two Column Layout */}
        <Grid container spacing={4}>
          {/* Feedback Section */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Add Feedback Box */}
              <Card elevation={1}>
                <CardContent sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Add Your Feedback
                  </Typography>

                  {/* Textarea */}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your thoughts on this design..."
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  {/* File Upload Area */}
                  <Box sx={{ mb: 2 }}>
                    <Paper
                      component="label"
                      variant="outlined"
                      sx={{
                        p: 2,
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <UploadIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedFile ? selectedFile.name : "Upload reference image or PDF"}
                      </Typography>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        disabled={isSubmitting}
                        hidden
                        accept="image/*,.pdf"
                      />
                    </Paper>

                    {selectedFile && (
                      <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: "info.lighter" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: filePreview ? 2 : 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <FileIcon color="primary" sx={{ fontSize: 32 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {selectedFile.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatFileSize(selectedFile.size)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            disabled={isSubmitting}
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        {filePreview && (
                          <Box
                            component="img"
                            src={filePreview}
                            alt="Preview"
                            sx={{
                              width: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                              borderRadius: 1,
                              backgroundColor: "background.paper",
                            }}
                          />
                        )}
                      </Paper>
                    )}
                  </Box>

                  {/* Submit Button */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      onClick={() => {
                        setFeedbackText("");
                        setSelectedFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isSubmitting}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting || !feedbackText.trim()}
                      variant="contained"
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Comments List */}
              {comments.length === 0 ? (
                <Card elevation={0} variant="outlined" sx={{ py: 8, textAlign: "center" }}>
                  <Typography color="textSecondary">
                    No feedback yet. Be the first to comment!
                  </Typography>
                </Card>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {comments.map((comment) => {
                    const isOwnComment = currentUser && comment.author_id === currentUser.id;

                    return (
                      <Card key={comment.id} elevation={0} variant="outlined" sx={{ transition: "all 0.3s ease", "&:hover": { boxShadow: 2 } }}>
                        {/* Comment Header */}
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar>{comment.author?.full_name?.charAt(0) || "U"}</Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>
                                {comment.author?.full_name || "User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: "block" }}
                              >
                                {formatDate(comment.created_at)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: "block", fontSize: "0.7rem", opacity: 0.7 }}
                              >
                                {formatFullDateTime(comment.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                          {isOwnComment && (
                            <IconButton
                              onClick={() => handleDeleteComment(comment.id)}
                              size="small"
                              title="Delete comment"
                              sx={{ color: "error.main" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>

                        {/* Comment Body */}
                        <Box sx={{ p: 2 }}>
                          <Typography sx={{ lineHeight: 1.6, mb: comment.attachment_url ? 2 : 0 }}>
                            {comment.content}
                          </Typography>

                          {/* Attachments */}
                          {comment.attachment_url && (
                            <Box sx={{ mt: 2 }}>
                              <Paper
                                component="a"
                                href={comment.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  textDecoration: "none",
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                    textDecoration: "none",
                                  },
                                }}
                              >
                                <ImageIcon sx={{ color: "primary.main", fontSize: 28 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: "primary.main" }}>
                                    {comment.attachment_name || "View Design"}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    Click to view
                                  </Typography>
                                </Box>
                              </Paper>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Info Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card elevation={1} sx={{ position: "sticky", top: 80 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Design Information
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                      Version
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      v{version.version_number}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                      File Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {version.file_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                      Uploaded
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(version.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {version.changelog && (
                    <Box>
                      <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                        Changelog
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {version.changelog}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                      Feedback Count
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {comments.length}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1.5 }}>
                      Tips
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {[
                        "Be specific about what you like or need changed",
                        "Attach reference images to clarify your feedback",
                        "The designer will see all your comments",
                      ].map((tip, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: "bold", mt: 0.5 }}>
                            •
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {tip}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
