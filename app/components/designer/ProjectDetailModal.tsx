"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { modalVariants } from "@/lib/animations";
import { Project } from "@/lib/store";
import { createClient } from "@/lib/supabase";

interface Version {
  id: string;
  number: number;
  date: string;
  changelog: string;
  status: string;
  file_name?: string;
  file_path?: string;
}

interface Comment {
  id: string;
  content: string;
  author_id: string;
  author: {
    full_name: string;
  };
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

interface EditVersionData {
  status: string;
  changelog: string;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const supabase = createClient();
  const [tabValue, setTabValue] = useState(0);
  const [versions, setVersions] = useState<Version[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newVersionChangelog, setNewVersionChangelog] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [editFormData, setEditFormData] = useState<EditVersionData>({ status: "", changelog: "" });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch comments from database
  const fetchComments = async () => {
    if (!project?.id) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          author_id,
          author:profiles!comments_author_id_fkey(full_name),
          created_at,
          attachment_url,
          attachment_name
        `)
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Fetch versions from database when modal opens
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        if (!project?.id) {
          console.warn('Project ID is missing');
          return;
        }

        const response = await fetch(`/api/versions?projectId=${project.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch versions: ${response.status}`);
        }

        const { data } = await response.json();
        const formattedVersions = data.map((v: any) => ({
          id: v.id,
          number: v.version_number,
          date: new Date(v.created_at).toISOString().split('T')[0],
          changelog: v.changelog,
          status: v.status,
          file_name: v.file_name,
          file_path: v.file_path,
        }));
        setVersions(formattedVersions);
      } catch (error) {
        console.error('Error fetching versions:', error);
        setVersions([]);
      }
    };

    if (project?.id) {
      fetchVersions();
      fetchComments();
    }
  }, [project?.id]);

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!project?.id) return;

    const channel = supabase
      .channel(`project-${project.id}-comments`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          console.log("Comment change detected:", payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !project?.id) return;

    // Get the latest version to associate the comment with
    if (versions.length === 0) {
      alert("Please upload a design version first before adding comments.");
      return;
    }

    const latestVersion = versions[versions.length - 1];

    try {
      const { data: newCommentData, error } = await supabase
        .from("comments")
        .insert({
          version_id: latestVersion.id,
          project_id: project.id,
          author_id: currentUserId,
          content: newComment,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
        return;
      }

      // Create notification for the client
      if (newCommentData && project.client_id) {
        try {
          // Get current user's name
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentUserId)
            .single();

          const userName = userProfile?.full_name || "Designer";
          const message = `${userName} commented on ${project.project_name}: "${newComment.substring(0, 100)}${newComment.length > 100 ? "..." : ""}"`;

          // Create notification
          const notifResponse = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: project.client_id,
              project_id: project.id,
              comment_id: newCommentData.id,
              type: "new_comment",
              title: `New comment on ${project.project_name}`,
              message: message,
            }),
          });

          if (!notifResponse.ok) {
            console.error("Failed to create notification:", await notifResponse.text());
          } else {
            console.log("Notification created successfully for client:", project.client_id);
          }
        } catch (notifError) {
          console.error("Failed to create notification:", notifError);
        }
      }

      setNewComment("");
      // Comment will appear via real-time subscription
      await fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Invalid file type. Please upload JPG, PNG, PDF, or WebP.');
        setUploadFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setFileError('File is too large. Maximum size is 10MB.');
        setUploadFile(null);
        return;
      }

      setFileError("");
      setUploadFile(selectedFile);
    }
  };

  const handleUploadVersion = async () => {
    if (!uploadFile || !newVersionChangelog.trim()) {
      setFileError('Please select a file and provide a changelog.');
      return;
    }

    try {
      // First, upload the file to Supabase Storage
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('projectId', project.id);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Then create the version record with the storage path
      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project.id,
          version_number: versions.length + 1,
          file_name: uploadFile.name,
          file_path: uploadData.data.storagePath,
          changelog: newVersionChangelog,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload version');
      }

      const { data: newVersion } = await response.json();

      // Convert to expected format
      const formattedVersion: Version = {
        id: newVersion.id,
        number: newVersion.version_number,
        date: new Date(newVersion.created_at).toISOString().split('T')[0],
        changelog: newVersion.changelog,
        status: newVersion.status,
      };

      setVersions([...versions, formattedVersion]);
      setNewVersionChangelog("");
      setUploadFile(null);
      setFileError("");
      setShowUpload(false);
      alert('Design version uploaded successfully!');
    } catch (error) {
      console.error('Error uploading version:', error);
      setFileError('Failed to upload version. Please try again.');
    }
  };

  const handleDownloadVersion = (version: Version) => {
    try {
      if (!version.file_name) {
        alert("No file available for this version");
        return;
      }

      // Call the download API with file path and name
      const filePath = version.file_path || version.file_name;
      const downloadUrl = `/api/download?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(version.file_name)}`;

      // Create a temporary link and click it to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = version.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Downloading version ${version.number}: ${version.file_name}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    setEditFormData({
      status: version.status,
      changelog: version.changelog,
    });
  };

  const handleSaveVersionEdit = async () => {
    if (!editingVersion) return;

    try {
      // In production, this would call an API to update the version
      const updatedVersion: Version = {
        ...editingVersion,
        status: editFormData.status,
        changelog: editFormData.changelog,
      };

      // Update in the versions list
      setVersions(
        versions.map((v) => (v.id === editingVersion.id ? updatedVersion : v))
      );

      setEditingVersion(null);
      alert("Version updated successfully!");
    } catch (error) {
      console.error("Error updating version:", error);
      alert("Failed to update version");
    }
  };

  return (
    <motion.div variants={modalVariants} initial="hidden" animate="visible">
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            fontWeight: "bold",
            fontSize: "1.25rem",
          }}
        >
          {project.project_name}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Project Summary */}
          <Card sx={{ mb: 3, backgroundColor: "#f9fafb" }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
                Project Summary
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={project.status.toUpperCase()}
                    color={
                      project.status === "approved"
                        ? "success"
                        : project.status === "review"
                        ? "warning"
                        : "info"
                    }
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Client
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {project.client_email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {project.description && (
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {project.description}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="project details tabs"
            >
              <Tab label="Versions" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Feedback" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>
          </Box>

          {/* Versions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setShowUpload(!showUpload)}
                fullWidth
              >
                Upload New Version
              </Button>
            </Box>

            {showUpload && (
              <Card sx={{ mb: 3, backgroundColor: "#f0f9ff" }}>
                <CardContent>
                  {/* File Upload */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Design File
                    </Typography>
                    <Box
                      sx={{
                        border: "2px dashed #bfdbfe",
                        borderRadius: 1,
                        p: 3,
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#f0f9ff",
                        transition: "all 0.3s",
                        "&:hover": {
                          borderColor: "#3b82f6",
                          backgroundColor: "#eff6ff",
                        },
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {uploadFile ? uploadFile.name : "Drag & drop or click to select a design file"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                        Supported: JPG, PNG, WebP, PDF (Max 10MB)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Error Message */}
                  {fileError && (
                    <Box sx={{ mb: 2, p: 1.5, backgroundColor: "#fee2e2", borderRadius: 1, border: "1px solid #fecaca" }}>
                      <Typography variant="caption" sx={{ color: "#dc2626" }}>
                        {fileError}
                      </Typography>
                    </Box>
                  )}

                  {/* Changelog */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Changelog
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Describe changes in this version..."
                      value={newVersionChangelog}
                      onChange={(e) => setNewVersionChangelog(e.target.value)}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleUploadVersion}
                      disabled={!uploadFile || !newVersionChangelog.trim()}
                    >
                      Upload Version
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowUpload(false);
                        setUploadFile(null);
                        setFileError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Versions List */}
            <List sx={{ bgcolor: "background.paper" }}>
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDownloadVersion(version)}
                          title="Download version"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEditVersion(version)}
                          title="Edit version"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                            Version {version.number}
                          </span>
                          <Chip
                            label={version.status}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", marginTop: 8, fontSize: "0.875rem" }}>
                            {version.changelog}
                          </span>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#6b7280" }}>
                            {version.date}
                          </span>
                        </span>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </TabPanel>

          {/* Feedback Tab */}
          <TabPanel value={tabValue} index={1}>
            {/* Comments List */}
            <Box sx={{ mb: 3 }}>
              {comments.length === 0 ? (
                <Card sx={{ mb: 3, backgroundColor: "#f9fafb" }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="textSecondary">
                      No feedback yet. Be the first to comment!
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment, index) => {
                  const isOwnComment = comment.author_id === currentUserId;
                  const authorInitial = comment.author?.full_name?.charAt(0)?.toUpperCase() || "?";

                  // Format relative time
                  const commentDate = new Date(comment.created_at);
                  const now = new Date();
                  const diffMs = now.getTime() - commentDate.getTime();
                  const diffMins = Math.floor(diffMs / (1000 * 60));
                  const diffHours = Math.floor(diffMins / 60);
                  const diffDays = Math.floor(diffHours / 24);

                  let formattedDate = "";
                  if (diffMins < 1) formattedDate = "Just now";
                  else if (diffMins < 60) formattedDate = `${diffMins}m ago`;
                  else if (diffHours < 24) formattedDate = `${diffHours}h ago`;
                  else if (diffDays < 7) formattedDate = `${diffDays}d ago`;
                  else formattedDate = commentDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  // Format full datetime for tooltip
                  const fullDateTime = commentDate.toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          mb: 2,
                          backgroundColor: isOwnComment ? "#f0f9ff" : "#f9fafb",
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: isOwnComment ? "#2563eb" : "#d1d5db",
                                color: isOwnComment ? "white" : "#374151",
                              }}
                            >
                              {authorInitial}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                {comment.author?.full_name || "Unknown User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: "block" }}
                              >
                                {formattedDate}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: "block", fontSize: "0.7rem", opacity: 0.7 }}
                              >
                                {fullDateTime}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ mb: comment.attachment_url ? 2 : 0 }}>
                            {comment.content}
                          </Typography>
                          {comment.attachment_url && (
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ImageIcon />}
                                href={comment.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {comment.attachment_name || "View Design"}
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </Box>

            {/* Add Comment */}
            <Card sx={{ backgroundColor: "#f9fafb" }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
                  Add Feedback
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write your feedback or note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </CardContent>
            </Card>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Version Modal */}
      {editingVersion && (
        <Dialog open={!!editingVersion} onClose={() => setEditingVersion(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Version {editingVersion.number}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Status
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  sx={{ mt: 1 }}
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Awaiting Review</option>
                  <option value="approved">Approved</option>
                </TextField>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">
                  Changelog
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editFormData.changelog}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, changelog: e.target.value })
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingVersion(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveVersionEdit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </motion.div>
  );
}
