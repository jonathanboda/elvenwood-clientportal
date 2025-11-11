import React, { useState } from 'react';
import { User, Project } from '../../types.ts';
import { Mail, Briefcase, Building, Edit, FolderKanban, CheckCircle, Save, X, Lock, Upload, Eye, EyeOff } from 'lucide-react';

interface UserProfileProps {
  user: User;
  projects: Project[];
}

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl border border-light-border dark:border-dark-border flex items-center gap-4 hover:shadow-lg transition-shadow">
    <div className="p-3 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20">
      <Icon className="h-6 w-6 text-brand-accent" />
    </div>
    <div>
      <p className="text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{label}</p>
    </div>
  </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ user, projects }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const activeProjects = projects.length - completedProjects;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save profile
      console.log('Saving profile:', formData, avatarFile);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      alert('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API call to change password
      console.log('Changing password');
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsChangingPassword(false);
      alert('Password changed successfully');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      company: user.company || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text">User Profile</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Manage your account settings and personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="lg:col-span-1">
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8 text-center border border-light-border dark:border-dark-border">
            {/* Avatar Section */}
            <div className="relative mb-6 inline-block">
              <img
                src={avatarPreview || user.avatarUrl}
                alt={user.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-brand-accent shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-3 bg-brand-accent text-white rounded-full cursor-pointer hover:bg-brand-dark transition-colors shadow-lg">
                  <Upload size={20} />
                  <input
                    type="file"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            {!isEditing && (
              <>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">{user.name}</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">{user.role}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-3">{user.email}</p>
                {user.company && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{user.company}</p>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-accent text-white font-medium py-2.5 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Details & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Information */}
          {isEditing ? (
            <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8 border border-light-border dark:border-dark-border">
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Edit Profile</h3>

              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-light-text dark:text-dark-text"
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Email (Read-only)</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed"
                  />
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">Contact support to change your email</p>
                </div>

                {/* Company Field */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-light-text dark:text-dark-text"
                    placeholder="Your company name"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-accent text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-light-bg-secondary dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-2.5 px-4 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors text-sm"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8 border border-light-border dark:border-dark-border">
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
                  <Mail className="w-5 h-5 text-brand-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Email</p>
                    <p className="text-light-text dark:text-dark-text font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
                  <Briefcase className="w-5 h-5 text-brand-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Role</p>
                    <p className="text-light-text dark:text-dark-text font-medium">{user.role}</p>
                  </div>
                </div>

                {user.company && (
                  <div className="flex items-center gap-4">
                    <Building className="w-5 h-5 text-brand-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Company</p>
                      <p className="text-light-text dark:text-dark-text font-medium">{user.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Section */}
          <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8 border border-light-border dark:border-dark-border">
            {!isChangingPassword ? (
              <>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6 flex items-center gap-2">
                  <Lock size={20} />
                  Security
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Keep your account secure by updating your password regularly.
                </p>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2.5 bg-brand-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  Change Password
                </button>
              </>
            ) : (
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Change Password</h3>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-light-text dark:text-dark-text pr-10"
                    />
                    <button
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new"
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-light-text dark:text-dark-text pr-10"
                      placeholder="At least 8 characters"
                    />
                    <button
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm"
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-light-text dark:text-dark-text pr-10"
                    />
                    <button
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-accent text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Lock size={16} />
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ current: '', new: '', confirm: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-light-bg-secondary dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-2.5 px-4 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors text-sm"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Project Statistics */}
          <div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Project Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard label="Active Projects" value={activeProjects} icon={FolderKanban} />
              <StatCard label="Completed Projects" value={completedProjects} icon={CheckCircle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;