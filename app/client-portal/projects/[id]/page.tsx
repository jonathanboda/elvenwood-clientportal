"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
  Eye,
  CheckCheck,
} from "lucide-react";
import { Project, DesignVersion } from "@/types";
import { mockProjects, getProjectWithVersions } from "@/lib/mockDataEnhanced";

interface VersionSectionProps {
  version: DesignVersion;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDesign: (versionId: string) => void;
  onAcceptDesign: (versionId: string) => void;
}

const VersionSection: React.FC<VersionSectionProps> = ({
  version,
  isExpanded,
  onToggle,
  onViewDesign,
  onAcceptDesign,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
      {/* Version Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center gap-4 justify-between"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          {/* Version Badge */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
              <span className="text-sm font-bold text-blue-600">v{version.versionNumber}</span>
            </div>
          </div>

          {/* Version Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">
                Version {version.versionNumber}
              </h3>
              {version.isAccepted && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Accepted
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(version.submittedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Changelog Count */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Changes</p>
            <p className="text-lg font-semibold text-gray-900">
              {version.changelog?.length || 0}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Version Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-4">
          {/* Changelog */}
          {version.changelog && version.changelog.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                What's New
              </h4>
              <ul className="space-y-2">
                {version.changelog.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onViewDesign(version.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Design
            </button>
            {!version.isAccepted && (
              <button
                onClick={() => onAcceptDesign(version.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Accept Design
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load project data
    const projectData = mockProjects.find((p) => p.id === projectId);
    if (projectData) {
      const fullProject = getProjectWithVersions(projectId);
      setProject(fullProject);
    }
    setLoading(false);
  }, [projectId]);

  const toggleVersionExpanded = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const handleViewDesign = (versionId: string) => {
    // Navigate to design viewer with version
    router.push(`/client-portal/design-viewer?version=${versionId}`);
  };

  const handleAcceptDesign = (versionId: string) => {
    // Mark design as accepted
    alert(`Design version ${versionId} accepted!`);
    // Update project state
    if (project) {
      const updatedVersions = project.versions.map((v) =>
        v.id === versionId ? { ...v, isAccepted: true } : v
      );
      setProject({ ...project, versions: updatedVersions });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Project not found
          </h1>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            href="/client-portal"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const acceptedVersions = project.versions?.filter(
    (v) => v.isAccepted
  ).length || 0;
  const totalVersions = project.versions?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Back Button */}
          <Link
            href="/client-portal"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Project Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Project Info */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {project.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {project.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {/* Status Badge */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">
                      {project.status}
                    </p>
                  </div>
                </div>

                {/* Versions */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Versions</p>
                    <p className="font-semibold text-gray-900">{totalVersions}</p>
                  </div>
                </div>

                {/* Accepted */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Accepted</p>
                    <p className="font-semibold text-gray-900">
                      {acceptedVersions}/{totalVersions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Designer Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 h-fit">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-4">
                Project Designer
              </p>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={project.designer.avatarUrl}
                  alt={project.designer.name}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-md"
                />
                <div>
                  <h3 className="font-bold text-gray-900">
                    {project.designer.name}
                  </h3>
                  <p className="text-sm text-gray-700">{project.designer.role}</p>
                </div>
              </div>

              {/* Designer Contact */}
              <div className="border-t border-blue-200 pt-4 space-y-3">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm text-gray-900 break-words">
                    {project.designer.email}
                  </p>
                </div>

                {/* Project Timeline */}
                {(project.startDate || project.endDate) && (
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                      Timeline
                    </p>
                    <div className="space-y-1 text-sm text-gray-900">
                      {project.startDate && (
                        <p>
                          <span className="font-medium">Start:</span>{" "}
                          {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.endDate && (
                        <p>
                          <span className="font-medium">End:</span>{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design Versions Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Design Versions
          </h2>
          <p className="text-gray-600">
            Review and provide feedback on design versions
          </p>
        </div>

        {project.versions && project.versions.length > 0 ? (
          <div className="space-y-4">
            {project.versions.map((version) => (
              <VersionSection
                key={version.id}
                version={version}
                isExpanded={expandedVersions.has(version.id)}
                onToggle={() => toggleVersionExpanded(version.id)}
                onViewDesign={handleViewDesign}
                onAcceptDesign={handleAcceptDesign}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No design versions yet</p>
            <p className="text-sm text-gray-500">
              Your designer will upload versions here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
