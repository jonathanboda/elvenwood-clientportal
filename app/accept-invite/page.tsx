"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) {
        console.error('[AcceptInvite] No token provided');
        setError("Invalid invite link - no token provided");
        setLoading(false);
        return;
      }

      try {
        console.log('[AcceptInvite] Checking invite with token:', token);

        // Check if invite exists and is valid via API
        const response = await fetch(`/api/check-invite?token=${token}`);
        const result = await response.json();

        console.log('[AcceptInvite] API response:', {
          ok: response.ok,
          status: response.status,
          result,
        });

        if (!response.ok) {
          console.error('[AcceptInvite] Invite check failed:', result);
          setError(result.error || "Invite not found or has expired");
          setLoading(false);
          return;
        }

        // Transform the API response to match the expected format
        const inviteData = {
          id: result.invite.id,
          project_id: result.invite.project_id,
          invited_email: result.invite.invited_email,
          projects: {
            project_name: result.invite.project_name,
          },
        };

        console.log('[AcceptInvite] Invite data loaded successfully:', inviteData);
        setInviteData(inviteData);
        setLoading(false);
      } catch (err: any) {
        console.error('[AcceptInvite] Error checking invite:', err);
        setError(err.message || "Failed to check invite. Please try again.");
        setLoading(false);
      }
    };

    checkInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    try {
      setLoading(true);

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to sign up with token (user can switch to signin from there)
        router.push(`/signup?token=${token}`);
        return;
      }

      // Call accept-invite API endpoint
      const response = await fetch("/api/accept-invite", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept invite");
      }

      // Set user role as client AFTER successful acceptance
      localStorage.setItem("userRole", "client");

      // Force a hard redirect to ensure localStorage is read fresh
      // Using window.location instead of router.push to avoid caching issues
      window.location.href = "/client-portal";
    } catch (err: any) {
      setError(err.message || "Failed to accept invite");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Accept Invite
          </h2>
        </div>

        {inviteData && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600">Project Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {inviteData.projects?.project_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Designer</p>
              <p className="text-lg font-semibold text-gray-900">
                {inviteData.projects?.designer?.full_name || "Designer"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Invited Email</p>
              <p className="text-lg font-semibold text-gray-900">
                {inviteData.invited_email}
              </p>
            </div>

            <button
              onClick={handleAcceptInvite}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Accepting..." : "Accept Invite"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
