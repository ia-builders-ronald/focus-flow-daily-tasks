
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
