"use client";

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useMemo } from "react";
import { lightTheme, darkTheme } from "@/lib/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Store theme toggle in window for child components to access
  if (typeof window !== "undefined") {
    (window as any).__toggleTheme = toggleTheme;
    (window as any).__darkMode = darkMode;
  }

  return (
    <html lang="en">
      <head>
        <title>Elvenwood Interiors - Design Collaboration Portal</title>
        <meta
          name="description"
          content="Collaborate on interior design projects with clients and designers"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
