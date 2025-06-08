import { useAuth } from 'wasp/client/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCsvFiles, useQuery } from 'wasp/client/operations';

export function RedirectPage() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/csv-manager');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking auth status
  return <div>loading...</div>;
} 