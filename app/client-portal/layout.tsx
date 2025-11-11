"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ImageIcon,
  User,
  LogOut,
  Menu,
  Bell,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  project_id?: string;
  comment_id?: string;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/client-portal",
    icon: LayoutDashboard,
  },
  {
    label: "Design Viewer",
    href: "/client-portal/design-viewer",
    icon: ImageIcon,
  },
  {
    label: "Profile",
    href: "/client-portal/profile",
    icon: User,
  },
];

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread" | "read">("all");
  const notificationRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch notifications on mount and set up real-time subscription
  useEffect(() => {
    fetchNotifications();

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Use Supabase to sign out
      await supabase.auth.signOut();
      // Clear localStorage
      localStorage.removeItem("userRole");
      // Redirect to sign in page
      router.push('/signin');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still redirect even if logout fails
      router.push('/signin');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
    }

    if (showNotificationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotificationDropdown]);

  // Filter notifications based on read status
  const filteredNotifications = notifications.filter((notif) => {
    if (notificationFilter === "unread") return !notif.is_read;
    if (notificationFilter === "read") return notif.is_read;
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce(
    (acc, notif) => {
      const notifDate = new Date(notif.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - today.getDay());

      let dateGroup = "Older";
      if (notifDate >= today) dateGroup = "Today";
      else if (notifDate >= yesterday) dateGroup = "Yesterday";
      else if (notifDate >= weekStart) dateGroup = "This Week";

      const existing = acc.find((g) => g.date === dateGroup);
      if (existing) {
        existing.notifications.push(notif);
      } else {
        acc.push({ date: dateGroup, notifications: [notif] });
      }
      return acc;
    },
    [] as Array<{ date: string; notifications: typeof notifications }>
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking notifications as read:", error);
      } else {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleNotificationRead = async (id: string) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      if (!notif) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: !notif.is_read })
        .eq("id", id);

      if (error) {
        console.error("Error toggling notification:", error);
      } else {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/client-portal" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              EI
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-gray-900 text-sm">Elvenwood</p>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() =>
                  setShowNotificationDropdown(!showNotificationDropdown)
                }
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-sm">
                      Notifications
                    </h3>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-gray-200 px-4">
                    {["all", "unread", "read"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() =>
                          setNotificationFilter(
                            filter as "all" | "unread" | "read"
                          )
                        }
                        className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide transition-colors border-b-2 ${
                          notificationFilter === filter
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-600 border-transparent hover:text-gray-900"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        {filter === "unread" && unreadCount > 0 && (
                          <span className="ml-1 text-blue-600">({unreadCount})</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {groupedNotifications.length > 0 ? (
                      groupedNotifications.map((group) => (
                        <div key={group.date}>
                          {/* Date Group Header */}
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 sticky top-0">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              {group.date}
                            </p>
                          </div>

                          {/* Notifications in group */}
                          {group.notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                // Mark as read if unread
                                if (!notif.is_read) {
                                  await toggleNotificationRead(notif.id);
                                }
                                setShowNotificationDropdown(false);
                                // Navigate to design viewer - the main list where they can see all projects
                                router.push(`/client-portal/design-viewer`);
                              }}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notif.is_read ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Unread Indicator */}
                                {!notif.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                                )}
                                {notif.is_read && (
                                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 flex-shrink-0 opacity-0" />
                                )}

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 font-medium">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(() => {
                                      const notifDate = new Date(notif.created_at);
                                      const now = new Date();
                                      const diffMs =
                                        now.getTime() - notifDate.getTime();
                                      const diffMins = Math.floor(
                                        diffMs / (1000 * 60)
                                      );
                                      const diffHours = Math.floor(diffMins / 60);
                                      const diffDays = Math.floor(diffHours / 24);

                                      if (diffMins < 1) return "Just now";
                                      if (diffMins < 60)
                                        return `${diffMins}m ago`;
                                      if (diffHours < 24)
                                        return `${diffHours}h ago`;
                                      return `${diffDays}d ago`;
                                    })()}
                                  </p>
                                </div>

                                {/* Mark as Read/Unread */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNotificationRead(notif.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                  title={
                                    notif.is_read
                                      ? "Mark as unread"
                                      : "Mark as read"
                                  }
                                >
                                  <X className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {unreadCount > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={markAllAsRead}
                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors py-2 rounded hover:bg-blue-50"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=ClientUser"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
