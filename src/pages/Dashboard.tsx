
import React, { useState } from 'react';
import TaskList from '@/components/TaskList';
import { useTaskContext } from '@/contexts/TaskContext';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { tasks } = useTaskContext();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming'>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today && dueDate <= nextWeek;
  });

  const currentTasks = (() => {
    switch (activeTab) {
      case 'today':
        return todayTasks;
      case 'upcoming':
        return upcomingTasks;
      case 'all':
      default:
        return tasks;
    }
  })();

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
            Today ({todayTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming ({upcomingTasks.length})
          </button>
        </nav>
      </div>

      <TaskList
        title={
          activeTab === 'all'
            ? 'All Tasks'
            : activeTab === 'today'
            ? 'Today'
            : 'Upcoming'
        }
        tasks={currentTasks}
      />
    </div>
  );
};

export default Dashboard;
