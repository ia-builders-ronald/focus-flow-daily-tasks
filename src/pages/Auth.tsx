
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

enum AuthMode {
  SIGNIN,
  SIGNUP,
}

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.SIGNIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === AuthMode.SIGNIN) {
        await signIn(email, password);
      } else {
        if (username.trim() === '') {
          throw new Error('Username is required');
        }
        await signUp(email, password, username);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to home if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white shadow-md rounded-lg p-8 border border-blue-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">TaskFlow</h1>
          <p className="mt-2 text-blue-500">
            {mode === AuthMode.SIGNIN
              ? 'Sign in to your account'
              : 'Create a new account'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === AuthMode.SIGNUP && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-700">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading
              ? 'Loading...'
              : mode === AuthMode.SIGNIN
              ? 'Sign In'
              : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-800"
            onClick={() =>
              setMode(
                mode === AuthMode.SIGNIN ? AuthMode.SIGNUP : AuthMode.SIGNIN
              )
            }
          >
            {mode === AuthMode.SIGNIN
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
