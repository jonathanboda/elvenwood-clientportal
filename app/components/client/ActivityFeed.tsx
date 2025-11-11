"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { Activity, User } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  currentUser: User;
  onViewDesign: (projectId: string) => void;
  onAddComment: (
    activityId: string,
    comment: string,
    attachment?: File
  ) => void;
  onRefresh: () => void;
}

export default function ActivityFeed({
  activities,
  currentUser,
  onViewDesign,
  onAddComment,
  onRefresh,
}: ActivityFeedProps) {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const toggleComments = (activityId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = (activityId: string) => {
    const comment = comments[activityId];
    if (comment?.trim()) {
      onAddComment(activityId, comment);
      setComments({ ...comments, [activityId]: "" });
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <UploadIcon sx={{ color: "info.main" }} />;
      case "comment":
        return <MessageIcon sx={{ color: "success.main" }} />;
      case "acceptance":
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      default:
        return <UploadIcon sx={{ color: "text.secondary" }} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Refresh Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Refresh Feed
        </Button>
      </Box>

      {/* Activity Items */}
      {activities.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", backgroundColor: "action.hover" }}>
          <Typography color="textSecondary">No activities yet</Typography>
        </Paper>
      ) : (
        activities.map((activity) => (
          <Card
            key={activity.id}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            {/* Activity Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                  <Avatar
                    src={activity.user.avatarUrl}
                    alt={activity.user.name}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {activity.user.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.type === "upload" && "Uploaded new design"}
                      {activity.type === "comment" && "Added feedback"}
                      {activity.type === "acceptance" && "Accepted design"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  {getActivityIcon(activity.type)}
                </Box>
              </Box>
            </Box>

            {/* Activity Content */}
            <CardContent>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>
                {activity.project.name}
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {activity.postText}
              </Typography>
              {activity.commentText && (
                <Paper sx={{ p: 2, backgroundColor: "action.hover", border: 1, borderColor: "divider" }}>
                  <Typography variant="body2">
                    "{activity.commentText}"
                  </Typography>
                </Paper>
              )}

              {/* Activity Image */}
              {activity.imageUrl && (
                <Box
                  component="img"
                  src={activity.imageUrl}
                  alt={activity.postText}
                  onClick={() => onViewDesign(activity.versionId)}
                  sx={{
                    width: "100%",
                    height: 256,
                    objectFit: "cover",
                    borderRadius: 1,
                    my: 2,
                    cursor: "pointer",
                    transition: "opacity 0.3s",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                />
              )}
            </CardContent>

            {/* Activity Actions */}
            <CardActions sx={{ backgroundColor: "action.hover", borderTop: 1, borderColor: "divider" }}>
              <Button
                size="small"
                startIcon={<MessageIcon />}
                onClick={() => toggleComments(activity.id)}
              >
                Add Feedback
              </Button>
            </CardActions>

            {/* Comments Section */}
            {expandedComments.has(activity.id) && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={comments[activity.id] || ""}
                  onChange={(e) =>
                    setComments({ ...comments, [activity.id]: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => toggleComments(activity.id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleAddComment(activity.id)}
                  >
                    Comment
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        ))
      )}
    </Box>
  );
}
