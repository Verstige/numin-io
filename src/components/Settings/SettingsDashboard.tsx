import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Key, 
  Link, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Settings as SettingsIcon,
  Save,
  Edit
} from 'lucide-react';
import GmailIntegration from './GmailIntegration';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  company?: string;
  role?: string;
  phone?: string;
  timezone: string;
  language: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  permissions: string[];
}

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Business Intelligence Specialist',
    company: 'Nexus AI Corp',
    role: 'CEO',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'English'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect your Gmail account to sync emails and manage communications',
      icon: <Mail className="w-5 h-5" />,
      connected: false,
      status: 'disconnected',
      permissions: ['Read emails', 'Send emails', 'Manage labels', 'Sync contacts']
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your calendar events and schedule meetings',
      icon: <Globe className="w-5 h-5" />,
      connected: false,
      status: 'disconnected',
      permissions: ['Read calendar', 'Create events', 'Update events', 'Delete events']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Integrate with Slack for team communication',
      icon: <Link className="w-5 h-5" />,
      connected: false,
      status: 'disconnected',
      permissions: ['Read messages', 'Send messages', 'Manage channels']
    }
  ]);

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Here you would typically save to your backend
    console.log('Saving profile:', userProfile);
    setIsEditing(false);
    // Show success message
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // Here you would typically save to your backend
    console.log('Changing password...');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    // Show success message
  };

  const handleIntegrationToggle = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.connected) {
      // Disconnect integration
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, connected: false, status: 'disconnected' as const, lastSync: undefined }
          : i
      ));
    } else {
      // Connect integration (simulate OAuth flow)
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, connected: true, status: 'connected' as const, lastSync: new Date().toISOString() }
          : i
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account, preferences, and integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Link className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-chatgpt-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Profile
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className={isEditing ? "bg-blue-600 hover:bg-blue-700" : "border-border text-foreground hover:bg-background/50"}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-background/50">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Company</Label>
                  <Input
                    id="company"
                    value={userProfile.company}
                    onChange={(e) => handleProfileUpdate('company', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Input
                    id="role"
                    value={userProfile.role}
                    onChange={(e) => handleProfileUpdate('role', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userProfile.phone}
                    onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-foreground">Timezone</Label>
                  <Input
                    id="timezone"
                    value={userProfile.timezone}
                    onChange={(e) => handleProfileUpdate('timezone', e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={userProfile.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-chatgpt-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Password</h3>
                    <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="border-border text-foreground hover:bg-background/50"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handlePasswordChange}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="border-border text-foreground hover:bg-background/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-background/50"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-chatgpt-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Link className="w-5 h-5" />
                Integrations
              </CardTitle>
              <p className="text-muted-foreground">Connect your favorite tools and services to enhance your workflow</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gmail Integration */}
              <GmailIntegration onConnectionChange={(connected) => {
                // Update integration status
                setIntegrations(prev => prev.map(integration => 
                  integration.id === 'gmail' 
                    ? { ...integration, connected, status: connected ? 'connected' : 'disconnected' }
                    : integration
                ));
              }} />

              {/* Other Integrations */}
              {integrations.filter(integration => integration.id !== 'gmail').map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        <Badge className={`${getStatusColor(integration.status)} border text-xs`}>
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last sync: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.connected && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-background/50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    )}
                    <Button
                      variant={integration.connected ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleIntegrationToggle(integration.id)}
                      className={integration.connected ? "" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      {integration.connected ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-chatgpt-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <SettingsIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Preferences Coming Soon</h3>
                <p className="text-muted-foreground">Notification settings, theme preferences, and more customization options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
