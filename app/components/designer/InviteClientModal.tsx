"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Project } from "@/lib/store";
import { createClient } from "@/lib/supabase";

interface InviteClientModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteClientModal({
  project,
  onClose,
  onSuccess,
}: InviteClientModalProps) {
  const [email, setEmail] = useState(project.client_email);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID as fallback
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleSendInvite = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Use project's designer_id or fall back to current user
      const designerId = project.designer_id || currentUserId;

      if (!designerId) {
        setError("Unable to identify designer. Please try again.");
        setLoading(false);
        return;
      }

      // Get session for authorization
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      console.log('[InviteClient] Sending invitation:', {
        email,
        projectId: project.id,
        designerId,
        hasSession: !!session,
      });

      // Call the email API endpoint
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session && { "Authorization": `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({
          email,
          projectName: project.project_name,
          message: message || undefined,
          designerName: "Designer",
          projectId: project.id,
          designerId: designerId,
        }),
      });

      const data = await response.json();

      console.log('[InviteClient] Response:', {
        ok: response.ok,
        status: response.status,
        data,
      });

      if (!response.ok) {
        // Better error messages
        const errorMsg = data.error || data.message || "Failed to send invitation";
        console.error('[InviteClient] Error response:', { status: response.status, data });
        throw new Error(errorMsg);
      }

      // Show success message even if it's in dev mode
      setSent(true);

      // If there's a warning (dev mode or Resend testing), show it to the user
      if (data.warning) {
        console.warn(data.warning);
        setError(`Note: ${data.warning}`);
      }

      // If there's an invite link, show it in console for testing
      if (data.inviteLink) {
        console.log('[InviteClient] Invitation link:', data.inviteLink);
      }

      // Call onSuccess after showing success message
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send invitation. Please try again.";
      console.error("Error sending invitation:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Client to Project</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {sent ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Invitation created successfully!
            </Alert>
            {error && (
              <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
                {error}
              </Alert>
            )}
            <Typography variant="body2" color="textSecondary">
              {error ?
                `Invitation link created for ${email}. Check console for the invitation link.` :
                `An invitation email has been sent to ${email}`
              }
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Project: {project.project_name}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Client Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Invitation Message (Optional)"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personalized message to your invitation..."
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Alert severity="info">
              The client will receive an email with a link to view and comment on your designs.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {sent ? "Close" : "Cancel"}
        </Button>
        {!sent && (
          <Button
            variant="contained"
            onClick={handleSendInvite}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
