"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
// Dynamically import enhanced components
const ClientProjects = dynamic(
  () => import("@/app/components/client/ClientProjects"),
  { ssr: false, loading: () => <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={40} sx={{ mb: 2 }} /><Typography>Loading projects...</Typography></Box> }
);

interface ClientDashboardProps {
  projectId?: string | null;
}

export default function ClientDashboard({ projectId }: ClientDashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Client', avatar: '' });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from Supabase, fall back to mock data
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If a specific projectId was passed (from invitation), fetch that project from database
        if (projectId) {
          try {
            const { data, error } = await supabase
              .from('projects')
              .select('*')
              .eq('id', projectId)
              .single();

            if (error) {
              console.warn(`Project ${projectId} not found in database:`, error);
              // Fall back to demo data
              setProjects([
                {
                  id: projectId,
                  project_name: "Design Project",
                  description: "View the project designs below",
                  designer_name: "Designer",
                  status: "in_progress",
                  current_version: 1,
                  total_versions: 1,
                  last_updated: new Date().toISOString(),
                }
              ]);
            } else if (data) {
              setProjects([data]);
            }
          } catch (err) {
            console.error("Error fetching project:", err);
          }
        } else {
          // Load all client-specific projects from database
          try {
            console.log('[ClientDashboard] Fetching projects for user:', user.id);
            const { data, error } = await supabase
              .from('projects')
              .select('*')
              .eq('client_id', user.id)
              .order('created_at', { ascending: false });

            console.log('[ClientDashboard] Query result:', { data, error, userId: user.id });

            if (error) {
              console.warn('[ClientDashboard] Error fetching client projects:', error);
              setProjects([]);
            } else if (data && data.length > 0) {
              console.log('[ClientDashboard] Found projects:', data.length);

              // Fetch project thumbnails from versions
              const projectsWithThumbnails = await Promise.all(
                data.map(async (project: any) => {
                  // Fetch the latest version for thumbnail
                  const { data: versions } = await supabase
                    .from('versions')
                    .select('file_path, file_name')
                    .eq('project_id', project.id)
                    .order('version_number', { ascending: false })
                    .limit(1);

                  let thumbnailUrl = '/placeholder-project.jpg';
                  if (versions && versions.length > 0) {
                    const version = versions[0];
                    thumbnailUrl = `/api/download?path=${encodeURIComponent(version.file_path)}&name=${encodeURIComponent(version.file_name)}`;
                  }

                  // Fetch designer info
                  const { data: designer } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', project.designer_id)
                    .single();

                  return {
                    id: project.id,
                    name: project.project_name,
                    description: project.description || 'No description',
                    status: project.status || 'in_progress',
                    thumbnailUrl,
                    designer: {
                      name: designer?.full_name || 'Designer',
                      avatar: '/placeholder-avatar.jpg'
                    },
                    lastUpdated: project.updated_at || project.created_at,
                    currentVersion: 1,
                    totalVersions: 1
                  };
                })
              );
              setProjects(projectsWithThumbnails);
              // Cache in localStorage
              localStorage.setItem("clientProjects", JSON.stringify(projectsWithThumbnails));
            } else {
              // No projects found - show empty state
              setProjects([]);
              console.log(`[ClientDashboard] No projects found for client. User ID: ${user.id}, Email: ${user.email}`);
            }
          } catch (err) {
            console.error("Error loading client projects:", err);
            setProjects([]);
          }
        }

        // Fetch recent activities (new versions added by designers)
        try {
          // First, get all client's projects
          const { data: clientProjects } = await supabase
            .from('projects')
            .select('id')
            .eq('client_id', user.id);

          if (clientProjects && clientProjects.length > 0) {
            const projectIds = clientProjects.map(p => p.id);

            // Then fetch versions for those projects
            const { data: versionsData, error: versionsError } = await supabase
              .from('versions')
              .select(`
                id,
                version_number,
                created_at,
                project_id,
                file_path,
                file_name,
                projects (
                  project_name,
                  designer_id
                )
              `)
              .in('project_id', projectIds)
              .order('created_at', { ascending: false })
              .limit(10);

            if (!versionsError && versionsData) {
              // Fetch designer info and comments for each activity
              const activitiesWithDetails = await Promise.all(
                versionsData
                  .filter((version: any) => version.projects) // Filter out versions without project data
                  .map(async (version: any) => {
                    const { data: designer } = await supabase
                      .from('profiles')
                      .select('full_name')
                      .eq('id', version.projects.designer_id)
                      .single();

                    // Fetch comments for this version
                    const { data: comments } = await supabase
                      .from('comments')
                      .select('id, comment, attachment_url, attachment_name, created_at')
                      .eq('version_id', version.id)
                      .order('created_at', { ascending: false })
                      .limit(3); // Show up to 3 recent comments

                    return {
                      id: version.id,
                      type: 'new_version',
                      versionNumber: version.version_number,
                      projectName: version.projects.project_name,
                      projectId: version.project_id,
                      designerName: designer?.full_name || 'Designer',
                      timestamp: version.created_at,
                      filePath: version.file_path,
                      fileName: version.file_name,
                      comments: comments || [],
                    };
                  })
              );
              setActivities(activitiesWithDetails);
            }
          }
        } catch (err) {
          console.error("Error loading activities:", err);
        }
      }
    } catch (err) {
      console.log("Using mock data for demo");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDesign = (projectId: string) => {
    // Navigate to the project detail page
    router.push(`/project/${projectId}`);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading client portal...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          Design Collaboration Portal
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and collaborate on your design projects
        </Typography>
      </Box>

      {/* Recent Activity Feed */}
      {activities.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 3 }}>
            Recent Activity
          </Typography>
          <Box>
            {activities.map((activity, index) => (
                <Card
                  key={activity.id}
                  sx={{
                    mb: 3,
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 3,
                    },
                    transition: "box-shadow 0.3s",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {/* Post Header */}
                    <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        {activity.designerName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {activity.designerName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTimeAgo(activity.timestamp)} • <strong>{activity.projectName}</strong> • Version {activity.versionNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label="New"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600, height: 24 }}
                      />
                    </Box>

                    {/* Design Image */}
                    {activity.filePath && activity.fileName && (
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "grey.100",
                          cursor: "pointer",
                          position: "relative",
                        }}
                        onClick={() => window.open(`/api/download?path=${encodeURIComponent(activity.filePath)}&name=${encodeURIComponent(activity.fileName)}`, '_blank')}
                      >
                        <Box
                          component="img"
                          src={`/api/download?path=${encodeURIComponent(activity.filePath)}&name=${encodeURIComponent(activity.fileName)}`}
                          alt={activity.fileName}
                          sx={{
                            width: "100%",
                            maxHeight: 500,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </Box>
                    )}

                    {/* Action Bar */}
                    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewDesign(activity.projectId)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: "text.primary",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        💬 {activity.comments.length} {activity.comments.length === 1 ? 'Comment' : 'Comments'}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewDesign(activity.projectId)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: "text.primary",
                          ml: 2,
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        👁️ View Full Project
                      </Button>
                    </Box>

                    {/* Comments Section */}
                    {activity.comments && activity.comments.length > 0 && (
                      <Box sx={{ px: 2, py: 2, backgroundColor: "grey.50" }}>
                        {activity.comments.map((comment: any, commentIndex: number) => (
                          <Box
                            key={comment.id}
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              mb: commentIndex < activity.comments.length - 1 ? 2 : 0,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "secondary.main",
                                fontSize: 14,
                              }}
                            >
                              💬
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: 2,
                                  p: 1.5,
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                }}
                              >
                                <Typography variant="body2" sx={{ color: "text.primary" }}>
                                  {comment.comment}
                                </Typography>
                                {comment.attachment_url && comment.attachment_name && (
                                  <Box sx={{ mt: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<ImageIcon />}
                                      href={comment.attachment_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.75rem",
                                        borderRadius: 1,
                                      }}
                                    >
                                      {comment.attachment_name}
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                              <Typography variant="caption" color="textSecondary" sx={{ ml: 1.5, mt: 0.5, display: "block" }}>
                                {formatTimeAgo(comment.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Projects Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 3 }}>
          Your Projects
        </Typography>
        <ClientProjects
          projects={projects}
          currentUser={currentUser}
          onViewDesign={handleViewDesign}
        />
      </Box>
    </Container>
  );
}
