"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: (projectData: {
    projectName: string;
    description: string;
    clientEmail: string;
    startDate: string;
    endDate: string;
    status: string;
  }) => void;
}

export default function NewProjectModal({
  onClose,
  onSuccess,
}: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    clientEmail: "",
    startDate: "",
    endDate: "",
    status: "draft",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.projectName || !formData.clientEmail) {
      alert("Please fill in required fields");
      return;
    }
    // Pass the form data to the parent component
    onSuccess(formData);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Project Name"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Client Email"
          name="clientEmail"
          type="email"
          value={formData.clientEmail}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            label="Status"
            onChange={handleChange}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
