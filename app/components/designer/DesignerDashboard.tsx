"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as PendingIcon,
  HourglassBottom as RunningIcon,
  RateReview as ReviewIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { createClient } from "@/lib/supabase";
// @ts-ignore
import { useProjectsStore, Project } from "@/lib/store";
import { containerVariants, cardVariants } from "@/lib/animations";
import InviteClientModal from "./InviteClientModal";
import NewProjectModal from "./NewProjectModal";
import ProjectDetailModal from "./ProjectDetailModal";
import ClientDashboard from "@/app/components/client/ClientDashboard";

const statusConfig = {
  draft: {
    label: "Awaiting Projects",
    color: "default" as const,
    icon: PendingIcon,
    bgColor: "#f3f4f6",
  },
  in_progress: {
    label: "In Progress",
    color: "info" as const,
    icon: RunningIcon,
    bgColor: "#dbeafe",
  },
  review: {
    label: "Awaiting Review",
    color: "warning" as const,
    icon: ReviewIcon,
    bgColor: "#fef3c7",
  },
  approved: {
    label: "Approved Designs",
    color: "success" as const,
    icon: CheckCircleIcon,
    bgColor: "#d1fae5",
  },
};

export default function DesignerDashboard({ onRoleChange }: { onRoleChange?: (role: "designer" | "client") => void }) {
  const router = useRouter();
  const supabase = createClient();
  const { projects, setProjects, setSelectedProject } = useProjectsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProjectLocal] = useState<any>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuProject, setContextMenuProject] = useState<any>(
    null
  );
  const [userRole, setUserRole] = useState<"designer" | "client">("designer");

  const handleRoleChange = (newRole: "designer" | "client") => {
    setUserRole(newRole);
    // Save to localStorage so sidebar can read it
    localStorage.setItem("userRole", newRole);
    onRoleChange?.(newRole);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // Fetch projects from API (Supabase database)
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const { data } = await response.json();
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = async (projectData: any) => {
    try {
      // Call API to create the project in Supabase
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to create a project');
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          project_name: projectData.projectName,
          description: projectData.description,
          client_email: projectData.clientEmail,
          status: projectData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { data: newProject } = await response.json();

      // Add the new project to the projects list
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);

      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: any
  ) => {
    setAnchorEl(event.currentTarget);
    setContextMenuProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextMenuProject(null);
  };

  const handleViewDetails = (project: any) => {
    setSelectedProjectLocal(project);
    setSelectedProject(project as any);
    setShowDetailModal(true);
    handleMenuClose();
  };

  const handleInviteClient = (project: any) => {
    setSelectedProjectLocal(project);
    setSelectedProject(project as any);
    setShowInviteModal(true);
    handleMenuClose();
  };

  const handleDeleteProject = async (project: any) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.project_name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      // Remove from local state
      const updatedProjects = projects.filter((p) => p.id !== project.id);
      setProjects(updatedProjects);

      // Close the menu
      handleMenuClose();

      // Show success message
      setError(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete project');
    }
  };

  const getStatusCount = (status: string) => {
    return projects.filter((p) => p.status === status).length;
  };

  const summaryCards = [
    { status: "draft", count: getStatusCount("draft") },
    { status: "in_progress", count: getStatusCount("in_progress") },
    { status: "review", count: getStatusCount("review") },
    { status: "approved", count: getStatusCount("approved") },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <Box sx={{ mb: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              {userRole === "designer" ? "Designer Dashboard" : "Client Portal"}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {userRole === "designer"
                ? "Manage your projects and collaborate with clients"
                : "View and collaborate on your design projects"
              }
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={userRole === "designer" ? "contained" : "outlined"}
                onClick={() => handleRoleChange("designer")}
                size="small"
              >
                Designer
              </Button>
              <Button
                variant={userRole === "client" ? "contained" : "outlined"}
                onClick={() => handleRoleChange("client")}
                size="small"
              >
                Client
              </Button>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {userRole === "client" ? (
          <ClientDashboard />
        ) : (
          <>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {summaryCards.map((card, index) => {
            const config = statusConfig[card.status as keyof typeof statusConfig];
            const Icon = config.icon;

            return (
              <Grid item xs={12} sm={6} md={3} key={card.status}>
                <motion.div
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card
                    sx={{
                      backgroundColor: config.bgColor,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "textSecondary" }}
                        >
                          {config.label}
                        </Typography>
                        <Icon sx={{ color: "primary.main", fontSize: 24 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {card.count}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowNewProjectModal(true)}
          >
            New Project
          </Button>
        </Box>

        {/* Projects Section */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Card sx={{ p: 6, textAlign: "center" }}>
            <TrendingUpIcon
              sx={{ fontSize: 64, color: "textSecondary", mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary">
              No projects yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Create a new project to get started with your first design
            </Typography>
          </Card>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3}>
              {(projects as any[]).map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              flex: 1,
                              pr: 2,
                            }}
                          >
                            {project.project_name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, project)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 2 }}
                        >
                          {project.description || "No description"}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={
                              statusConfig[project.status as keyof typeof statusConfig]
                                ?.label || project.status
                            }
                            color={
                              statusConfig[project.status as keyof typeof statusConfig]
                                ?.color || "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="caption" color="textSecondary">
                          Client: {project.client_email}
                        </Typography>
                        {project.updated_at && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Updated:{" "}
                            {new Date(project.updated_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleViewDetails(project)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleInviteClient(project)}
                        >
                          Invite Client
                        </Button>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleViewDetails(contextMenuProject!)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleInviteClient(contextMenuProject!)}>
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Invite Client
          </MenuItem>
          <MenuItem onClick={() => handleDeleteProject(contextMenuProject!)} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </Menu>

        {/* Modals */}
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onSuccess={handleProjectCreated}
          />
        )}

        {showInviteModal && selectedProject && (
          <InviteClientModal
            project={selectedProject}
            onClose={() => {
              setShowInviteModal(false);
              setSelectedProjectLocal(null);
            }}
            onSuccess={() => {
              setShowInviteModal(false);
              setSelectedProjectLocal(null);
            }}
          />
        )}

        {showDetailModal && selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedProjectLocal(null);
            }}
          />
        )}
        </>
        )}
      </motion.div>
    </Container>
  );
}
