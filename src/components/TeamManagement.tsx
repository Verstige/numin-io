import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Eye,
  Settings,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "pending" | "invited";
  avatar?: string;
  phone?: string;
  department?: string;
  joinedAt: Date;
  lastActive: Date;
  projects: number;
  tasksCompleted: number;
  tasksAssigned: number;
  performance: number; // 1-100
  timezone?: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  averagePerformance: number;
  totalProjects: number;
  completedTasks: number;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "tm1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "owner",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
    phone: "+1 (555) 123-4567",
    department: "Product Management",
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    projects: 5,
    tasksCompleted: 127,
    tasksAssigned: 15,
    performance: 95,
    timezone: "PST"
  },
  {
    id: "tm2",
    name: "Mike Rodriguez",
    email: "mike@company.com",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    phone: "+1 (555) 234-5678",
    department: "Engineering",
    joinedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    projects: 3,
    tasksCompleted: 89,
    tasksAssigned: 8,
    performance: 88,
    timezone: "EST"
  },
  {
    id: "tm3",
    name: "Emily Johnson",
    email: "emily@company.com",
    role: "member",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    phone: "+1 (555) 345-6789",
    department: "Design",
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    projects: 2,
    tasksCompleted: 45,
    tasksAssigned: 6,
    performance: 92,
    timezone: "PST"
  },
  {
    id: "tm4",
    name: "David Park",
    email: "david@company.com",
    role: "member",
    status: "pending",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    phone: "+1 (555) 456-7890",
    department: "Marketing",
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    projects: 0,
    tasksCompleted: 0,
    tasksAssigned: 0,
    performance: 0,
    timezone: "CST"
  },
  {
    id: "tm5",
    name: "Lisa Wang",
    email: "lisa@company.com",
    role: "viewer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    phone: "+1 (555) 567-8901",
    department: "Sales",
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    projects: 1,
    tasksCompleted: 12,
    tasksAssigned: 2,
    performance: 75,
    timezone: "EST"
  }
];

const mockStats: TeamStats = {
  totalMembers: 5,
  activeMembers: 4,
  pendingInvites: 1,
  averagePerformance: 85,
  totalProjects: 11,
  completedTasks: 273
};

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>(mockStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | TeamMember["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TeamMember["status"]>("all");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Load team data from localStorage or use mock data
  useEffect(() => {
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      const parsedMembers = JSON.parse(savedMembers).map((member: TeamMember & { joinedAt: string; lastActive: string }) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
        lastActive: new Date(member.lastActive)
      }));
      setMembers(parsedMembers);
    } else {
      setMembers(mockTeamMembers);
    }
  }, []);

  // Filter members
  useEffect(() => {
    let filtered = members;

    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchQuery, roleFilter, statusFilter]);

  const getRoleIcon = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin": return <Shield className="w-4 h-4 text-blue-500" />;
      case "member": return <Users className="w-4 h-4 text-green-500" />;
      case "viewer": return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner": return "bg-yellow-100 text-yellow-800";
      case "admin": return "bg-blue-100 text-blue-800";
      case "member": return "bg-green-100 text-green-800";
      case "viewer": return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "invited": return "bg-blue-100 text-blue-800";
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const handleInviteMember = () => {
    setIsAddingMember(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = members.filter(member => member.id !== memberId);
    setMembers(updatedMembers);
    localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Team Management</h2>
          <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
        </div>
        <Button onClick={handleInviteMember}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {Math.round((stats.activeMembers / stats.totalMembers) * 100)}% active
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{stats.pendingInvites}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">{stats.averagePerformance}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% this month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="invited">Invited</option>
          </select>
        </div>
      </div>

      {/* Team Members List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map(member => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Role and Status */}
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getRoleColor(member.role))}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{member.role}</span>
                  </Badge>
                  <Badge className={cn("text-xs", getStatusColor(member.status))}>
                    {member.status}
                  </Badge>
                </div>

                {/* Department and Contact */}
                {member.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    {member.department}
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {member.phone}
                  </div>
                )}

                {/* Performance */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Performance</span>
                    <span className={cn("text-sm font-medium", getPerformanceColor(member.performance))}>
                      {member.performance}%
                    </span>
                  </div>
                  <Progress value={member.performance} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-secondary/50 rounded-md">
                    <div className="font-medium">{member.projects}</div>
                    <div className="text-muted-foreground">Projects</div>
                  </div>
                  <div className="text-center p-2 bg-secondary/50 rounded-md">
                    <div className="font-medium">{member.tasksCompleted}</div>
                    <div className="text-muted-foreground">Tasks Done</div>
                  </div>
                </div>

                {/* Last Active */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Last active: {formatLastActive(member.lastActive)}</span>
                </div>

                {/* Joined Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Joined: {formatDate(member.joinedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Start building your team by inviting members."
            }
          </p>
          {!searchQuery && roleFilter === "all" && statusFilter === "all" && (
            <Button onClick={handleInviteMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite First Member
            </Button>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && (
        <Card className="fixed inset-4 z-50 max-w-md mx-auto max-h-[90vh] overflow-auto border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Full Name" />
            <Input placeholder="Email Address" type="email" />
            <Input placeholder="Phone (Optional)" />
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <Input placeholder="Department (Optional)" />
            <div className="flex gap-2">
              <Button className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <Card className="fixed inset-4 z-50 max-w-md mx-auto max-h-[90vh] overflow-auto border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input defaultValue={editingMember.name} />
            <Input defaultValue={editingMember.email} type="email" />
            <Input defaultValue={editingMember.phone || ""} />
            <select defaultValue={editingMember.role} className="w-full px-3 py-2 border rounded-md">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
              {editingMember.role === "owner" && <option value="owner">Owner</option>}
            </select>
            <Input defaultValue={editingMember.department || ""} />
            <div className="flex gap-2">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
