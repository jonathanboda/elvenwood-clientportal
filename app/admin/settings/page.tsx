"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "",
    appDescription: "",
    contactEmail: "",
    phone: "",
    notificationsEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
    themeColor: "#2563eb",
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Save to backend would go here
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage application settings and configuration
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PaletteIcon sx={{ mr: 1, color: "#2563eb" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  General Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Application Name"
                  value={settings.appName}
                  onChange={(e) =>
                    handleInputChange("appName", e.target.value)
                  }
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={settings.appDescription}
                  onChange={(e) =>
                    handleInputChange("appDescription", e.target.value)
                  }
                  multiline
                  rows={3}
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={settings.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  size="small"
                />

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Theme Color
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: settings.themeColor,
                        borderRadius: 1,
                        cursor: "pointer",
                        border: "2px solid #e5e7eb",
                      }}
                    />
                    <TextField
                      size="small"
                      value={settings.themeColor}
                      onChange={(e) =>
                        handleInputChange("themeColor", e.target.value)
                      }
                      placeholder="#2563eb"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1, color: "#2563eb" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notification Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificationsEnabled}
                      onChange={(e) =>
                        handleInputChange(
                          "notificationsEnabled",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleInputChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Email Notifications"
                />

                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Notification Preferences
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f9fafb",
                    borderRadius: 1,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Users will receive notifications for:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Project updates</li>
                    <li>New feedback on designs</li>
                    <li>Client invitations</li>
                    <li>Design approvals</li>
                  </ul>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: "#2563eb" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        handleInputChange("maintenanceMode", e.target.checked)
                      }
                    />
                  }
                  label="Maintenance Mode"
                />

                <Typography variant="body2" color="textSecondary">
                  When enabled, only administrators can access the platform.
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#fef3c7",
                    borderRadius: 1,
                    border: "1px solid #fcd34d",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⚠️ Warning
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Enabling maintenance mode will prevent all users from accessing
                    the platform.
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Password Policy
                  </Typography>
                  <TextField
                    fullWidth
                    label="Minimum Password Length"
                    type="number"
                    defaultValue={8}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Application Version:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    2.0.0
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Environment:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Development
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Database:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Connected
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Storage:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Configured
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" color="inherit">
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            backgroundColor: "#2563eb",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}
