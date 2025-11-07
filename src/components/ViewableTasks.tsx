import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  MoreHorizontal,
  Eye,
  EyeOff,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FirebaseWorkspaceTasksService, type FirebaseWorkspaceTask } from "@/lib/firebase-business-map";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";

interface ViewableTasksProps {
  projectId?: string;
  currentUser?: string;
  teamId?: string;
}

export default function ViewableTasks({ projectId, currentUser = "Current User", teamId }: ViewableTasksProps) {
  const { user } = useFirebaseAuth();
  const [tasks, setTasks] = useState<FirebaseWorkspaceTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<FirebaseWorkspaceTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FirebaseWorkspaceTask["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | FirebaseWorkspaceTask["priority"]>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as FirebaseWorkspaceTask["priority"],
    assignee: currentUser,
    visibility: "team" as FirebaseWorkspaceTask["visibility"],
    tags: "",
    dueDate: "",
    startDate: ""
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FirebaseWorkspaceTask | null>(null);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    status: "todo" as FirebaseWorkspaceTask["status"],
    priority: "medium" as FirebaseWorkspaceTask["priority"],
    assignee: currentUser,
    visibility: "team" as FirebaseWorkspaceTask["visibility"],
    tags: "",
    dueDate: "",
    startDate: ""
  });

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('📝 Loading tasks...');
        
        const currentTeamId = teamId || 'default-team';
        
        // The service now returns immediately from localStorage with user-specific keys
        const tasks = await FirebaseWorkspaceTasksService.getTasks(user.uid, currentTeamId, projectId);
        setTasks(tasks);
        console.log('✅ Tasks loaded:', tasks.length);
        
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [teamId, user, projectId]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (assigneeFilter !== "all") {
      filtered = filtered.filter(task => task.assignee === assigneeFilter);
    }

    if (selectedTag) {
      filtered = filtered.filter(task => task.tags.includes(selectedTag));
    }

    setFilteredTasks(filtered);
  }, [tasks, projectId, searchQuery, statusFilter, priorityFilter, assigneeFilter, selectedTag]);

  // Get unique values for filters
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));
  const allAssignees = Array.from(new Set(tasks.map(task => task.assignee)));

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusColor = (status: FirebaseWorkspaceTask["status"]) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      case "done": return "bg-green-100 text-green-800";
    }
  };

  const getPriorityColor = (priority: FirebaseWorkspaceTask["priority"]) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
    }
  };

  const getStatusIcon = (status: FirebaseWorkspaceTask["status"]) => {
    switch (status) {
      case "todo": return <Circle className="w-4 h-4" />;
      case "in-progress": return <Clock className="w-4 h-4" />;
      case "review": return <Eye className="w-4 h-4" />;
      case "done": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskProgress = (task: FirebaseWorkspaceTask) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === "done" ? 100 : task.status === "in-progress" ? 50 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.status === "done").length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  const openEditTaskDialog = (task: FirebaseWorkspaceTask) => {
    setEditingTask(task);
    setEditTask({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      visibility: task.visibility || "team",
      tags: task.tags.join(", "),
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
      startDate: task.startDate ? task.startDate.toISOString().split("T")[0] : ""
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedTask = async () => {
    if (!editingTask || !user) return;

    try {
      const currentTeamId = teamId || 'default-team';
      const updates: Partial<FirebaseWorkspaceTask> = {
        title: editTask.title.trim(),
        description: editTask.description,
        status: editTask.status,
        priority: editTask.priority,
        assignee: editTask.assignee,
        visibility: editTask.visibility,
        tags: editTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        dueDate: editTask.dueDate ? new Date(editTask.dueDate) : undefined,
        startDate: editTask.startDate ? new Date(editTask.startDate) : undefined
      };

      const updatedTask = await FirebaseWorkspaceTasksService.updateTask(
        editingTask.id,
        updates,
        user.uid,
        currentTeamId
      );

      setTasks(prev => prev.map(task => task.id === updatedTask.id ? {
        ...task,
        ...updatedTask,
        tags: (updatedTask.tags || []).map(tag => typeof tag === 'string' ? tag : String(tag)),
        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : undefined,
        startDate: updatedTask.startDate ? new Date(updatedTask.startDate) : undefined
      } : task));

      setIsEditDialogOpen(false);
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Your task changes have been saved."
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Update Failed",
        description: "We couldn't update the task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleTaskCompletion = async (task: FirebaseWorkspaceTask) => {
    if (!user) return;

    try {
      const currentTeamId = teamId || 'default-team';
      const newStatus: FirebaseWorkspaceTask["status"] = task.status === 'done' ? 'todo' : 'done';

      const updatedTask = await FirebaseWorkspaceTasksService.updateTask(
        task.id,
        { status: newStatus },
        user.uid,
        currentTeamId
      );
 
      setTasks(prev => prev.map(t => t.id === task.id ? {
        ...t,
        ...updatedTask,
        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : undefined,
        startDate: updatedTask.startDate ? new Date(updatedTask.startDate) : undefined,
        tags: (updatedTask.tags || []).map(tag => typeof tag === 'string' ? tag : String(tag))
      } : t));

      toast({
        title: newStatus === 'done' ? "Task Completed" : "Task Reopened",
        description: newStatus === 'done'
          ? 'Nice work! The task is marked as completed.'
          : 'The task is back in your active list.'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Update Failed",
        description: "We couldn't update the task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (task: FirebaseWorkspaceTask) => {
    if (!user) return;

    const confirmDelete = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const currentTeamId = teamId || 'default-team';
      await FirebaseWorkspaceTasksService.deleteTask(task.id, user.uid, currentTeamId);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast({
        title: "Task Deleted",
        description: 'The task has been removed from your list.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Delete Failed",
        description: "We couldn't delete the task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !user) return;

    try {
      const currentTeamId = teamId || 'default-team';
      
      const task = await FirebaseWorkspaceTasksService.createTask({
        title: newTask.title,
        description: newTask.description,
        status: "todo",
        priority: newTask.priority,
        assignee: newTask.assignee,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        projectId: projectId || undefined,
        visibility: newTask.visibility,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        startDate: newTask.startDate ? new Date(newTask.startDate) : undefined,
        subtasks: []
      }, user.uid, currentTeamId);

      setTasks(prev => [task, ...prev]);
      console.log('✅ Task created successfully');

      setNewTask({ 
        title: "", 
        description: "", 
        priority: "medium", 
        assignee: currentUser, 
        visibility: "team", 
        tags: "",
        dueDate: "",
        startDate: ""
      });
      setIsCreating(false);
      
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderTaskCard = (task: FirebaseWorkspaceTask) => {
    const progress = getTaskProgress(task);
    const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
    const isExpanded = expandedTasks.has(task.id);
    const isCompleted = task.status === 'done';

    return (
      <Card
        key={task.id}
        className={cn(
          "hover:shadow-md transition-shadow",
          isCompleted ? "border-green-500/30 bg-green-500/5" : ""
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1 text-muted-foreground">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight break-words">
                  {task.title}
                </CardTitle>
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <Badge className={cn("text-xs", getStatusColor(task.status))}>
                    {task.status.replace("-", " ")}
                  </Badge>
                  <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        isOverdue
                          ? "text-red-600"
                          : daysUntilDue !== null && daysUntilDue <= 3
                            ? "text-yellow-600"
                            : "text-muted-foreground"
                      )}
                    >
                      <Calendar className="w-3 h-3" />
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntilDue)} days`
                        : daysUntilDue === 0
                          ? "Due today"
                          : daysUntilDue === 1
                            ? "Due tomorrow"
                            : `Due in ${daysUntilDue} days`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isCompleted ? "text-green-600" : "text-muted-foreground")}
                onClick={() => handleToggleTaskCompletion(task)}
                aria-label={isCompleted ? "Reopen task" : "Mark task as completed"}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEditTaskDialog(task)}
                aria-label="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteTask(task)}
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleTaskExpansion(task.id)}
                aria-label="Show task details"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {task.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {(task.startDate || task.dueDate) && (
            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
              {task.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Start: {task.startDate.toLocaleDateString()}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Due: {task.dueDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && isExpanded && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Subtasks ({task.subtasks.length})</h4>
              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3 p-2 bg-secondary/50 rounded-md">
                    {getStatusIcon(subtask.status)}
                    <span className="text-sm flex-1">{subtask.title}</span>
                    <Badge className={cn("text-xs", getStatusColor(subtask.status))}>
                      {subtask.status.replace("-", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const activeTasks = filteredTasks.filter(task => task.status !== 'done');
  const completedTasks = filteredTasks.filter(task => task.status === 'done');

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Viewable Tasks</h2>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Viewable Tasks</h2>
        <p className="text-muted-foreground">
          {projectId ? "Project tasks and progress tracking" : "Team tasks and progress tracking"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Assignee:</span>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            {allAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Form */}
      {isCreating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Textarea
              placeholder="Task description..."
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as FirebaseWorkspaceTask["priority"] }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Assignee</label>
                <Input
                  placeholder="Assignee name..."
                  value={newTask.assignee}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Tags (comma separated)..."
                value={newTask.tags}
                onChange={(e) => setNewTask(prev => ({ ...prev, tags: e.target.value }))}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={newTask.visibility}
                onChange={(e) => setNewTask(prev => ({ ...prev, visibility: e.target.value as FirebaseWorkspaceTask["visibility"] }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Create Task
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          {activeTasks.map(renderTaskCard)}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
            <Badge variant="secondary" className="text-xs">
              {completedTasks.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {completedTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || selectedTag
              ? "Try adjusting your search or filter criteria."
              : "No tasks have been created yet."
            }
          </p>
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Task title..."
              value={editTask.title}
              onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Textarea
              placeholder="Task description..."
              value={editTask.description}
              onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                <select
                  value={editTask.status}
                  onChange={(e) => setEditTask(prev => ({ ...prev, status: e.target.value as FirebaseWorkspaceTask["status"] }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={editTask.priority}
                  onChange={(e) => setEditTask(prev => ({ ...prev, priority: e.target.value as FirebaseWorkspaceTask["priority"] }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Assignee</label>
                <Input
                  placeholder="Assignee name..."
                  value={editTask.assignee}
                  onChange={(e) => setEditTask(prev => ({ ...prev, assignee: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Visibility</label>
                <select
                  value={editTask.visibility}
                  onChange={(e) => setEditTask(prev => ({ ...prev, visibility: e.target.value as FirebaseWorkspaceTask["visibility"] }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="private">Private</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={editTask.startDate}
                  onChange={(e) => setEditTask(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Input
              placeholder="Tags (comma separated)..."
              value={editTask.tags}
              onChange={(e) => setEditTask(prev => ({ ...prev, tags: e.target.value }))}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveEditedTask} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
