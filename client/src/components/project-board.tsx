import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  KanbanSquare, 
  Plus, 
  MoreVertical, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  estimatedHours?: number;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  progress: number;
  tasks: Task[];
  teamMembers: any[];
  deadline?: string;
}

interface ProjectBoardProps {
  projectId: string;
  isEditable?: boolean;
}

export default function ProjectBoard({ projectId, isEditable = true }: ProjectBoardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      return apiRequest(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        body: taskData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setShowTaskForm(false);
      toast({
        title: "Task Created",
        description: "New task has been added to the project",
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setEditingTask(null);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Circle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <Circle className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const groupTasksByStatus = () => {
    if (!project?.tasks) return {};
    
    return project.tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const tasksByStatus = groupTasksByStatus();
  const columns = [
    { id: "todo", title: "To Do", tasks: tasksByStatus.todo || [] },
    { id: "in_progress", title: "In Progress", tasks: tasksByStatus.in_progress || [] },
    { id: "review", title: "Review", tasks: tasksByStatus.review || [] },
    { id: "done", title: "Done", tasks: tasksByStatus.done || [] }
  ];

  const TaskForm = ({ task }: { task?: Task }) => {
    const [formData, setFormData] = useState({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      assigneeId: task?.assigneeId || "",
      dueDate: task?.dueDate || "",
      estimatedHours: task?.estimatedHours || 0,
      tags: task?.tags.join(", ") || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const taskData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        status: task?.status || "todo"
      };

      if (task) {
        updateTaskMutation.mutate({ taskId: task.id, updates: taskData });
      } else {
        createTaskMutation.mutate(taskData);
      }
    };

    return (
      <Dialog open={showTaskForm || !!editingTask} onOpenChange={() => {
        setShowTaskForm(false);
        setEditingTask(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={formData.assigneeId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, assigneeId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {project?.teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user.firstName} {member.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedHours: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="frontend, api, bug (separated by commas)"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                className="flex-1"
              >
                {task ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8 text-center">
          <KanbanSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-gray-500">Project not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KanbanSquare className="w-5 h-5" />
            Project Board: {project.name}
            {isEditable && (
              <Button
                size="sm"
                onClick={() => setShowTaskForm(true)}
                className="ml-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            )}
          </CardTitle>
          
          {/* Project Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Project Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map(column => (
              <div key={column.id} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">
                    {column.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>

                {/* Tasks */}
                <div className="space-y-2 min-h-[200px]">
                  {column.tasks.map(task => (
                    <Card
                      key={task.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${getPriorityColor(task.priority)}`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          {/* Task Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(task.priority)}
                              {isEditable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task);
                                  }}
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Task Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              {task.assigneeName && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{task.assigneeName}</span>
                                </div>
                              )}
                              {task.estimatedHours > 0 && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                              )}
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs px-1">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1">
                                  +{task.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTask.title}
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status.replace("_", " ")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedTask.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600">{selectedTask.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Priority: </span>
                    <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  {selectedTask.assigneeName && (
                    <div>
                      <span className="font-medium">Assignee: </span>
                      {selectedTask.assigneeName}
                    </div>
                  )}
                  {selectedTask.dueDate && (
                    <div>
                      <span className="font-medium">Due: </span>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {selectedTask.estimatedHours > 0 && (
                    <div>
                      <span className="font-medium">Estimated: </span>
                      {selectedTask.estimatedHours} hours
                    </div>
                  )}
                </div>

                {selectedTask.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTask.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isEditable && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditingTask(selectedTask)}
                      className="flex-1"
                    >
                      Edit Task
                    </Button>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(status) => {
                        updateTaskMutation.mutate({
                          taskId: selectedTask.id,
                          updates: { status: status as Task["status"] }
                        });
                        setSelectedTask({ ...selectedTask, status: status as Task["status"] });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TaskForm task={editingTask || undefined} />
    </>
  );
}