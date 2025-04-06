import React, { useState, useEffect, useMemo } from 'react';
import TaskList from '@/components/TaskList';
import { useTaskContext } from '@/contexts/TaskContext';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard: React.FC = () => {
  const { tasks, isLoading, getTasksByProject, getProject } = useTaskContext();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | string>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  useEffect(() => {
    // Handle URL hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash === 'all' || hash === 'today' || hash === 'upcoming') {
        setActiveTab(hash);
      } else if (hash.startsWith('project-')) {
        setActiveTab(hash);
      }
    };

    // Set initial tab based on URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'today') {
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (activeTab === 'upcoming') {
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > today && dueDate <= nextWeek;
      });
    } else if (activeTab.startsWith('project-')) {
      const projectId = activeTab.replace('project-', '');
      return getTasksByProject(projectId);
    }
    return tasks;
  }, [tasks, activeTab, today, nextWeek, getTasksByProject]);

  const getPageTitle = () => {
    if (activeTab === 'all') return 'All Tasks';
    if (activeTab === 'today') return 'Today';
    if (activeTab === 'upcoming') return 'Upcoming';
    if (activeTab.startsWith('project-')) {
      const projectId = activeTab.replace('project-', '');
      const project = getProject(projectId);
      return project ? project.name : 'All Tasks';
    }
    return 'All Tasks';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        
        <div className="space-y-2 mb-8">
          <div className="flex space-x-2 border-b pb-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </header>

      <div className="space-y-2 mb-8">
        <nav className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'today'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Today ({filteredTasks.filter(task => {
              if (!task.dueDate) return false;
              const dueDate = new Date(task.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() === today.getTime();
            }).length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming ({filteredTasks.filter(task => {
              if (!task.dueDate) return false;
              const dueDate = new Date(task.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate > today && dueDate <= nextWeek;
            }).length})
          </button>
        </nav>
      </div>

      <TaskList
        title={getPageTitle()}
        tasks={filteredTasks}
      />
    </div>
  );
};

export default Dashboard;
