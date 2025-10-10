// Collaboration system for Rena
// Handles team members, activity feeds, and collaboration features

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "online" | "away" | "offline";
  lastActive?: Date;
  projects: string[]; // Project IDs they're assigned to
}

export interface ActivityItem {
  id: string;
  type: "project_created" | "task_completed" | "status_changed" | "member_added" | "comment_added" | "deadline_approaching" | "milestone_reached";
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Mention {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  read: boolean;
  context: string; // The message or context where they were mentioned
}

// Mock team members data
export const mockTeamMembers: TeamMember[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "owner",
    status: "online",
    lastActive: new Date(),
    projects: ["p1", "p2", "p3"]
  },
  {
    id: "u2", 
    name: "Marcus Johnson",
    email: "marcus@company.com",
    role: "admin",
    status: "away",
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    projects: ["p1", "p2"]
  },
  {
    id: "u3",
    name: "Elena Rodriguez",
    email: "elena@company.com", 
    role: "member",
    status: "online",
    lastActive: new Date(),
    projects: ["p2", "p3"]
  },
  {
    id: "u4",
    name: "David Kim",
    email: "david@company.com",
    role: "member", 
    status: "offline",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    projects: ["p1"]
  }
];

// Mock activity feed data
export const mockActivityFeed: ActivityItem[] = [
  {
    id: "a1",
    type: "task_completed",
    userId: "u1",
    userName: "Sarah Chen",
    projectId: "p1",
    projectName: "VitaTech",
    description: "completed task 'Design user interface mockups'",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    metadata: { taskName: "Design user interface mockups" }
  },
  {
    id: "a2",
    type: "status_changed",
    userId: "u2",
    userName: "Marcus Johnson", 
    projectId: "p2",
    projectName: "Velocity",
    description: "changed project status from Planning to Active",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    metadata: { oldStatus: "Planning", newStatus: "Active" }
  },
  {
    id: "a3",
    type: "member_added",
    userId: "u1",
    userName: "Sarah Chen",
    projectId: "p3",
    projectName: "Verstige",
    description: "added Elena Rodriguez to the project",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: { addedMember: "Elena Rodriguez" }
  },
  {
    id: "a4",
    type: "deadline_approaching",
    userId: "system",
    userName: "Rena AI",
    projectId: "p1", 
    projectName: "VitaTech",
    description: "deadline approaching in 3 days",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    metadata: { daysRemaining: 3 }
  },
  {
    id: "a5",
    type: "milestone_reached",
    userId: "u3",
    userName: "Elena Rodriguez",
    projectId: "p2",
    projectName: "Velocity", 
    description: "reached milestone 'MVP Development Complete'",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    metadata: { milestoneName: "MVP Development Complete" }
  }
];

// Mock mentions data
export const mockMentions: Mention[] = [
  {
    id: "m1",
    userId: "u1",
    userName: "Sarah Chen",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    context: "Hey @Sarah, can you review the VitaTech mockups by tomorrow?"
  },
  {
    id: "m2", 
    userId: "u2",
    userName: "Marcus Johnson",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    context: "@Marcus, the Velocity project is ready for your approval"
  }
];

// Utility functions
export function getTeamMembersForProject(projectId: string, allMembers: TeamMember[]): TeamMember[] {
  return allMembers.filter(member => member.projects.includes(projectId));
}

export function getActivityForProject(projectId: string, allActivity: ActivityItem[]): ActivityItem[] {
  return allActivity.filter(activity => activity.projectId === projectId);
}

export function getUnreadMentions(userId: string, allMentions: Mention[]): Mention[] {
  return allMentions.filter(mention => mention.userId === userId && !mention.read);
}

export function getOnlineTeamMembers(allMembers: TeamMember[]): TeamMember[] {
  return allMembers.filter(member => member.status === "online");
}

export function getRecentActivity(limit: number = 10, allActivity: ActivityItem[]): ActivityItem[] {
  return allActivity
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

// Generate avatar initials from name
export function getAvatarInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate avatar color based on name
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Check if user can perform action based on role
export function canUserPerformAction(userRole: TeamMember["role"], action: string): boolean {
  const permissions = {
    owner: ["all"],
    admin: ["manage_projects", "manage_team", "view_all", "edit_projects", "delete_projects"],
    member: ["view_assigned", "edit_assigned", "comment", "create_tasks"],
    viewer: ["view_assigned", "comment"]
  };
  
  return permissions[userRole]?.includes(action) || permissions[userRole]?.includes("all") || false;
}

