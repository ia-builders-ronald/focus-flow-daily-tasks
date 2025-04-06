
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTaskContext } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, getProject } = useTaskContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const project = getProject(task.projectId);

  const priorityColors = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high',
    urgent: 'bg-priority-urgent',
  };

  const handleToggleCompletion = async () => {
    setIsUpdating(true);
    try {
      await toggleTaskCompletion(task.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border group transition-colors",
      task.completed ? "bg-muted line-through opacity-70" : "hover:bg-accent/50"
    )}>
      <div className="flex items-center gap-3">
        <Checkbox 
          checked={task.completed}
          onCheckedChange={handleToggleCompletion}
          className="data-[state=checked]:bg-primary"
          disabled={isUpdating}
        />
        <div>
          <div className="font-medium">{task.title}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {project && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <span>{project.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}></div>
              <span className="capitalize">{task.priority}</span>
            </div>
            {task.dueDate && (
              <div>
                <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 h-8 w-8"
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskItem;
