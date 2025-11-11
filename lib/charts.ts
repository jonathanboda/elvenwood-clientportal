import { ChartOptions } from 'chart.js';

// Default chart colors
export const chartColors = {
  primary: '#2563eb',
  secondary: '#B4885A',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#0ea5e9',
  light: '#e5e7eb',
  dark: '#1f2937',
};

// Default chart options
export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13,
        weight: 600,
      },
      bodyFont: {
        size: 12,
      },
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

// Project status distribution chart data
export const getProjectStatusChartData = (projects: any[]) => {
  const statusCounts = {
    draft: 0,
    in_progress: 0,
    review: 0,
    approved: 0,
  };

  projects.forEach((project) => {
    if (statusCounts.hasOwnProperty(project.status)) {
      statusCounts[project.status as keyof typeof statusCounts]++;
    }
  });

  return {
    labels: ['Draft', 'In Progress', 'Review', 'Approved'],
    datasets: [
      {
        label: 'Projects by Status',
        data: [
          statusCounts.draft,
          statusCounts.in_progress,
          statusCounts.review,
          statusCounts.approved,
        ],
        backgroundColor: [
          chartColors.light,
          chartColors.info,
          chartColors.warning,
          chartColors.success,
        ],
        borderColor: [
          '#d1d5db',
          '#0284c7',
          '#d97706',
          '#059669',
        ],
        borderWidth: 1,
      },
    ],
  };
};

// Timeline chart data
export const getTimelineChartData = (dataPoints: { date: string; count: number }[]) => {
  return {
    labels: dataPoints.map((d) => d.date),
    datasets: [
      {
        label: 'Projects Created',
        data: dataPoints.map((d) => d.count),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}10`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
};

// Designer performance chart
export const getDesignerPerformanceChartData = (designers: any[]) => {
  return {
    labels: designers.map((d) => d.name),
    datasets: [
      {
        label: 'Completed Projects',
        data: designers.map((d) => d.completed),
        backgroundColor: chartColors.success,
      },
      {
        label: 'In Progress',
        data: designers.map((d) => d.inProgress),
        backgroundColor: chartColors.info,
      },
      {
        label: 'Pending Review',
        data: designers.map((d) => d.pending),
        backgroundColor: chartColors.warning,
      },
    ],
  };
};

// Client satisfaction chart
export const getClientSatisfactionChartData = (data: {
  veryGood: number;
  good: number;
  average: number;
  poor: number;
}) => {
  return {
    labels: ['Very Good', 'Good', 'Average', 'Poor'],
    datasets: [
      {
        label: 'Client Satisfaction',
        data: [data.veryGood, data.good, data.average, data.poor],
        backgroundColor: [
          chartColors.success,
          chartColors.info,
          chartColors.warning,
          chartColors.error,
        ],
        borderWidth: 0,
      },
    ],
  };
};

// Project timeline (Gantt-like) data
export const getProjectTimelineData = (projects: any[]) => {
  return {
    labels: projects.map((p) => p.name),
    datasets: projects.map((project, index) => ({
      label: project.name,
      data: [
        {
          x: [new Date(project.startDate).getTime(), new Date(project.endDate).getTime()],
          y: index,
        },
      ],
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.success,
        chartColors.info,
        chartColors.warning,
      ][index % 5],
    })),
  };
};

// Feedback sentiment analysis
export const getFeedbackSentimentData = (sentiments: {
  positive: number;
  neutral: number;
  negative: number;
}) => {
  return {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Feedback Sentiment',
        data: [sentiments.positive, sentiments.neutral, sentiments.negative],
        backgroundColor: [
          chartColors.success,
          chartColors.light,
          chartColors.error,
        ],
        borderWidth: 0,
      },
    ],
  };
};

// Version adoption rate
export const getVersionAdoptionData = (versions: any[]) => {
  const labels = versions.map((v) => `v${v.versionNumber}`);
  const adoptionRates = versions.map((v) => v.adoptionRate || 0);

  return {
    labels,
    datasets: [
      {
        label: 'Adoption Rate (%)',
        data: adoptionRates,
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
};
