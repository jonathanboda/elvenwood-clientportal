"use client";

import { Project, User } from "@/types";

interface ClientProjectsProps {
  projects: Project[];
  currentUser: User;
  onViewDesign: (projectId: string) => void;
}

export default function ClientProjects({
  projects,
  currentUser,
  onViewDesign,
}: ClientProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No projects yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onViewDesign(project.id)}
        >
          <div className="relative aspect-video bg-gray-100">
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "In Review"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {project.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Designer: {project.designer.name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
