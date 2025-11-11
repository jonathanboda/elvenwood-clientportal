"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import DesignerDashboard from "@/app/components/designer/DesignerDashboard";
import { Box, Button } from "@mui/material";

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"designer" | "client">("designer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/signin");
        return;
      }

      // Always start with designer portal
      // Only redirect to client if explicitly set
      const savedRole = localStorage.getItem("userRole");
      const role = savedRole === "client" ? "client" : "designer";
      setUserRole(role);
      setLoading(false);

      // Redirect to client portal only if explicitly in client mode
      if (savedRole === "client") {
        router.push("/client-portal");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is in client mode, show loading (redirect happens in useEffect)
  if (userRole === "client") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DesignerDashboard onRoleChange={(role) => {
      setUserRole(role);
      localStorage.setItem("userRole", role);
      if (role === "client") {
        router.push("/client-portal");
      }
    }} />
  );
}
