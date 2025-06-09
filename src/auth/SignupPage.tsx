/**
 * SignupPage Component
 * 
 * A component that handles new user registration through a signup form.
 * Uses Wasp's authentication system and shadcn/ui components for the interface.
 * 
 * Features:
 * - Username and password registration
 * - Password strength requirements
 * - Form validation
 * - Loading states
 * - Error handling with toast notifications
 * - Responsive design
 */

import { login, signup } from 'wasp/client/auth';
import { Link } from 'wasp/client/router'; // Wasp's type-safe Link component
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Using react-router-dom's navigate for consistency
import { toast } from '../hooks/use-toast';

// Minimum length requirement for password
const PASSWORD_MIN_LENGTH = 8;

export function SignupPage() {
  // State management for form fields and loading state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Validates the password against security requirements
   * @param password - The password to validate
   * @returns null if valid, error message if invalid
   */
  const validatePassword = (password: string): string | null => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  /**
   * Handles changes in form input fields
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the signup form submission
   * @param e - Form event
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!formData.username.trim()) {
      toast({title: "Username is required", variant:"destructive"})
      return;
    }

    // Validate password requirements
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast({title: passwordError, variant:"destructive"})
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({title: 'Passwords do not match', variant:"destructive"})
      return;
    }

    setIsLoading(true);
    try {
      // Attempt to create new user account
      await signup({
        username: formData.username.trim(),
        password: formData.password
      });
      // Login the user after signup
      await login(formData.username.trim(), formData.password);
      navigate('/');
    } catch (err: any) {
      toast({title: 'Signup failed. Please try again.', variant:"destructive"})
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container with responsive centering
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className="w-full max-w-sm">
        {/* Card header with title and description */}
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>

        {/* Signup form */}
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              {/* Username input field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a Username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Password input field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Confirm password input field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>

            {/* Password requirements information */}
            <div className="text-xs text-muted-foreground">
              Password must:
              <ul className="list-disc list-inside mt-1">
                <li>Be at least {PASSWORD_MIN_LENGTH} characters long</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
                <li>Contain at least one number</li>
              </ul>
            </div>

            {/* Submit button with loading state */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>

            {/* Login link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline"
                tabIndex={0}
              >
                Login here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}