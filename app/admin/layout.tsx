"use client";

import { Box } from "@mui/material";
import Header from "@/app/components/layout/Header";
import Sidebar from "@/app/components/layout/Sidebar";
import { useState, useMemo } from "react";
import { lightTheme, darkTheme } from "@/lib/theme";
import { ThemeProvider } from "@mui/material/styles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <Header darkMode={darkMode} onToggleTheme={toggleTheme} />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "background.default",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
