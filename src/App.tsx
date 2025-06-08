// src/App.tsx
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import "./main.css"
import { Navbar } from "./components/Navbar";
import { useEffect, useState } from "react";

export default function App() {
    const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup"];

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Load initial value from localStorage
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    // Add or remove 'dark' class on <body>
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {shouldShowNavbar && <Navbar setDarkMode={setDarkMode} darkMode={darkMode} />}
      <div className="p-4">
        <Toaster />
        <Outlet />
      </div>
    </div>
  );
}
