
import { supabase } from '@/integrations/supabase/client';
import { Task, Project, Priority, TaskRow, ProjectRow } from '@/types/task';

export const fetchTasks = async (userId: string) => {
  const { data, error } = await (supabase as any)
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  if (!data) return [];
  
  const transformedTasks = data.map((task: TaskRow): Task => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: task.priority as Priority,
    projectId: task.project_id,
    dueDate: task.due_date ? new Date(task.due_date) : null,
    createdAt: new Date(task.created_at)
  }));
  
  return transformedTasks;
};

export const fetchProjects = async (userId: string, defaultProjects: Project[]) => {
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*');
  
  if (error) {
    if (error.code === 'PGRST116') {
      await createDefaultProjects(userId, defaultProjects);
      return fetchProjects(userId, defaultProjects);
    } else {
      throw error;
    }
  }
  
  if (!data || data.length === 0) {
    await createDefaultProjects(userId, defaultProjects);
    return fetchProjects(userId, defaultProjects);
  }
  
  const transformedProjects = data.map((project: ProjectRow): Project => ({
    id: project.id,
    name: project.name,
    color: project.color
  }));
  
  return transformedProjects;
};

const createDefaultProjects = async (userId: string, defaultProjects: Project[]) => {
  for (const project of defaultProjects) {
    await (supabase as any)
      .from('projects')
      .insert({
        name: project.name,
        color: project.color,
        user_id: userId
      });
  }
};

export const createTask = async (
  task: Omit<Task, 'id' | 'createdAt'>, 
  userId: string
) => {
  const dueDate = task.dueDate instanceof Date ? task.dueDate.toISOString() : null;
  
  const { data, error } = await (supabase as any)
    .from('tasks')
    .insert({
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      project_id: task.projectId,
      due_date: dueDate,
      user_id: userId
    })
    .select()
    .single();
    
  if (error) throw error;
  
  if (!data) {
    throw new Error('No data returned after insert');
  }
  
  return {
    id: data.id,
    title: data.title,
    completed: data.completed,
    priority: data.priority as Priority,
    projectId: data.project_id,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at)
  };
};

export const updateTaskById = async (id: string, updateData: Partial<Task>) => {
  const supabaseTaskData: Record<string, any> = {};
  
  if (updateData.title !== undefined) supabaseTaskData.title = updateData.title;
  if (updateData.completed !== undefined) supabaseTaskData.completed = updateData.completed;
  if (updateData.priority !== undefined) supabaseTaskData.priority = updateData.priority;
  if (updateData.projectId !== undefined) supabaseTaskData.project_id = updateData.projectId;
  if (updateData.dueDate !== undefined) {
    supabaseTaskData.due_date = updateData.dueDate instanceof Date ? 
      updateData.dueDate.toISOString() : updateData.dueDate;
  }
  
  const { error } = await (supabase as any)
    .from('tasks')
    .update(supabaseTaskData)
    .eq('id', id);
    
  if (error) throw error;
};

export const deleteTaskById = async (id: string) => {
  const { error } = await (supabase as any)
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

export const createProject = async (project: Omit<Project, 'id'>, userId: string) => {
  const { data, error } = await (supabase as any)
    .from('projects')
    .insert({
      name: project.name,
      color: project.color,
      user_id: userId
    })
    .select()
    .single();
    
  if (error) throw error;
  
  if (!data) {
    throw new Error('No data returned after insert');
  }
  
  return {
    id: data.id,
    name: data.name,
    color: data.color
  };
};

export const deleteProjectById = async (id: string) => {
  const { error } = await (supabase as any)
    .from('projects')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};
