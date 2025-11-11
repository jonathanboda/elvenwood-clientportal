"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  Save,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  avatar: string;
  joinDate: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    avatar: "",
    joinDate: "",
  });

  const [password, setPassword] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState<ProfileData>(profile);

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
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setErrorMessage("Failed to load profile data");
        } else if (profileData) {
          const nameParts = (profileData.full_name || "").split(" ");
          const newProfile = {
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: profileData.phone || "",
            company: profileData.company || "",
            location: profileData.location || "",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.full_name || "User"}`,
            joinDate: profileData.created_at?.split("T")[0] || "",
          };
          setProfile(newProfile);
          setEditForm(newProfile);
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

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validate form
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setErrorMessage("First name and last name are required");
      setIsSaving(false);
      return;
    }

    if (!editForm.email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setIsSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: `${editForm.firstName} ${editForm.lastName}`,
          phone: editForm.phone,
          company: editForm.company,
          location: editForm.location,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        setErrorMessage("Failed to update profile");
        setIsSaving(false);
        return;
      }

      setProfile(editForm);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setIsSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to update profile");
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarUrl = event.target?.result as string;
        setEditForm({ ...editForm, avatar: avatarUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    // Validate passwords
    if (!password.currentPassword.trim()) {
      setErrorMessage("Please enter your current password");
      return;
    }

    if (!password.newPassword.trim()) {
      setErrorMessage("Please enter a new password");
      return;
    }

    if (password.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (password.currentPassword === password.newPassword) {
      setErrorMessage("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.newPassword,
      });

      if (error) {
        console.error("Error changing password:", error);
        setErrorMessage("Failed to change password");
        setIsChangingPassword(false);
        return;
      }

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      setSuccessMessage("Password changed successfully!");
      setIsChangingPassword(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to change password");
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <Link
            href="/client-portal"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8 text-white">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={isEditing ? editForm.avatar : profile.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-white text-blue-600 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                    <Upload className="w-4 h-4" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? editForm.firstName : profile.firstName} {isEditing ? editForm.lastName : profile.lastName}
                </h2>
                <p className="text-blue-100">
                  {isEditing ? editForm.company : profile.company}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) =>
                        handleProfileChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) =>
                        handleProfileChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) =>
                        handleProfileChange("company", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.company}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        handleProfileChange("location", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {formatDate(profile.joinDate)}
                </span>
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="border-t border-gray-200 pt-6 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm(profile);
                    setErrorMessage("");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                      setErrorMessage("");
                    }}
                    disabled={isSaving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
              </div>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Change Password
                </button>
              )}
            </div>
          </div>

          {showPasswordForm ? (
            <div className="p-8 space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Enter your current password and choose a new password
              </p>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={password.currentPassword}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={password.newPassword}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={password.confirmPassword}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPassword({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrorMessage("");
                  }}
                  disabled={isChangingPassword}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-gray-600 text-sm">
              <p>Keep your account secure by using a strong, unique password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
