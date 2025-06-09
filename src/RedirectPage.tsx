/**
 * RedirectPage Component
 * 
 * A component that handles authentication-based routing logic.
 * It automatically redirects users to the appropriate page based on their authentication status:
 * - Authenticated users are redirected to the CSV manager dashboard
 * - Unauthenticated users are redirected to the login page
 * - Shows a loading state while checking authentication status
 */

import { useAuth } from 'wasp/client/auth';
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from './components/Loader';

// Route constants to avoid magic strings
const ROUTES = {
  DASHBOARD: '/csv-manager',
  LOGIN: '/login'
} as const;

export function RedirectPage() {
  // Get authentication state and navigation function
  const { data: user, isLoading: isAuthChecking } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles the redirection logic based on authentication state
   * Memoized to prevent unnecessary recreations
   */
  const handleRedirect = useCallback(() => {
    if (!isAuthChecking) {
      // Redirect authenticated users to dashboard, others to login
      navigate(user ? ROUTES.DASHBOARD : ROUTES.LOGIN);
    }
  }, [user, isAuthChecking, navigate]);

  // Effect to handle automatic redirection
  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Show a proper loading state while checking authentication
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader 
        text="Checking authentication..." 
        size="lg"
      />
    </div>
  );
} 