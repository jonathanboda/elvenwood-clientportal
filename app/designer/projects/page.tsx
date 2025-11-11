"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  ViewWeek as ViewGridIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { pageVariants, containerVariants, cardVariants } from "@/lib/animations";
import NewProjectModal from "@/app/components/designer/NewProjectModal";
import ProjectDetailModal from "@/app/components/designer/ProjectDetailModal";
import InviteClientModal from "@/app/components/designer/InviteClientModal";
// @ts-ignore
import { useProjectsStore, Project } from "@/lib/store";

const statusConfig = {
  draft: {
    label: "Awaiting Projects",
    color: "default" as const,
    bgColor: "#f3f4f6",
  },
  in_progress: {
    label: "In Progress",
    color: "info" as const,
    bgColor: "#dbeafe",
  },
  review: {
    label: "Awaiting Review",
    color: "warning" as const,
    bgColor: "#fef3c7",
  },
  approved: {
    label: "Approved Designs",
    color: "success" as const,
    bgColor: "#d1fae5",
  },
};

export default function ProjectsPage() {
  const { projects, setProjects, addProject, deleteProject: deleteProjectFromStore } = useProjectsStore();
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuProject, setContextMenuProject] = useState<Project | null>(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const { data } = await response.json();
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.project_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(e.currentTarget);
    setContextMenuProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextMenuProject(null);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
    handleMenuClose();
  };

  const handleInviteClient = (project: Project) => {
    setSelectedProject(project);
    setShowInviteModal(true);
    handleMenuClose();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete project');
        }

        // Update store after successful deletion
        deleteProjectFromStore(projectId);
        handleMenuClose();
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleProjectCreated = async (projectData: {
    projectName: string;
    description: string;
    clientEmail: string;
    startDate: string;
    endDate: string;
    status: string;
  }) => {
    try {
      // Get the current session to include auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please sign in to create projects');
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
          start_date: projectData.startDate,
          // Note: end_date is not sent as it doesn't exist in the database schema
          status: projectData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { data: newProject } = await response.json();
      addProject(newProject);
      setShowNewProjectModal(false);
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            My Projects
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View and manage all your design projects
          </Typography>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Search and Actions */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNewProjectModal(true)}
              >
                New Project
              </Button>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewGridIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Status Filter */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label="All"
                onClick={() => setSelectedStatus("all")}
                variant={selectedStatus === "all" ? "filled" : "outlined"}
                color={selectedStatus === "all" ? "primary" : "default"}
              />
              {Object.entries(statusConfig).map(([key, config]) => (
                <Chip
                  key={key}
                  label={config.label}
                  onClick={() => setSelectedStatus(key)}
                  variant={selectedStatus === key ? "filled" : "outlined"}
                  color={selectedStatus === key ? "primary" : "default"}
                />
              ))}
            </Box>
          </Box>
        </Card>

        {/* Projects Grid/List */}
        {loading ? (
          <Card sx={{ p: 6, textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Loading your projects...
            </Typography>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              No projects found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Create a new project to get started"}
            </Typography>
          </Card>
        ) : viewMode === "grid" ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3}>
              {filteredProjects.map((project, index) => (
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
                            Updated: {new Date(project.updated_at).toLocaleDateString()}
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
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <Card>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                      Project Name
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                      Client
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                      Updated
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={{ padding: "16px" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {project.project_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {project.description}
                        </Typography>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <Typography variant="body2">{project.client_email}</Typography>
                      </td>
                      <td style={{ padding: "16px" }}>
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
                      </td>
                      <td style={{ padding: "16px" }}>
                        <Typography variant="caption">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, project)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Card>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleViewDetails(contextMenuProject!)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleInviteClient(contextMenuProject!)}>
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            Invite Client
          </MenuItem>
          <MenuItem onClick={() => handleDeleteProject(contextMenuProject!.id)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Modals */}
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onSuccess={handleProjectCreated}
          />
        )}

        {showDetailModal && selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedProject(null);
            }}
          />
        )}

        {showInviteModal && selectedProject && (
          <InviteClientModal
            project={selectedProject}
            onClose={() => {
              setShowInviteModal(false);
              setSelectedProject(null);
            }}
            onSuccess={() => {
              setShowInviteModal(false);
              setSelectedProject(null);
            }}
          />
        )}
      </Container>
    </motion.div>
  );
}
