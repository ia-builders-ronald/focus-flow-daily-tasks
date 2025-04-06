
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  projectId: string;
  dueDate: Date | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

// These interfaces match the actual database structure
export interface TaskRow {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  project_id: string;
  due_date: string | null;
  user_id: string;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  color: string;
  user_id: string;
}
