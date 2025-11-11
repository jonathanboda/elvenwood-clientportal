"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { pageVariants } from "@/lib/animations";
import { createClient } from "@/lib/supabase";

export default function DesignerProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "",
    avatarUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/signin");
          return;
        }

        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setErrorMessage("Failed to load profile data");
        } else if (profile) {
          setProfileData({
            name: profile.full_name || "",
            email: user.email || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            specialization: profile.specialization || "",
            avatarUrl: profile.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.name,
          phone: profileData.phone,
          bio: profileData.bio,
          specialization: profileData.specialization,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        setErrorMessage("Failed to update profile");
        return;
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage("Passwords do not match!");
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setErrorMessage("Password must be at least 8 characters!");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        console.error("Error changing password:", error);
        setErrorMessage("Failed to change password");
        return;
      }

      setSuccessMessage("Password changed successfully!");
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to change password");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload a JPG or PNG image.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrorMessage("File is too large. Maximum size is 5MB.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();

      // Update profile with avatar URL
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: data.data.url,
            avatar_path: data.data.storagePath,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating profile avatar:", updateError);
          setErrorMessage("File uploaded but failed to update profile");
          setTimeout(() => setErrorMessage(""), 4000);
        } else {
          setSuccessMessage("Profile photo updated successfully!");
          setTimeout(() => setSuccessMessage(""), 4000);
          // Refresh the page to show new avatar
          window.location.reload();
        }
      }

      // Reset file input
      event.target.value = "";
    } catch (error: any) {
      // Handle different error types
      let errorMsg = "Failed to upload file. Please try again.";

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMsg = "Cannot connect to server. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading profile...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            Designer Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your profile information and account settings
          </Typography>
        </Box>

        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Profile Picture Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              Profile Picture
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={profileData.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: "#2563eb",
                  fontSize: "2.5rem",
                }}
              >
                {!profileData.avatarUrl && (profileData.name.split(" ").map(n => n[0]).join("").toUpperCase() || "?")}
              </Avatar>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                component="label"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Button>
              <Typography variant="caption" color="textSecondary">
                Accepted formats: JPG, PNG (Max 5MB)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Personal Information
              </Typography>
              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </Box>

            {isEditing && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You are in edit mode. Make changes and click Save to update.
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Name */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Full Name
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={profileData.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {profileData.name}
                  </Typography>
                )}
              </Box>

              {/* Email */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {profileData.email}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Email cannot be changed from this page
                </Typography>
              </Box>

              {/* Phone */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Phone Number
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {profileData.phone}
                  </Typography>
                )}
              </Box>

              {/* Role */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Role
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Interior Designer
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Role is assigned by administrator
                </Typography>
              </Box>

              <Divider />

              {/* Bio */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Professional Bio
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {profileData.bio}
                  </Typography>
                )}
              </Box>

              {/* Specialization */}
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Specialization
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={profileData.specialization}
                    onChange={(e) => handleProfileChange("specialization", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {profileData.specialization}
                  </Typography>
                )}
              </Box>

              {isEditing && (
                <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              Security
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Password */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Password
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: "block" }}>
                  Last changed 3 months ago
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Box>

              <Divider />

              {/* Two-Factor Authentication */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Not currently enabled
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Enable
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              helperText="Password must be at least 8 characters"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
