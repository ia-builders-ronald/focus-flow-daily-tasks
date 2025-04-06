
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Task, Project, Priority } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
  getProject: (id: string) => Project | undefined;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'Personal', color: '#9b87f5' },
  { id: '2', name: 'Work', color: '#33C3F0' },
  { id: '3', name: 'Shopping', color: '#F97316' },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const { toast } = useToast();

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    
    setTasks((prev) => [...prev, newTask]);
    toast({
      title: "Task created",
      description: `"${task.title}" has been added to your tasks.`,
    });
  }, [toast]);

  const updateTask = useCallback((id: string, updatedTask: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const taskToDelete = prev.find(task => task.id === id);
      const newTasks = prev.filter((task) => task.id !== id);
      
      if (taskToDelete) {
        toast({
          title: "Task deleted",
          description: `"${taskToDelete.title}" has been removed.`,
        });
      }
      
      return newTasks;
    });
  }, [toast]);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
    };
    setProjects((prev) => [...prev, newProject]);
    toast({
      title: "Project created",
      description: `"${project.name}" has been added to your projects.`,
    });
  }, [toast]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const projectToDelete = prev.find(project => project.id === id);
      const newProjects = prev.filter((project) => project.id !== id);
      
      if (projectToDelete) {
        toast({
          title: "Project deleted",
          description: `"${projectToDelete.name}" has been removed.`,
        });
      }
      
      return newProjects;
    });
  }, [toast]);

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return tasks.filter((task) => task.projectId === projectId);
    },
    [tasks]
  );

  const getTasksByPriority = useCallback(
    (priority: Priority) => {
      return tasks.filter((task) => task.priority === priority);
    },
    [tasks]
  );

  const getProject = useCallback(
    (id: string) => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addProject,
        deleteProject,
        getTasksByProject,
        getTasksByPriority,
        getProject,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
