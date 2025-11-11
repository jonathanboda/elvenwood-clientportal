"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { demoAuth } from "@/lib/auth-demo";
import { createClient } from "@/lib/supabase";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

interface Notification {
  id: string;
  project_id: string;
  comment_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

interface HeaderProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({ darkMode = false, onToggleTheme }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = demoAuth.getCurrentUser();
    if (user?.email) {
      setUserEmail(user.email);
    }

    // Fetch real notifications
    fetchNotifications();

    // Set up real-time subscription
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session found when fetching notifications");
        return;
      }

      console.log("Fetching notifications for session...");
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched notifications:", data.notifications?.length || 0);
        setNotifications(data.notifications || []);
      } else {
        console.error("Failed to fetch notifications:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const setupRealtimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("No user found for realtime subscription");
      return;
    }

    console.log("Setting up realtime subscription for user:", user.id);

    const channel = supabase
      .channel(`user-${user.id}-notifications`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Notification change detected:", payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };


  const handleSignOut = async () => {
    try {
      await demoAuth.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
      router.push("/signin");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_id: id }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Mark all notifications as read
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    for (const notif of unreadNotifications) {
      await markAsRead(notif.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_comment":
        return "💬";
      case "new_version":
        return "📁";
      case "invitation":
        return "📧";
      case "approval":
        return "✅";
      default:
        return "🔔";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: "background.paper", color: "text.primary" }}>
      <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", cursor: "pointer" }}>
            Elvenwood Interiors
          </Typography>
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle Button */}
          <IconButton
            onClick={onToggleTheme}
            size="small"
            sx={{
              color: "inherit",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>

          {/* Notifications Bell */}
          <div ref={notificationsRef} style={{ position: "relative" }}>
            <IconButton
              onClick={(e) => setNotificationsAnchorEl(e.currentTarget)}
              size="small"
              sx={{
                color: "inherit",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              title="Notifications"
            >
              <Badge badgeContent={unreadCount} color="error">
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  sx={{ width: 20, height: 20 }}
                >
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </Box>
              </Badge>
            </IconButton>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={() => setNotificationsAnchorEl(null)}
              PaperProps={{
                sx: {
                  maxHeight: 400,
                  width: 380,
                  maxWidth: "100%",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Menu Header */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", backgroundColor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>

              {/* Notifications List */}
              {notifications.length === 0 ? (
                <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    No notifications yet
                  </Typography>
                </Box>
              ) : (
                notifications.map((notif) => (
                  <MenuItem
                    key={notif.id}
                    component={Link}
                    href={`/project/${notif.project_id}`}
                    onClick={() => {
                      if (!notif.is_read) {
                        markAsRead(notif.id);
                      }
                      setNotificationsAnchorEl(null);
                    }}
                    sx={{
                      backgroundColor: !notif.is_read ? "action.hover" : "transparent",
                      borderBottom: 1,
                      borderColor: "divider",
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%" }}>
                      <Box sx={{ fontSize: 18, mt: 0.25 }}>
                        {getNotificationIcon(notif.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.25 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                          {formatTimeAgo(notif.created_at)}
                        </Typography>
                      </Box>
                      {!notif.is_read && (
                        <Box sx={{ width: 6, height: 6, backgroundColor: "primary.main", borderRadius: "50%", flexShrink: 0, mt: 0.75 }} />
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}

              {/* Menu Footer */}
              {unreadCount > 0 && (
                [
                  <Divider key="divider" />,
                  <MenuItem
                    key="mark-all-read"
                    onClick={() => {
                      markAllAsRead();
                      setNotificationsAnchorEl(null);
                    }}
                    sx={{
                      justifyContent: "center",
                      fontSize: 12,
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    Mark all as read
                  </MenuItem>,
                ]
              )}
            </Menu>
          </div>

          {/* User Menu */}
          {userEmail && (
            <>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
                sx={{
                  color: "inherit",
                  ml: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <PersonIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem
                  component={Link}
                  href="/profile"
                  onClick={() => setAnchorEl(null)}
                  sx={{ textDecoration: "none", color: "inherit" }}
                >
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    handleSignOut();
                  }}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.lighter",
                    },
                  }}
                >
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
