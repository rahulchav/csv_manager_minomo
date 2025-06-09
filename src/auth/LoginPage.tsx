/**
 * LoginPage Component
 * 
 * A component that handles user authentication through a login form.
 * Uses Wasp's authentication system and shadcn/ui components for the interface.
 * 
 * Features:
 * - Username and password authentication
 * - Form validation
 * - Loading states
 * - Error handling with toast notifications
 * - Responsive design
 */

import { login } from 'wasp/client/auth'
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from '../hooks/use-toast'

export function LoginPage() {
  // State management for form fields and loading state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  /**
   * Handles the login form submission
   * @param e - Form event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!username.trim() || !password.trim()) {
      toast({title: "Please fill in all fields", variant:"destructive"})
      return
    }

    setIsLoading(true)
    try {
      // Attempt login with trimmed credentials
      await login(username.trim(), password.trim())
      navigate('/')
    } catch (err: any) {
      // Handle login errors with toast notification
      toast({title: err.message || 'Login failed', variant:"destructive"})
      console.log("Error in login", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Main container with responsive centering
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className="w-full max-w-sm">
        {/* Card header with title and description */}
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your credentials below to login to your account
          </CardDescription>
        </CardHeader>

        {/* Login form */}
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              {/* Username input field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Password input field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter Password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit button with loading state */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Sign up link */}
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary hover:underline"
                tabIndex={0}
              >
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

