"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";

interface Version {
  id: string;
  version_number: number;
  changelog: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface VersionSectionProps {
  version: Version;
  onViewDesign: (versionId: string) => void;
}

const VersionSection: React.FC<VersionSectionProps> = ({
  version,
  onViewDesign,
}) => {
  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, width: "100%" }}>
          {/* Version Badge */}
          <Paper
            sx={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            v{version.version_number}
          </Paper>

          {/* Version Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 600 }}>
                Version {version.version_number}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {new Date(version.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Box>

          {/* File Name */}
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography variant="caption" color="textSecondary">
              File
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
              {version.file_name}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ width: "100%" }}>
          {/* Changelog */}
          {version.changelog && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                What's New
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {version.changelog}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={() => onViewDesign(version.id)}
              fullWidth
            >
              View Design
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

interface Project {
  id: string;
  project_name: string;
  description: string;
  status: string;
  designer: {
    full_name: string;
    email: string;
  };
  versions: Version[];
}

export default function DesignViewerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      // Fetch projects for the current client
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          project_name,
          description,
          status,
          designer:profiles!projects_designer_id_fkey(full_name, email),
          versions(
            id,
            version_number,
            changelog,
            file_name,
            file_path,
            created_at
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDesign = (versionId: string) => {
    router.push(`/client-portal/design-viewer/view/${versionId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading design viewer...</Typography>
        </Box>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            No projects available
          </Typography>
          <Typography color="textSecondary">
            Projects you're invited to will appear here.
          </Typography>
          <Button
            component={Link}
            href="/client-portal"
            sx={{ mt: 2 }}
            variant="contained"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/client-portal"
          startIcon={<ArrowBackIcon />}
          color="primary"
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          My Projects
        </Typography>
        <Typography color="textSecondary">
          View and track all your design projects
        </Typography>
      </Box>

      {/* Projects List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {projects.map((project) => {
          const totalVersions = project.versions?.length || 0;

          return (
            <Paper key={project.id} elevation={1} sx={{ p: 4 }}>
              {/* Project Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {project.project_name}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>

                {/* Project Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Status
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {project.status}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DescriptionIcon color="info" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Design Versions
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {totalVersions}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon color="secondary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Designer
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {project.designer?.full_name || "Designer"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Design Versions */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Design Versions
                </Typography>

                {project.versions && project.versions.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {project.versions.map((version) => (
                      <VersionSection
                        key={version.id}
                        version={version}
                        onViewDesign={handleViewDesign}
                      />
                    ))}
                  </Box>
                ) : (
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography color="textSecondary">
                        No design versions yet. Your designer will upload versions here.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Container>
  );
}
