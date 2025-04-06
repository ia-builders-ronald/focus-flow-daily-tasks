
import { Task, Project, Priority } from '@/types/task';

export const getTasksByProject = (tasks: Task[], projectId: string): Task[] => {
  return tasks.filter((task) => task.projectId === projectId);
};

export const getTasksByPriority = (tasks: Task[], priority: Priority): Task[] => {
  return tasks.filter((task) => task.priority === priority);
};

export const getProjectById = (projects: Project[], id: string): Project | undefined => {
  return projects.find((project) => project.id === id);
};

export const DEFAULT_PROJECTS: Project[] = [
  { id: '1', name: 'Personal', color: '#9b87f5' },
  { id: '2', name: 'Work', color: '#33C3F0' },
  { id: '3', name: 'Shopping', color: '#F97316' },
];
