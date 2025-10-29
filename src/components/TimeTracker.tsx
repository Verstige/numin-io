import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  BarChart3,
  Target,
  Users,
  Filter,
  Download,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Timer,
  History,
  TrendingUp
} from "lucide-react";
import { TimeEntry, TimeLog, ProjectTimeStats, UserTimeProfile, TimerState, TimeTrackingFilters } from "@/types/timeTracking";
import { BusinessMapNodesService, BusinessMapNode } from "@/lib/firebase-business-map";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

interface TimeTrackerProps {
  userId: string;
  teamId: string;
  onTimeEntryUpdate?: (entry: TimeEntry) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ 
  userId, 
  teamId, 
  onTimeEntryUpdate 
}) => {
  const { user } = useFirebaseAuth();
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0
  });
  const [businessMapNodes, setBusinessMapNodes] = useState<BusinessMapNode[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserTimeProfile | null>(null);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [filters, setFilters] = useState<TimeTrackingFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper functions to filter nodes by type
  const getBusinessNodes = () => businessMapNodes.filter(node => node.nodeType === 'business');
  const getProjectNodes = () => businessMapNodes.filter(node => node.nodeType === 'subproject');
  const getTaskNodes = () => businessMapNodes.filter(node => node.nodeType === 'task');

  // Load business map nodes
  const loadBusinessMapNodes = async () => {
    if (!user || !userId || !teamId) return;
    
    try {
      const nodes = await BusinessMapNodesService.getNodes(userId, teamId);
      setBusinessMapNodes(nodes);
    } catch (error) {
      console.error('Error loading business map nodes:', error);
      // Set empty array as fallback to prevent crashes
      setBusinessMapNodes([]);
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    loadTimeEntries();
    loadUserProfile();
    loadBusinessMapNodes();
  }, [userId, teamId, user]);

  // Subscribe to real-time business map node changes
  useEffect(() => {
    if (!user || !userId || !teamId) return;

    try {
      const unsubscribe = BusinessMapNodesService.subscribeToNodes(userId, teamId, (nodes) => {
        setBusinessMapNodes(nodes);
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up business map subscription:', error);
    }
  }, [userId, teamId, user]);

  // Timer effect
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1000
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning]);

  const loadTimeEntries = () => {
    const stored = localStorage.getItem(`timeEntries_${userId}`);
    if (stored) {
      const entries = JSON.parse(stored).map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : undefined,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt)
      }));
      setTimeEntries(entries);
    }
  };

  const saveTimeEntries = (entries: TimeEntry[]) => {
    localStorage.setItem(`timeEntries_${userId}`, JSON.stringify(entries));
    setTimeEntries(entries);
  };

  const loadUserProfile = () => {
    const stored = localStorage.getItem(`userProfile_${userId}`);
    if (stored) {
      const profile = JSON.parse(stored);
      setUserProfile({
        ...profile,
        dailyStats: profile.dailyStats?.map((stat: any) => ({
          ...stat,
          entries: stat.entries.map((entry: any) => ({
            ...entry,
            startTime: new Date(entry.startTime),
            endTime: entry.endTime ? new Date(entry.endTime) : undefined,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt)
          }))
        })) || []
      });
    }
  };

  const saveUserProfile = (profile: UserTimeProfile) => {
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profile));
    setUserProfile(profile);
  };

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startTimer = () => {
    // At least one selection and description required
    const hasSelection = selectedBusiness || selectedProject || selectedTask;
    
    if (!hasSelection || !description.trim()) {
      alert("Please select at least one business map element and enter a description");
      return;
    }

    const newEntry: TimeEntry = {
      id: `entry_${Date.now()}`,
      businessId: selectedBusiness || undefined,
      projectId: selectedProject || undefined,
      taskId: selectedTask || undefined,
      userId,
      description: description.trim(),
      startTime: new Date(),
      isActive: true,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTimerState({
      isRunning: true,
      currentEntry: newEntry,
      startTime: new Date(),
      elapsedTime: 0
    });

    onTimeEntryUpdate?.(newEntry);
  };

  const pauseTimer = () => {
    if (timerState.currentEntry) {
      const updatedEntry = {
        ...timerState.currentEntry,
        endTime: new Date(),
        duration: timerState.elapsedTime,
        isActive: false,
        updatedAt: new Date()
      };

      const updatedEntries = [...timeEntries, updatedEntry];
      saveTimeEntries(updatedEntries);
      updateUserProfile(updatedEntry);

      setTimerState({
        isRunning: false,
        currentEntry: undefined,
        elapsedTime: 0
      });

      // Reset form
      setDescription("");
      setTags("");
      setSelectedBusiness("");
      setSelectedProject("");
      setSelectedTask("");

      onTimeEntryUpdate?.(updatedEntry);
    }
  };

  const stopTimer = () => {
    if (timerState.currentEntry) {
      pauseTimer();
    }
  };

  const updateUserProfile = (entry: TimeEntry) => {
    const existingProfile = userProfile || {
      userId,
      totalTimeLogged: 0,
      dailyStats: [],
      weeklyStats: [],
      monthlyStats: [],
      favoriteProjects: []
    };

    const entryDate = entry.startTime.toISOString().split('T')[0];
    const entryWeek = getWeekString(entry.startTime);
    const entryMonth = entry.startTime.toISOString().substring(0, 7);

    // Update daily stats
    const dailyStats = [...existingProfile.dailyStats];
    const dayIndex = dailyStats.findIndex(stat => stat.date === entryDate);
    
    if (dayIndex >= 0) {
      dailyStats[dayIndex].totalTime += entry.duration || 0;
      dailyStats[dayIndex].entries.push(entry);
    } else {
      dailyStats.push({
        date: entryDate,
        totalTime: entry.duration || 0,
        entries: [entry]
      });
    }

    // Update total time
    const totalTimeLogged = existingProfile.totalTimeLogged + (entry.duration || 0);

    // Update favorite business map elements
    const favoriteElements = [...existingProfile.favoriteProjects];
    
    // Add time to the primary selected element
    const primaryElementId = entry.businessId || entry.projectId || entry.taskId;
    
    if (primaryElementId) {
      const elementIndex = favoriteElements.findIndex(fp => fp.projectId === primaryElementId);
      const element = businessMapNodes.find(n => n.id === primaryElementId);
      
      if (elementIndex >= 0) {
        favoriteElements[elementIndex].totalTime += entry.duration || 0;
      } else if (element) {
        favoriteElements.push({
          projectId: primaryElementId,
          projectName: element.data.title,
          totalTime: entry.duration || 0
        });
      }
    }

    const updatedProfile: UserTimeProfile = {
      ...existingProfile,
      totalTimeLogged,
      dailyStats,
      favoriteProjects: favoriteElements.sort((a, b) => b.totalTime - a.totalTime).slice(0, 5)
    };

    saveUserProfile(updatedProfile);
  };

  const getWeekString = (date: Date): string => {
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) + (new Date(year, 0, 1).getDay() + 1) * 24 * 60 * 60 * 1000) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const deleteEntry = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    saveTimeEntries(updatedEntries);
  };

  const editEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsAddEntryOpen(true);
  };

  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= filters.dateRange.start && entryDate <= filters.dateRange.end;
  });

  const totalTimeToday = timeEntries
    .filter(entry => {
      const today = new Date().toDateString();
      return new Date(entry.startTime).toDateString() === today;
    })
    .reduce((total, entry) => total + (entry.duration || 0), 0);


  return (
    <div className="w-full space-y-6">
      {/* Timer Card */}
      <Card className="border-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Time Tracker
            {timerState.isRunning && (
              <Badge variant="destructive" className="animate-pulse">
                <PlayCircle className="w-3 h-3 mr-1" />
                Running
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-primary mb-2">
              {formatDuration(timerState.elapsedTime)}
            </div>
            {timerState.currentEntry && (
              <div className="text-sm text-muted-foreground">
                Tracking: {timerState.currentEntry.description}
              </div>
            )}
          </div>

          {/* Business Map Element Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business</label>
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {getBusinessNodes().map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {getProjectNodes().map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Task</label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {getTaskNodes().map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                disabled={timerState.isRunning}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                disabled={timerState.isRunning}
              />
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-4">
            {!timerState.isRunning ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedProject || !description.trim()}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseTimer}
                  size="lg"
                  variant="outline"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={stopTimer}
                  size="lg"
                  variant="destructive"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop & Save
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatDuration(totalTimeToday)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Logged</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatDuration(userProfile?.totalTimeLogged || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Entries</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {timeEntries.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Time Logs
            </CardTitle>
            <Button
              onClick={() => setIsAddEntryOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time entries found. Start tracking your time!
              </div>
            ) : (
              filteredEntries
                .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                .map(entry => {
                  // Find the selected business map elements
                  const business = businessMapNodes.find(n => n.id === entry.businessId);
                  const project = businessMapNodes.find(n => n.id === entry.projectId);
                  const task = businessMapNodes.find(n => n.id === entry.taskId);

                  // Build the element chain
                  const elementChain = [
                    business?.data.title,
                    project?.data.title,
                    task?.data.title
                  ].filter(Boolean).join(' → ');

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{entry.description}</h4>
                          {entry.isActive && (
                            <Badge variant="destructive" className="animate-pulse">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            <strong>{elementChain || 'No elements selected'}</strong>
                          </div>
                          <div>
                            {formatDate(entry.startTime)} • {formatTime(entry.startTime)}
                            {entry.endTime && ` - ${formatTime(entry.endTime)}`}
                          </div>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {entry.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-mono font-bold">
                            {formatDuration(entry.duration || 0)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => editEntry(entry)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteEntry(entry.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Entry Modal */}
      <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry ? "Modify the details of your time entry" : "Create a new time entry for tracking your work"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add manual entry form here */}
            <p className="text-muted-foreground">
              Manual entry form would go here...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTracker;
