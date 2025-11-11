"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  SupervisorAccount as SupervisorAccountIcon,
  ExpandMore as ChevronDownIcon,
  ExpandLess as ChevronUpIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useUIStore } from "@/lib/store";
import { motion } from "framer-motion";

const DRAWER_WIDTH = 280;

const designerMenuItems = [
  {
    label: "Designer",
    icon: DashboardIcon,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
      { label: "Projects", href: "/designer/projects", icon: AssignmentIcon },
      { label: "Profile", href: "/designer/profile", icon: PersonIcon },
    ],
  },
  {
    label: "Administration",
    icon: SupervisorAccountIcon,
    items: [
      { label: "Admin Panel", href: "/admin", icon: SupervisorAccountIcon },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

const clientMenuItems = [
  {
    label: "Projects",
    icon: AssignmentIcon,
    items: [
      { label: "My Projects", href: "/client-portal", icon: DashboardIcon },
      { label: "Design Viewer", href: "/client-portal/design-viewer", icon: AssignmentIcon },
    ],
  },
  {
    label: "Account",
    icon: PersonIcon,
    items: [
      { label: "Profile", href: "/client-portal/profile", icon: PersonIcon },
    ],
  },
];

export default function Sidebar({ userRole: propsUserRole = "designer" }: { userRole?: "designer" | "client" }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [userRole, setUserRole] = useState<"designer" | "client">(propsUserRole);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    userRole === "client" ? "Projects" : "Designer"
  );

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "client") {
        setUserRole("client");
        setExpandedMenu("Projects");
      } else {
        setUserRole("designer");
        setExpandedMenu("Designer");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check on mount - only use "client" if explicitly set
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "client") {
      setUserRole("client");
      setExpandedMenu("Projects");
    } else {
      setUserRole("designer");
      setExpandedMenu("Designer");
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const menuItems = userRole === "client" ? clientMenuItems : designerMenuItems;

  const handleMenuToggle = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const drawerContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          EI
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Elvenwood
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Interior Design
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List sx={{ px: 1 }}>
        {menuItems.map((menu) => {
          const MenuIcon = menu.icon;
          const isExpanded = expandedMenu === menu.label;

          return (
            <Box key={menu.label}>
              <ListItemButton
                onClick={() => handleMenuToggle(menu.label)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MenuIcon />
                </ListItemIcon>
                <ListItemText
                  primary={menu.label}
                  primaryTypographyProps={{
                    variant: "subtitle2",
                    sx: { fontWeight: 600 },
                  }}
                />
                {isExpanded ? (
                  <ChevronUpIcon fontSize="small" />
                ) : (
                  <ChevronDownIcon fontSize="small" />
                )}
              </ListItemButton>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 2 }}>
                  {menu.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = isItemActive(item.href);

                    return (
                      <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                        <ListItemButton
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            backgroundColor: isActive ? "#dbeafe" : "transparent",
                            color: isActive ? "#2563eb" : "inherit",
                            "&:hover": {
                              backgroundColor: isActive ? "#bfdbfe" : "#f9fafb",
                            },
                            borderLeft: isActive ? "3px solid #2563eb" : "none",
                            pl: isActive ? "calc(16px - 3px)" : 2,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 40,
                              color: isActive ? "#2563eb" : "inherit",
                            }}
                          >
                            <ItemIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              variant: "body2",
                              sx: {
                                fontWeight: isActive ? 600 : 500,
                              },
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Quick Links */}
      <Box sx={{ px: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "textSecondary", px: 2, display: "block", mb: 1 }}
        >
          QUICK ACCESS
        </Typography>
        <List sx={{ py: 0 }}>
          <Link
            href={userRole === "client" ? "/client-portal/profile" : "/designer/profile"}
            style={{ textDecoration: "none" }}
          >
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="My Profile"
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItemButton>
          </Link>
        </List>
      </Box>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            zIndex: 1300,
            px: 2,
          }}
        >
          <IconButton onClick={handleDrawerToggle} size="small">
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", ml: 2 }}>
            Elvenwood
          </Typography>
        </Box>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => isMobile && setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          transition: "width 0.3s ease",
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e5e7eb",
            mt: isMobile ? "60px" : 0,
            height: isMobile ? "calc(100vh - 60px)" : "100vh",
            overflowY: "auto",
            overflowX: "hidden",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "3px",
              "&:hover": {
                background: "#555",
              },
            },
          },
        }}
      >
        {!isMobile && (
          <Box sx={{ height: 64, display: "flex", alignItems: "center", px: 2 }} />
        )}
        {drawerContent}
      </Drawer>
    </>
  );
}
