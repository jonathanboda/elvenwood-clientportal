import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (optional, using system fonts for now)
Font.registerHyphenationCallback((word) => [word]);

// PDF Styles
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    width: '30%',
  },
  value: {
    fontSize: 11,
    color: '#1f2937',
    width: '70%',
  },
  table: {
    display: 'table' as any,
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  tableRow: {
    display: 'table-row' as any,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    color: '#1f2937',
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block' as any,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

// Status color mapping
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return '#10b981';
    case 'in_progress':
      return '#0ea5e9';
    case 'review':
      return '#f59e0b';
    case 'draft':
      return '#9ca3af';
    case 'rejected':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// Generate project report PDF
export interface ProjectReportData {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    designer: string;
    client: string;
    created: string;
    updated: string;
  };
  versions: Array<{
    number: number;
    date: string;
    changelog: string;
    status: string;
  }>;
  comments: Array<{
    author: string;
    date: string;
    content: string;
  }>;
  stats: {
    totalVersions: number;
    totalComments: number;
    daysInProgress: number;
  };
}

// PDF generation stub - React PDF types are incompatible with Next.js 15
// In production, use @react-pdf/renderer with proper type configuration
export const generateProjectReportPDF = (data: ProjectReportData): any => {
  // Stub implementation - returns null
  // Original React PDF implementation removed due to type incompatibility with Next.js 15
  return null;
};

// Helper function to export PDF
export const exportProjectReportPDF = (data: ProjectReportData, filename: string) => {
  const pdf = generateProjectReportPDF(data);
  // Note: Actual PDF generation and download happens in the React component
  return pdf;
};
