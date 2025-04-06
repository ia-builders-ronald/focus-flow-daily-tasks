
import React, { useState } from 'react';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TaskListProps {
  title: string;
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks }) => {
  const { projects, addTask, isLoading } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('low');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      setIsSubmitting(true);
      try {
        await addTask({
          title: newTaskTitle,
          completed: false,
          priority: selectedPriority,
          projectId: selectedProject,
          dueDate: date || null,
        });
        setNewTaskTitle('');
        setSelectedPriority('low');
        setDate(undefined);
        setIsOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={() => setIsOpen(true)} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" /> Add Task
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: project.color }}
                          ></div>
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={selectedPriority} 
                  onValueChange={(value) => setSelectedPriority(value as 'low' | 'medium' | 'high' | 'urgent')}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-priority-low"></div>
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-priority-medium"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-priority-high"></div>
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-priority-urgent"></div>
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-8 text-gray-500">No tasks found</div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
