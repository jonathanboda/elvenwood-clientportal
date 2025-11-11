# Elvenwood Interiors - Tech Stack Upgrade Guide

Your Elvenwood app has been upgraded to use an enterprise-grade tech stack with advanced features and animations!

---

## 📦 New Tech Stack

### Core Framework
- **Next.js 15** - Latest React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript 5.9** - Advanced type safety

### UI & Styling
- **Material UI (MUI) 5.14** - Professional component library
- **Emotion** - CSS-in-JS styling solution
- **Tailwind CSS 4** - Utility-first CSS (still available)

### State Management
- **Zustand 4.4** - Lightweight, simple state management
  - User state (authentication, profile)
  - Projects state (CRUD operations)
  - UI state (theme, notifications)
  - Versions & Comments state

### Animations & Interactions
- **Framer Motion 10** - Advanced animation library
  - Page transitions
  - Component entrance animations
  - Interactive hover effects
  - Drag animations

- **@dnd-kit** - Modern drag and drop
  - Drag projects between kanban columns
  - Reorder design versions
  - Sortable feedback items

### Data Visualization
- **Chart.js 4.4** - Powerful charting library
- **react-chartjs-2** - React wrapper for charts
  - Project status distribution
  - Timeline analytics
  - Designer performance metrics
  - Client satisfaction surveys
  - Version adoption rates

### Document Generation
- **@react-pdf/renderer 3.16** - Create PDFs in React
  - Export project reports
  - Generate design handoffs
  - Invoice/quote generation
  - Client deliverables

### Backend
- **Supabase** - PostgreSQL + Auth + Storage (unchanged)

---

## 📁 File Structure

### New Library Files
```
lib/
├── store.ts            # Zustand stores for state management
├── theme.ts            # Material UI theme configuration
├── animations.ts       # Framer Motion animation variants
├── charts.ts           # Chart.js helper functions
├── pdf.ts              # PDF generation utilities
├── auth-demo.ts        # Demo authentication (existing)
└── supabase.ts         # Supabase client (existing)
```

---

## 🎯 Zustand Store Usage

### User Store
```typescript
import { useUserStore } from '@/lib/store';

const MyComponent = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const isLoading = useUserStore((state) => state.isLoading);

  return <div>{user?.email}</div>;
};
```

### Projects Store
```typescript
import { useProjectsStore } from '@/lib/store';

const ProjectList = () => {
  const projects = useProjectsStore((state) => state.projects);
  const addProject = useProjectsStore((state) => state.addProject);

  return projects.map((p) => <ProjectCard key={p.id} project={p} />);
};
```

### UI Store (Theme, Snackbars)
```typescript
import { useUIStore } from '@/lib/store';

const AppLayout = () => {
  const theme = useUIStore((state) => state.theme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return <main>{/* Content */}</main>;
};
```

---

## ✨ Framer Motion Examples

### Page Animations
```typescript
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

export default function Page() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### Card Grid
```typescript
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '@/lib/animations';

export const CardGrid = ({ items }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          custom={i}
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {/* Card content */}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

---

## 📊 Chart Examples

### Project Status Distribution
```typescript
import { Bar } from 'react-chartjs-2';
import { getProjectStatusChartData, defaultChartOptions } from '@/lib/charts';

export const ProjectStats = ({ projects }) => {
  const chartData = getProjectStatusChartData(projects);

  return (
    <Bar
      data={chartData}
      options={defaultChartOptions}
      height={300}
    />
  );
};
```

### Timeline Chart
```typescript
import { Line } from 'react-chartjs-2';
import { getTimelineChartData } from '@/lib/charts';

export const Timeline = () => {
  const dataPoints = [
    { date: 'Jan 1', count: 5 },
    { date: 'Jan 8', count: 8 },
    // ... more data
  ];

  const chartData = getTimelineChartData(dataPoints);
  return <Line data={chartData} options={defaultChartOptions} />;
};
```

---

## 📄 PDF Export Example

### Generate Project Report
```typescript
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generateProjectReportPDF } from '@/lib/pdf';

export const ProjectReport = ({ project }) => {
  const reportData = {
    project: {
      id: project.id,
      name: project.project_name,
      // ... more fields
    },
    versions: project.versions,
    comments: project.comments,
    stats: {
      totalVersions: project.versions.length,
      totalComments: project.comments.length,
      daysInProgress: 10,
    },
  };

  return (
    <PDFDownloadLink
      document={generateProjectReportPDF(reportData)}
      fileName={`${project.project_name}-report.pdf`}
    >
      {({ loading }) =>
        loading ? 'Loading...' : 'Download Report'
      }
    </PDFDownloadLink>
  );
};
```

---

## 🎨 Material UI Theme

### Using Theme
```typescript
import { useTheme } from '@mui/material/styles';
import { Button, Card, TextField } from '@mui/material';

export const MyComponent = () => {
  const theme = useTheme();

  return (
    <Card sx={{ padding: theme.spacing(2) }}>
      <TextField label="Name" />
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Card>
  );
};
```

### Light & Dark Themes
```typescript
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/lib/theme';
import { useUIStore } from '@/lib/store';

export const App = () => {
  const theme = useUIStore((state) => state.theme);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      {/* App */}
    </ThemeProvider>
  );
};
```

---

## 🎭 Drag and Drop Example

### Sortable Projects
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const ProjectsList = ({ projects }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event) => {
    // Update order
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={projects} strategy={verticalListSortingStrategy}>
        {projects.map((project) => (
          <SortableProjectCard key={project.id} project={project} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
```

---

## 🔧 Configuration Files

### lib/theme.ts
- Light theme configuration
- Dark theme configuration
- Material UI component overrides
- Custom colors (primary, secondary, success, error, warning, info)

### lib/animations.ts
- Page transition variants
- Card entrance animations
- Modal animations
- Stagger effects
- Bounce, pulse, rotate animations

### lib/store.ts
- User store (auth, profile)
- Projects store (CRUD)
- UI store (theme, notifications)
- Versions store (design files)
- Comments store (feedback)

### lib/charts.ts
- Status distribution chart
- Timeline/analytics chart
- Designer performance metrics
- Client satisfaction surveys
- Version adoption rates

### lib/pdf.ts
- Project report PDF template
- Styled PDF components
- Status color mapping
- Export utilities

---

## 📱 Using Components

### Combine MUI + Framer Motion
```typescript
import { motion } from 'framer-motion';
import { Card, CardContent, Typography } from '@mui/material';

const MotionCard = motion(Card);

export const AnimatedCard = () => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <CardContent>
      <Typography variant="h5">Project Name</Typography>
    </CardContent>
  </MotionCard>
);
```

### MUI + Zustand
```typescript
import { useUIStore } from '@/lib/store';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/lib/theme';

export const AppLayout = () => {
  const theme = useUIStore((state) => state.theme);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      {/* Your app content */}
    </ThemeProvider>
  );
};
```

---

## 🚀 Next Steps

### 1. Integrate New Components
- Update existing pages to use Material UI components
- Add animations to page transitions
- Implement charts on dashboard

### 2. Implement Drag & Drop
- Kanban board for project status
- Reorderable version list
- Sortable comment threads

### 3. Add PDF Export
- Project report generation
- Client deliverables
- Design handoff documents

### 4. Polish Animations
- Entrance animations on all pages
- Hover effects on interactive elements
- Loading state animations

### 5. Implement Charts
- Project analytics dashboard
- Designer performance metrics
- Client feedback sentiment analysis

---

## 📚 Resources

### Documentation
- **Material UI**: https://mui.com/material-ui/
- **Framer Motion**: https://www.framer.com/motion/
- **Zustand**: https://github.com/pmndrs/zustand
- **dnd-kit**: https://docs.dndkit.com/
- **Chart.js**: https://www.chartjs.org/
- **React PDF**: https://react-pdf.org/

### TypeScript Types
All stores have full TypeScript support with proper typing for:
- User objects
- Project data
- Version information
- Comments
- Chart data
- PDF document structure

---

## ⚙️ Configuration

### Install Dependencies
Dependencies are already added to `package.json`:
```bash
npm install
```

### Peer Dependencies
Using `--legacy-peer-deps` flag to ensure compatibility:
```bash
npm install --legacy-peer-deps
```

### Theme Configuration
Material UI theme is pre-configured in `lib/theme.ts` with:
- Primary color: Blue (#2563eb)
- Secondary color: Gold (#B4885A)
- Predefined light and dark themes

---

## ✅ Features Enabled

✅ **State Management**: Zustand for all app state
✅ **Animations**: Framer Motion on all transitions
✅ **UI Components**: Material UI for professional look
✅ **Charts**: Comprehensive analytics capabilities
✅ **PDF Export**: Generate professional documents
✅ **Drag & Drop**: Interactive kanban boards
✅ **Theming**: Light and dark modes
✅ **TypeScript**: Full type safety across all utilities

---

## 🎉 Ready to Use

Your app now has:
- Professional UI components
- Smooth animations
- State management
- Data visualization
- Document generation
- Drag and drop support
- Full TypeScript support

Start using these libraries to enhance your Elvenwood app!
