
import React from 'react';
import { Navigate } from 'react-router-dom';
import { TaskProvider } from '@/contexts/TaskContext';
import { AppSidebar } from '@/components/AppSidebar';
import Dashboard from './Dashboard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  
  // If not loading and no user, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <TaskProvider>
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <SidebarTrigger />
                  <h1 className="text-xl font-bold ml-4 text-blue-500">TaskFlow</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
              <Dashboard />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </TaskProvider>
  );
};

export default Index;
