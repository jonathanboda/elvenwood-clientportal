"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Menu as MenuComponent,
  MenuItem as MenuItemComponent,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Mail as MailIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  HourglassBottom as ActivityIcon,
} from "@mui/icons-material";
import { pageVariants, containerVariants, cardVariants } from "@/lib/animations";

interface User {
  id: string;
  name: string;
  email: string;
  role: "designer" | "client" | "admin";
  status: "active" | "inactive" | "pending";
  joinDate: string;
  lastActive: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  designer: string;
  status: string;
  created: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "designer" as "designer" | "client" | "admin",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setNewUserData({ name: "", email: "", role: "designer" });
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowUserDialog(true);
    handleMenuClose();
  };

  const handleSaveUser = () => {
    if (!newUserData.name || !newUserData.email) return;

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: newUserData.name,
                email: newUserData.email,
                role: newUserData.role,
              }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        status: "pending",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
    }

    setShowUserDialog(false);
  };

  const handleDeactivateUser = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
    handleMenuClose();
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
      handleMenuClose();
    }
  };

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: PeopleIcon,
      color: "#2563eb",
    },
    {
      label: "Active Projects",
      value: projects.filter((p) => p.status === "in_progress").length,
      icon: AssignmentIcon,
      color: "#10b981",
    },
    {
      label: "Pending Users",
      value: users.filter((u) => u.status === "pending").length,
      icon: ActivityIcon,
      color: "#f59e0b",
    },
  ];

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
            Administration Panel
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage users, projects, and system settings
          </Typography>
        </Box>

        {/* Stats */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={stat.label}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      sx={{
                        backgroundColor: "#f9fafb",
                        border: `2px solid ${stat.color}20`,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {stat.label}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                              {stat.value}
                            </Typography>
                          </Box>
                          <stat.icon sx={{ fontSize: 40, color: stat.color, opacity: 0.2 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>

        {/* Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Users" id="tab-0" />
              <Tab label="Projects" id="tab-1" />
              <Tab label="Activity Log" id="tab-2" />
            </Tabs>
          </Box>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Join Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          size="small"
                          color={
                            user.status === "active"
                              ? "success"
                              : user.status === "pending"
                              ? "warning"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Project Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Designer</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>{project.designer}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          size="small"
                          color={
                            project.status === "approved"
                              ? "success"
                              : project.status === "review"
                              ? "warning"
                              : "info"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{project.created}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Activity Log Tab */}
          <TabPanel value={tabValue} index={2}>
            {activityLogs.map((log) => (
              <Card key={log.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {log.user} • {log.action.replace(/_/g, " ")}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {log.details}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {log.timestamp}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </TabPanel>
        </Card>

        {/* User Dialog */}
        <Dialog
          open={showUserDialog}
          onClose={() => setShowUserDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newUserData.name}
              onChange={(e) =>
                setNewUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUserData.email}
              onChange={(e) =>
                setNewUserData((prev) => ({ ...prev, email: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUserData.role}
                label="Role"
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    role: e.target.value as "designer" | "client" | "admin",
                  }))
                }
              >
                <MenuItem value="designer">Designer</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUserDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveUser}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Context Menu */}
        <MenuComponent
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItemComponent onClick={() => handleEditUser(selectedUser!)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItemComponent>
          <MenuItemComponent onClick={() => handleDeactivateUser(selectedUser!)}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedUser?.status === "active" ? "Deactivate" : "Activate"}
          </MenuItemComponent>
          <MenuItemComponent onClick={() => handleDeleteUser(selectedUser!)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItemComponent>
        </MenuComponent>
      </Container>
    </motion.div>
  );
}
