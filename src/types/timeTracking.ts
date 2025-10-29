export interface TimeEntry {
  id: string;
  businessId?: string;
  projectId?: string;
  systemId?: string;
  processId?: string;
  taskId?: string;
  milestoneId?: string;
  resourceId?: string;
  teamId?: string;
  userId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeLog {
  id: string;
  entries: TimeEntry[];
  totalTime: number; // in milliseconds
  date: string; // YYYY-MM-DD format
  userId: string;
}

export interface ProjectTimeStats {
  projectId: string;
  projectName: string;
  totalTime: number;
  entries: TimeEntry[];
  subProjectStats?: {
    subProjectId: string;
    subProjectName: string;
    totalTime: number;
    entries: TimeEntry[];
  }[];
  legStats?: {
    legId: string;
    legName: string;
    totalTime: number;
    entries: TimeEntry[];
  }[];
}

export interface UserTimeProfile {
  userId: string;
  totalTimeLogged: number;
  activeTimer?: TimeEntry;
  dailyStats: {
    date: string;
    totalTime: number;
    entries: TimeEntry[];
  }[];
  weeklyStats: {
    week: string; // YYYY-WW format
    totalTime: number;
    entries: TimeEntry[];
  }[];
  monthlyStats: {
    month: string; // YYYY-MM format
    totalTime: number;
    entries: TimeEntry[];
  }[];
  favoriteProjects: {
    projectId: string;
    projectName: string;
    totalTime: number;
  }[];
}

export interface TimerState {
  isRunning: boolean;
  currentEntry?: TimeEntry;
  startTime?: Date;
  elapsedTime: number;
}

export interface TimeTrackingFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  projects?: string[];
  subProjects?: string[];
  legs?: string[];
  tags?: string[];
  userId?: string;
}
