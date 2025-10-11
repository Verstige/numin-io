import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Users, Target, Clock, TrendingUp, UserPlus, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { TeamMemberList } from "./TeamMemberAvatar";
import { 
  type TeamMember, 
  type InvitationFormData,
  validateInvitationForm,
  createInvitation,
  simulateEmailInvitation,
  isEmailAlreadyInvited,
  isEmailAlreadyMember
} from "@/lib/collaboration";

interface ProjectContextPanelProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  };
  teamMembers?: TeamMember[];
  allTeamMembers?: TeamMember[];
  invitations?: any[];
  onInviteMember?: (invitation: any) => void;
}

export default function ProjectContextPanel({ 
  project, 
  teamMembers = [], 
  allTeamMembers = [], 
  invitations = [], 
  onInviteMember 
}: ProjectContextPanelProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [invitationForm, setInvitationForm] = useState<InvitationFormData>({
    name: "",
    email: "",
    role: "member",
    projectId: project.id
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(false);

  // Mock data - in real app this would come from props or API
  const mockStats = {
    tasksCompleted: 12,
    tasksTotal: 18,
    teamMembers: 3,
    daysUntilDeadline: 15,
    weeklyProgress: 75
  };

  const progressPercentage = (mockStats.tasksCompleted / mockStats.tasksTotal) * 100;

  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-secondary text-secondary-foreground", 
    high: "gradient-primary text-white"
  };

  const statusColors = {
    "Planning": "text-blue-400",
    "Active": "text-green-400",
    "Completed": "text-gray-400",
    "On Hold": "text-yellow-400"
  };

  const handleInviteToProject = () => {
    setIsInviting(true);
    setFormErrors([]);
    setInvitationSuccess(false);
    setInvitationForm({
      name: "",
      email: "",
      role: "member",
      projectId: project.id
    });
  };

  const handleFormChange = (field: keyof InvitationFormData, value: string) => {
    setInvitationForm(prev => ({ ...prev, [field]: value }));
    setFormErrors([]);
    setInvitationSuccess(false);
  };

  const handleSendProjectInvitation = async () => {
    setFormErrors([]);
    setIsSendingInvitation(true);
    
    // Validate form
    const validation = validateInvitationForm(invitationForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsSendingInvitation(false);
      return;
    }
    
    // Check if email is already a member
    if (isEmailAlreadyMember(invitationForm.email, allTeamMembers)) {
      setFormErrors(["This email is already a team member"]);
      setIsSendingInvitation(false);
      return;
    }
    
    // Check if email is already invited
    if (isEmailAlreadyInvited(invitationForm.email, invitations)) {
      setFormErrors(["This email has already been invited"]);
      setIsSendingInvitation(false);
      return;
    }
    
    try {
      // Create invitation
      const newInvitation = createInvitation(
        invitationForm,
        "current-user-id", // In real app, get from auth context
        "Current User" // In real app, get from auth context
      );
      
      // Call parent handler if provided
      if (onInviteMember) {
        onInviteMember(newInvitation);
      }
      
      // Simulate sending email
      await simulateEmailInvitation(newInvitation);
      
      // Show success
      setInvitationSuccess(true);
      setIsInviting(false);
      
    } catch (error) {
      setFormErrors(["Failed to send invitation. Please try again."]);
    } finally {
      setIsSendingInvitation(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-card-foreground">{project.name}</h3>
          <div className="flex gap-2">
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
            <Badge variant="outline" className={`border-current ${statusColors[project.status as keyof typeof statusColors] || "text-muted-foreground"}`}>
              {project.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
          </div>
          <div className="space-y-1">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm font-semibold text-card-foreground">
              {mockStats.tasksCompleted}/{mockStats.tasksTotal} tasks
            </p>
          </div>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Team</span>
          </div>
          {teamMembers && teamMembers.length > 0 ? (
            <TeamMemberList 
              members={teamMembers} 
              maxVisible={3}
              size="sm"
              showAddButton={true}
              onAddMember={handleInviteToProject}
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleInviteToProject}
                className="w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="text-xs font-medium">+</span>
              </button>
              <span className="text-xs text-muted-foreground">No members</span>
            </div>
          )}
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Deadline</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.daysUntilDeadline} days
          </p>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Velocity</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.weeklyProgress}%
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Recent Activity</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            • Task "Design mockups" completed 2 hours ago
          </div>
          <div className="text-xs text-muted-foreground">
            • New team member joined yesterday
          </div>
          <div className="text-xs text-muted-foreground">
            • Project status updated to Active
          </div>
        </div>
      </Card>

      {/* Project Invitation Modal */}
      {isInviting && (
        <Card className="fixed inset-4 z-50 max-w-md mx-auto max-h-[90vh] overflow-auto border-primary scrollbar-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite to {project.name}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInviting(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name *</label>
              <Input 
                placeholder="Enter full name"
                value={invitationForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address *</label>
              <Input 
                placeholder="Enter email address"
                type="email"
                value={invitationForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Role *</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={invitationForm.role}
                onChange={(e) => handleFormChange("role", e.target.value as "admin" | "member" | "viewer")}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={handleSendProjectInvitation}
                disabled={isSendingInvitation}
              >
                {isSendingInvitation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isSendingInvitation ? "Sending..." : "Send Invite"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsInviting(false)}
                disabled={isSendingInvitation}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {invitationSuccess && (
        <Alert className="fixed top-4 right-4 z-50 max-w-md">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Invitation sent successfully! The recipient will be added to {project.name} upon acceptance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
