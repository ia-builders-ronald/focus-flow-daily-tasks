
import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { Task, Project, Priority } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  fetchTasks, 
  fetchProjects, 
  createTask, 
  updateTaskById,
  deleteTaskById,
  createProject,
  deleteProjectById
} from '@/services/supabase/taskService';
import {
  getTasksByProject,
  getTasksByPriority,
  getProjectById,
  DEFAULT_PROJECTS
} from '@/utils/taskUtils';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
  getProject: (id: string) => Project | undefined;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setTasks([]);
      setProjects(DEFAULT_PROJECTS);
      setIsLoading(false);
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [tasksData, projectsData] = await Promise.all([
        fetchTasks(user.id),
        fetchProjects(user.id, DEFAULT_PROJECTS)
      ]);
      
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error: any) {
      toast.error('Failed to load data', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newTask = await createTask(task, user.id);
      setTasks((prev) => [newTask, ...prev]);
      
      toast.success('Task created', {
        description: `"${task.title}" has been added to your tasks.`
      });
    } catch (error: any) {
      toast.error('Failed to create task', {
        description: error.message
      });
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updatedTask: Partial<Task>) => {
    if (!user) return;
    
    try {
      await updateTaskById(id, updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
      );
    } catch (error: any) {
      toast.error('Failed to update task', {
        description: error.message
      });
    }
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const taskToDelete = tasks.find(task => task.id === id);
      
      await deleteTaskById(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      if (taskToDelete) {
        toast.success('Task deleted', {
          description: `"${taskToDelete.title}" has been removed.`
        });
      }
    } catch (error: any) {
      toast.error('Failed to delete task', {
        description: error.message
      });
    }
  }, [tasks, user]);

  const toggleTaskCompletion = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      await updateTaskById(id, { completed: !task.completed });
      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error: any) {
      toast.error('Failed to update task', {
        description: error.message
      });
    }
  }, [tasks, user]);

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    if (!user) return;
    
    try {
      const newProject = await createProject(project, user.id);
      
      setProjects((prev) => [...prev, newProject]);
      
      toast.success('Project created', {
        description: `"${project.name}" has been added to your projects.`
      });
    } catch (error: any) {
      toast.error('Failed to create project', {
        description: error.message
      });
    }
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const projectToDelete = projects.find(project => project.id === id);
      
      await deleteProjectById(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      
      if (projectToDelete) {
        toast.success('Project deleted', {
          description: `"${projectToDelete.name}" has been removed.`
        });
      }
    } catch (error: any) {
      toast.error('Failed to delete project', {
        description: error.message
      });
    }
  }, [projects, user]);

  const contextValue: TaskContextType = {
    tasks,
    projects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addProject,
    deleteProject,
    getTasksByProject: useCallback((projectId) => getTasksByProject(tasks, projectId), [tasks]),
    getTasksByPriority: useCallback((priority) => getTasksByPriority(tasks, priority), [tasks]),
    getProject: useCallback((id) => getProjectById(projects, id), [projects]),
    isLoading,
  };

  return (
    <TaskContext.Provider value={contextValue}>
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
