/**
 * App Component
 * 
 * The root component of the application that handles:
 * - Global layout and styling
 * - Theme management (dark/light mode)
 * - Navigation bar visibility logic
 * - Toast notifications
 * - Routing outlet
 */

import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Toaster } from "./components/ui/toaster";
import { Navbar } from "./components/Navbar";
import "./main.css";

// Routes where the navbar should be hidden
const HIDDEN_NAVBAR_ROUTES = ["/login", "/signup"] as const;

// Local storage key for theme preference
const THEME_STORAGE_KEY = 'darkMode';

/**
 * Loads the initial theme preference from localStorage
 * @returns {boolean} The saved theme preference or false if not found
 */
const loadInitialTheme = (): boolean => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error('Error loading theme preference:', error);
    return false;
  }
};

export default function App() {
  // Get current route location
  const location = useLocation();

  // State for theme management
  const [darkMode, setDarkMode] = useState<boolean>(loadInitialTheme);

  /**
   * Determines if navbar should be shown based on current route
   */
  const shouldShowNavbar = !HIDDEN_NAVBAR_ROUTES.includes(location.pathname as typeof HIDDEN_NAVBAR_ROUTES[number]);

  /**
   * Handles theme changes and persists the preference
   */
  const handleThemeChange = useCallback((isDark: boolean) => {
    setDarkMode(isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  // Effect to apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Conditional navbar rendering */}
      {shouldShowNavbar && (
        <Navbar 
          setDarkMode={handleThemeChange} 
          darkMode={darkMode} 
        />
      )}
      
      {/* Main content area */}
      <div className="p-4">
        <Toaster />
        <Outlet />
      </div>
    </div>
  );
}
