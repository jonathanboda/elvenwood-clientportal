"use client";

interface Project {
  id: string;
  project_name: string;
  description: string;
  status: string;
  client_email: string;
  created_at: string;
}

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
  };

  const statusLabel = {
    draft: "Awaiting",
    in_progress: "In Progress",
    review: "Review",
    approved: "Approved",
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {project.project_name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[project.status as keyof typeof statusColors] ||
            statusColors.draft
          }`}
        >
          {statusLabel[project.status as keyof typeof statusLabel] ||
            project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {project.client_email && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Client:</span> {project.client_email}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Created: {new Date(project.created_at).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={onSelect}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        Invite Client
      </button>
    </div>
  );
}
