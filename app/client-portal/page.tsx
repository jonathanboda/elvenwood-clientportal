"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Box, Typography, Button, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import ClientDashboard from "@/app/components/client/ClientDashboard";
import { Suspense } from "react";

function ClientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Not authenticated - show landing page
        setIsClient(true);
        setAuthorized(false);
        return;
      }

      // Authenticated user - allow access to client portal
      // Users can access client portal regardless of their role
      // This allows both clients and designers to view projects as clients
      setIsClient(true);
      setAuthorized(true);

      // Set user role to client when accessing client portal
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "client") {
        localStorage.setItem("userRole", "client");
      }
    };

    checkAuth();
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client portal...</p>
        </div>
      </div>
    );
  }

  // Show authenticated client dashboard
  if (isClient && authorized) {
    return <ClientDashboard projectId={projectId} />;
  }

  // Show landing page for unauthenticated visitors (from email links)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: "bold", mb: 2, color: "#333" }}
          >
            Welcome to Your Design Portal
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: "1.1rem" }}>
            You've been invited to view and collaborate on design projects.
          </Typography>
        </Box>

        <Card
          sx={{
            mb: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              Get Started
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              To view your project and collaborate with the designer, please sign in or create an account.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => router.push("/signin?redirect=/client-portal")}
                sx={{ px: 4, py: 1.5 }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => router.push("/signup?redirect=/client-portal")}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#f0f9ff", borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2, color: "#1e40af" }}>
              What You Can Do:
            </Typography>
            <Box component="ul" sx={{ ml: 2, mb: 0, color: "textSecondary" }}>
              <li>View design mockups and prototypes</li>
              <li>Leave feedback and comments</li>
              <li>Download design files</li>
              <li>Track project progress</li>
              <li>Collaborate with designers in real-time</li>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}

export default function ClientPortalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ClientPortalContent />
    </Suspense>
  );
}
