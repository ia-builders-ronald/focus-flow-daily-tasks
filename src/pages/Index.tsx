
import React from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import { AppSidebar } from '@/components/AppSidebar';
import Dashboard from './Dashboard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1">
              <div className="flex items-center p-4 border-b">
                <SidebarTrigger />
                <h1 className="text-xl font-bold ml-4">TaskFlow</h1>
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
