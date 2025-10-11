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

export interface TeamInvitation {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "member" | "viewer";
  projectId?: string; // If invitation is for specific project
  invitedBy: string; // User ID who sent the invitation
  invitedByName: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string; // Unique token for invitation link
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  phone?: string;
  department?: string;
}

export interface InvitationFormData {
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  phone?: string;
  department?: string;
  projectId?: string; // For project-specific invitations
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

// Mock invitations data
export const mockInvitations: TeamInvitation[] = [
  {
    id: "inv1",
    email: "alex@company.com",
    name: "Alex Thompson",
    role: "member",
    invitedBy: "u1",
    invitedByName: "Sarah Chen",
    status: "pending",
    token: "inv_abc123xyz",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    phone: "+1 (555) 789-0123",
    department: "Engineering"
  },
  {
    id: "inv2",
    email: "maria@company.com",
    name: "Maria Garcia",
    role: "viewer",
    projectId: "p1",
    invitedBy: "u2",
    invitedByName: "Marcus Johnson",
    status: "pending",
    token: "inv_def456uvw",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    department: "Design"
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

// Invitation service functions
export function generateInvitationToken(): string {
  return 'inv_' + Math.random().toString(36).substr(2, 9);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateInvitationForm(data: InvitationFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name.trim()) {
    errors.push("Name is required");
  }
  
  if (!data.email.trim()) {
    errors.push("Email is required");
  } else if (!validateEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!data.role) {
    errors.push("Role is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function createInvitation(
  formData: InvitationFormData,
  invitedBy: string,
  invitedByName: string
): TeamInvitation {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  return {
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    email: formData.email.toLowerCase().trim(),
    name: formData.name.trim(),
    role: formData.role,
    projectId: formData.projectId,
    invitedBy,
    invitedByName,
    status: "pending",
    token: generateInvitationToken(),
    createdAt: now,
    expiresAt,
    phone: formData.phone?.trim(),
    department: formData.department?.trim()
  };
}

// Supabase integration functions
export async function createSupabaseInvitation(
  invitation: TeamInvitation,
  teamId: string = 'default-team'
): Promise<{ error: any }> {
  try {
    const { supabase } = await import('./supabase');
    
    const { error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email: invitation.email,
        role: invitation.role,
        invited_by: invitation.invitedBy,
        token: invitation.token,
        status: invitation.status,
        expires_at: invitation.expiresAt.toISOString(),
      });

    return { error };
  } catch (error) {
    return { error };
  }
}

export async function getSupabaseInvitations(teamId: string = 'default-team'): Promise<{ data: TeamInvitation[] | null; error: any }> {
  try {
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const invitations: TeamInvitation[] = (data || []).map(inv => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invited_by,
      invitedByName: 'Current User', // You'd join with profiles table
      status: inv.status,
      token: inv.token,
      createdAt: new Date(inv.created_at),
      expiresAt: new Date(inv.expires_at),
      acceptedAt: inv.accepted_at ? new Date(inv.accepted_at) : undefined,
      projectId: undefined, // Add if you have project-specific invitations
      phone: undefined,
      department: undefined
    }));

    return { data: invitations, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function getPendingInvitations(allInvitations: TeamInvitation[]): TeamInvitation[] {
  return allInvitations.filter(inv => inv.status === "pending" && new Date() < inv.expiresAt);
}

export function getExpiredInvitations(allInvitations: TeamInvitation[]): TeamInvitation[] {
  return allInvitations.filter(inv => inv.status === "pending" && new Date() >= inv.expiresAt);
}

export function getInvitationsForProject(projectId: string, allInvitations: TeamInvitation[]): TeamInvitation[] {
  return allInvitations.filter(inv => inv.projectId === projectId);
}

export function isEmailAlreadyInvited(email: string, allInvitations: TeamInvitation[]): boolean {
  return allInvitations.some(inv => 
    inv.email.toLowerCase() === email.toLowerCase() && 
    (inv.status === "pending" || inv.status === "accepted")
  );
}

export function isEmailAlreadyMember(email: string, allMembers: TeamMember[]): boolean {
  return allMembers.some(member => member.email.toLowerCase() === email.toLowerCase());
}

export function simulateEmailInvitation(invitation: TeamInvitation): Promise<boolean> {
  // Simulate email sending with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📧 Invitation email sent to ${invitation.email}`);
      console.log(`   Name: ${invitation.name}`);
      console.log(`   Role: ${invitation.role}`);
      console.log(`   Invitation Link: https://rena.ai/invite/${invitation.token}`);
      console.log(`   Expires: ${invitation.expiresAt.toLocaleDateString()}`);
      resolve(true);
    }, 1000);
  });
}

export function acceptInvitation(
  token: string,
  allInvitations: TeamInvitation[],
  allMembers: TeamMember[]
): { success: boolean; message: string; newMember?: TeamMember } {
  const invitation = allInvitations.find(inv => inv.token === token);
  
  if (!invitation) {
    return { success: false, message: "Invitation not found" };
  }
  
  if (invitation.status !== "pending") {
    return { success: false, message: "Invitation has already been processed" };
  }
  
  if (new Date() >= invitation.expiresAt) {
    return { success: false, message: "Invitation has expired" };
  }
  
  // Check if email is already a member
  if (isEmailAlreadyMember(invitation.email, allMembers)) {
    return { success: false, message: "Email is already registered as a team member" };
  }
  
  // Create new team member
  const newMember: TeamMember = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: invitation.name || invitation.email.split('@')[0],
    email: invitation.email,
    role: invitation.role,
    status: "online",
    lastActive: new Date(),
    projects: invitation.projectId ? [invitation.projectId] : []
  };
  
  return { 
    success: true, 
    message: "Invitation accepted successfully", 
    newMember 
  };
}

