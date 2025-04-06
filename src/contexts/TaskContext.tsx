
import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { Task, Project, Priority, TaskRow, ProjectRow, GenericSupabaseRow } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

const defaultProjects: Project[] = [
  { id: '1', name: 'Personal', color: '#9b87f5' },
  { id: '2', name: 'Work', color: '#33C3F0' },
  { id: '3', name: 'Shopping', color: '#F97316' },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
    } else {
      setTasks([]);
      setProjects(defaultProjects);
      setIsLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // Use type assertion to work with the tasks table
      const { data, error } = await (supabase
        .from('tasks') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data) {
        setTasks([]);
        return;
      }
      
      const transformedTasks = data.map((task: TaskRow): Task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority as Priority,
        projectId: task.project_id,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        createdAt: new Date(task.created_at)
      }));
      
      setTasks(transformedTasks);
    } catch (error: any) {
      toast.error('Failed to load tasks', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Use type assertion to work with the projects table
      const { data, error } = await (supabase
        .from('projects') as any)
        .select('*');
      
      if (error) {
        if (error.code === 'PGRST116') {
          await Promise.all(defaultProjects.map(async (project) => {
            await (supabase
              .from('projects') as any)
              .insert({
                name: project.name,
                color: project.color,
                user_id: user?.id
              });
          }));
          
          const { data: retryData, error: retryError } = await (supabase
            .from('projects') as any)
            .select('*');
          
          if (retryError) throw retryError;
          
          if (!retryData) {
            setProjects(defaultProjects);
            return;
          }
          
          const transformedProjects = retryData.map((project: ProjectRow): Project => ({
            id: project.id,
            name: project.name,
            color: project.color
          }));
          
          setProjects(transformedProjects);
          return;
        } else {
          throw error;
        }
      }
      
      if (data && data.length > 0) {
        const transformedProjects = data.map((project: ProjectRow): Project => ({
          id: project.id,
          name: project.name,
          color: project.color
        }));
        
        setProjects(transformedProjects);
      } else {
        await Promise.all(defaultProjects.map(async (project) => {
          await (supabase
            .from('projects') as any)
            .insert({
              name: project.name,
              color: project.color,
              user_id: user?.id
            });
        }));
        
        const { data: newData, error: newError } = await (supabase
          .from('projects') as any)
          .select('*');
          
        if (newError) throw newError;
        
        if (!newData) {
          setProjects(defaultProjects);
          return;
        }
        
        const transformedProjects = newData.map((project: ProjectRow): Project => ({
          id: project.id,
          name: project.name,
          color: project.color
        }));
        
        setProjects(transformedProjects);
      }
    } catch (error: any) {
      toast.error('Failed to load projects', {
        description: error.message
      });
      setProjects(defaultProjects);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const dueDate = task.dueDate instanceof Date ? task.dueDate.toISOString() : null;
      
      const { data, error } = await (supabase
        .from('tasks') as any)
        .insert({
          title: task.title,
          completed: task.completed,
          priority: task.priority,
          project_id: task.projectId,
          due_date: dueDate,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after insert');
      }
      
      const newTask: Task = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        priority: data.priority as Priority,
        projectId: data.project_id,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        createdAt: new Date(data.created_at)
      };
      
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
      const supabaseTaskData: GenericSupabaseRow = {};
      
      if (updatedTask.title !== undefined) supabaseTaskData.title = updatedTask.title;
      if (updatedTask.completed !== undefined) supabaseTaskData.completed = updatedTask.completed;
      if (updatedTask.priority !== undefined) supabaseTaskData.priority = updatedTask.priority;
      if (updatedTask.projectId !== undefined) supabaseTaskData.project_id = updatedTask.projectId;
      if (updatedTask.dueDate !== undefined) {
        supabaseTaskData.due_date = updatedTask.dueDate instanceof Date ? 
          updatedTask.dueDate.toISOString() : updatedTask.dueDate;
      }
      
      const { error } = await (supabase
        .from('tasks') as any)
        .update(supabaseTaskData)
        .eq('id', id);
        
      if (error) throw error;
      
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
      
      const { error } = await (supabase
        .from('tasks') as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      
      const { error } = await (supabase
        .from('tasks') as any)
        .update({ completed: !task.completed })
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { data, error } = await (supabase
        .from('projects') as any)
        .insert({
          name: project.name,
          color: project.color,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after insert');
      }
      
      const newProject: Project = {
        id: data.id,
        name: data.name,
        color: data.color
      };
      
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
      
      const { error } = await (supabase
        .from('projects') as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
        isLoading,
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
