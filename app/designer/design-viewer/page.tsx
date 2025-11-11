"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";

interface Feedback {
  id: string;
  clientName: string;
  clientAvatar: string;
  comment: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface Design {
  id: string;
  name: string;
  version: string;
  imageUrl: string;
  description: string;
}

const mockDesign: Design = {
  id: "design-1",
  name: "Modern Living Room Redesign",
  version: "v3.0",
  imageUrl:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop",
  description: "Contemporary living room design with modern furniture and lighting",
};

const mockFeedback: Feedback[] = [
  {
    id: "feedback-3",
    clientName: "Sarah Johnson",
    clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    comment:
      "Love the color scheme! The accent wall really brings out the space. Just wondering about the sofa size - can we make it a bit smaller?",
    timestamp: "2024-11-07 2:30 PM",
    attachmentName: "reference.jpg",
    attachmentUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop",
  },
  {
    id: "feedback-2",
    clientName: "Michael Chen",
    clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    comment:
      "The lighting setup looks perfect! This will really enhance the ambiance of the room.",
    timestamp: "2024-11-06 10:15 AM",
  },
  {
    id: "feedback-1",
    clientName: "Emma Williams",
    clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    comment: "Initial concept looks great! Let me review with the team and get back to you.",
    timestamp: "2024-11-05 3:45 PM",
  },
];

export default function DesignViewerPage() {
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(mockFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}`,
      clientName: "You",
      clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      comment: feedbackComment,
      timestamp: new Date().toLocaleString(),
      attachmentName: selectedFile?.name,
      attachmentUrl: selectedFile
        ? URL.createObjectURL(selectedFile)
        : undefined,
    };

    setFeedbackList([newFeedback, ...feedbackList]);
    setFeedbackComment("");
    setSelectedFile(null);
    setIsSubmitting(false);
    setSuccessMessage("Feedback submitted successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Back Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Link href="/dashboard">
            <IconButton
              size="large"
              sx={{
                backgroundColor: "#f3f4f6",
                "&:hover": { backgroundColor: "#e5e7eb" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#111827" }}>
              {mockDesign.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
              Version {mockDesign.version}
            </Typography>
          </Box>
        </Box>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          </motion.div>
        )}

        {/* Design Viewer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Paper
            elevation={2}
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
              mb: 4,
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                padding: 3,
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                {mockDesign.description}
              </Typography>
            </Box>

            {/* Design Image */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 500,
                overflow: "hidden",
              }}
            >
              <Image
                src={mockDesign.imageUrl}
                alt={mockDesign.name}
                width={1200}
                height={800}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 600,
                  objectFit: "cover",
                }}
              />
            </Box>
          </Paper>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Paper
            elevation={2}
            sx={{
              borderRadius: "12px",
              padding: 3,
              mb: 4,
              backgroundColor: "#ffffff",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 3, color: "#111827" }}
            >
              Leave Feedback
            </Typography>

            {/* Feedback Form */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Share your thoughts about this design..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                variant="outlined"
                disabled={isSubmitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
              />

              {/* File Attachment */}
              <Box>
                <input
                  type="file"
                  id="file-input"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
                {!selectedFile ? (
                  <label htmlFor="file-input" style={{ width: "100%" }}>
                    <Button
                      component="span"
                      startIcon={<UploadIcon />}
                      variant="outlined"
                      fullWidth
                      disabled={isSubmitting}
                      sx={{
                        borderColor: "#d1d5db",
                        color: "#6b7280",
                        textTransform: "none",
                        borderRadius: "8px",
                        py: 1.5,
                        "&:hover": {
                          backgroundColor: "#f9fafb",
                          borderColor: "#9ca3af",
                        },
                      }}
                    >
                      Upload Reference Image (Optional)
                    </Button>
                  </label>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      backgroundColor: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackComment.trim() || isSubmitting}
                  sx={{
                    backgroundColor: "#3b82f6",
                    textTransform: "none",
                    borderRadius: "8px",
                    py: 1.5,
                    px: 3,
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#2563eb",
                    },
                    "&:disabled": {
                      backgroundColor: "#d1d5db",
                      color: "#9ca3af",
                    },
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Feedback List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 3, color: "#111827" }}
          >
            Feedback Comments ({feedbackList.length})
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {feedbackList.length === 0 ? (
              <Card
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                  border: "1px dashed #d1d5db",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    No feedback yet. Be the first to share your thoughts!
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              feedbackList.map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      "&:hover": {
                        borderColor: "#3b82f6",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CardContent>
                      {/* Feedback Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            src={feedback.clientAvatar}
                            alt={feedback.clientName}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#111827" }}
                            >
                              {feedback.clientName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                              {feedback.timestamp}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Feedback Comment */}
                      <Typography
                        variant="body2"
                        sx={{ color: "#374151", mb: 2, lineHeight: 1.6 }}
                      >
                        {feedback.comment}
                      </Typography>

                      {/* Attachment Preview */}
                      {feedback.attachmentUrl && feedback.attachmentName && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#6b7280", fontWeight: 500, display: "block", mb: 1 }}
                          >
                            Attachment: {feedback.attachmentName}
                          </Typography>
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              maxWidth: 300,
                              height: 200,
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: "1px solid #d1d5db",
                            }}
                          >
                            <Image
                              src={feedback.attachmentUrl}
                              alt={feedback.attachmentName}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </Box>
        </motion.div>
      </Container>
    </motion.div>
  );
}
