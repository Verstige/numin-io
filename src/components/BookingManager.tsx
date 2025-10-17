import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Link, 
  Copy, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Smartphone,
  MapPin,
  Video,
  Phone,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BookingTemplate, Booking, BookingSettings } from '@/types/booking';

export default function BookingManager() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<BookingTemplate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'bookings' | 'settings'>('templates');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BookingTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<BookingTemplate>>({
    name: '',
    description: '',
    duration: 60,
    bufferTime: 15,
    meetingType: 'video-call',
    isActive: true,
    currency: 'USD'
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const userId = profile?.id || 'anonymous';
      const savedTemplates = localStorage.getItem(`bookingTemplates_${userId}`);
      const savedBookings = localStorage.getItem(`bookings_${userId}`);
      const savedSettings = localStorage.getItem(`bookingSettings_${userId}`);
      
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        })));
      }
      
      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        setBookings(parsed.map((b: any) => ({
          ...b,
          startTime: new Date(b.startTime),
          endTime: new Date(b.endTime),
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
          cancelledAt: b.cancelledAt ? new Date(b.cancelledAt) : undefined
        })));
      }
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Create default settings
        const defaultSettings: BookingSettings = {
          userId: 'current-user',
          timezone: 'America/New_York',
          workingHours: {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '10:00', end: '16:00', enabled: false },
            sunday: { start: '10:00', end: '16:00', enabled: false }
          },
          advanceBookingDays: 30,
          minNoticeHours: 2,
          maxBookingsPerDay: 8,
          allowWeekendBookings: false,
          allowHolidayBookings: false,
          autoConfirmBookings: true,
          requirePayment: false,
          emailReminders: true,
          smsReminders: false,
          reminderTimings: {
            email24h: true,
            email1h: true,
            sms24h: false,
            sms1h: false
          },
          cancellationPolicy: {
            allowCancellation: true,
            minHoursNotice: 24,
            refundPercentage: 100
          }
        };
        setSettings(defaultSettings);
      }
    };

    loadData();

    // Initialize with a sample template if none exist
    const userId = profile?.id || 'anonymous';
    const savedTemplates = localStorage.getItem(`bookingTemplates_${userId}`);
    if (!savedTemplates || JSON.parse(savedTemplates).length === 0) {
      const sampleTemplate: BookingTemplate = {
        id: 'sample_template_1',
        userId: 'current-user',
        name: 'Consultation Call',
        description: 'A 60-minute consultation to discuss your needs and how we can help.',
        duration: 60,
        bufferTime: 15,
        meetingType: 'video-call',
        videoLink: 'https://zoom.us/j/123456789',
        instructions: 'Please have your questions ready and ensure you have a stable internet connection.',
        price: 150,
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTemplates([sampleTemplate]);
      localStorage.setItem(`bookingTemplates_${userId}`, JSON.stringify([sampleTemplate]));
    }

    // Listen for storage changes (when bookings are added from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      const userId = profile?.id || 'anonymous';
      if (e.key === `bookings_${userId}`) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (same tab)
    const handleCustomStorageChange = () => {
      loadData();
    };

    window.addEventListener('bookingsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleCustomStorageChange);
    };
  }, [profile?.id]);

  // Save data to localStorage
  useEffect(() => {
    const userId = profile?.id || 'anonymous';
    localStorage.setItem(`bookingTemplates_${userId}`, JSON.stringify(templates));
  }, [templates, profile?.id]);

  useEffect(() => {
    const userId = profile?.id || 'anonymous';
    localStorage.setItem(`bookings_${userId}`, JSON.stringify(bookings));
  }, [bookings, profile?.id]);

  useEffect(() => {
    if (settings) {
      const userId = profile?.id || 'anonymous';
      localStorage.setItem(`bookingSettings_${userId}`, JSON.stringify(settings));
      
      // Dispatch custom event to notify other components (same tab)
      window.dispatchEvent(new CustomEvent('bookingSettingsUpdated'));
      console.log('Settings saved and custom event dispatched');
    }
  }, [settings, profile?.id]);

  const generateBookingLink = (templateId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/book/${templateId}`;
  };

  const copyBookingLink = (templateId: string) => {
    const link = generateBookingLink(templateId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const template: BookingTemplate = {
      id: `template_${Date.now()}`,
      userId: 'current-user',
      name: newTemplate.name,
      description: newTemplate.description,
      duration: newTemplate.duration,
      bufferTime: newTemplate.bufferTime || 15,
      location: newTemplate.location,
      meetingType: newTemplate.meetingType || 'video-call',
      videoLink: newTemplate.videoLink,
      phoneNumber: newTemplate.phoneNumber,
      instructions: newTemplate.instructions,
      price: newTemplate.price,
      currency: newTemplate.currency || 'USD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      duration: 60,
      bufferTime: 15,
      meetingType: 'video-call',
      isActive: true,
      currency: 'USD'
    });
    setIsCreateTemplateOpen(false);
    
    toast({
      title: "Template Created",
      description: `${template.name} has been created successfully`,
    });
  };

  const deleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully",
      });
    }
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, isActive: !t.isActive, updatedAt: new Date() }
        : t
    ));
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video-call': return <Video className="w-4 h-4" />;
      case 'phone-call': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Management
            </CardTitle>
            <Button 
              onClick={() => setIsCreateTemplateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="templates" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Bookings ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-chatgpt-card border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{template.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {getMeetingTypeIcon(template.meetingType)}
                      <span className="text-foreground capitalize">{template.meetingType.replace('-', ' ')}</span>
                    </div>
                    {template.price && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">
                          ${template.price} {template.currency}
                        </span>
                      </div>
                    )}
                    {template.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{template.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Booking Link:</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={generateBookingLink(template.id)}
                        readOnly
                        className="bg-background border-border text-foreground text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyBookingLink(template.id)}
                        className="border-border text-foreground hover:bg-background/50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(generateBookingLink(template.id), '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setNewTemplate(template);
                        setIsCreateTemplateOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <Card className="bg-chatgpt-card border-border shadow-sm md:col-span-2 lg:col-span-3">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Templates Created</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first booking template to start accepting appointments.
                  </p>
                  <Button 
                    onClick={() => setIsCreateTemplateOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-chatgpt-card border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{booking.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                        {booking.customerPhone && (
                          <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getBookingStatusColor(booking.status)} border`}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{booking.bookingCode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Date & Time:</span>
                      <p className="font-medium text-foreground">
                        {new Date(booking.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium text-foreground">{booking.duration} minutes</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="flex items-center gap-1">
                        {getMeetingTypeIcon(booking.meetingType)}
                        <span className="font-medium text-foreground capitalize">
                          {booking.meetingType.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.location && (
                    <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Location:</span>
                        <span className="text-sm text-muted-foreground">{booking.location}</span>
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border">
                      <span className="text-sm font-medium text-foreground">Additional Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                    </div>
                  )}
                  
                  {booking.specialRequests && (
                    <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border">
                      <span className="text-sm font-medium text-foreground">Special Requests:</span>
                      <p className="text-sm text-muted-foreground mt-1">{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Dispatch custom event to trigger email composition
                        window.dispatchEvent(new CustomEvent('composeEmail', {
                          detail: {
                            to: booking.customerEmail,
                            subject: `Re: Your booking ${booking.bookingCode} - ${booking.customerName}`,
                            content: `Hi ${booking.customerName},\n\nThank you for your booking (${booking.bookingCode}) scheduled for ${new Date(booking.startTime).toLocaleDateString()} at ${new Date(booking.startTime).toLocaleTimeString()}.\n\n${booking.notes ? `I saw your note: "${booking.notes}"\n\n` : ''}Please let me know if you have any questions or need to make any changes.\n\nBest regards`
                          }
                        }));
                        
                        // Switch to email tab
                        window.dispatchEvent(new CustomEvent('navigateToTab', {
                          detail: 'email'
                        }));
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Get the booking template ID to create the scheduling link
                        const bookingTemplateId = booking.templateId;
                        const schedulingLink = `${window.location.origin}/book/${bookingTemplateId}`;
                        
                        // Dispatch custom event to trigger email composition with reschedule content
                        window.dispatchEvent(new CustomEvent('composeEmail', {
                          detail: {
                            to: booking.customerEmail,
                            subject: `Reschedule Request - Your booking ${booking.bookingCode}`,
                            content: `Hi ${booking.customerName},\n\nI hope this email finds you well. I'm reaching out regarding your booking (${booking.bookingCode}) that's currently scheduled for ${new Date(booking.startTime).toLocaleDateString()} at ${new Date(booking.startTime).toLocaleTimeString()}.\n\nI'd like to help you reschedule this appointment to a time that works better for you. Please click the link below to select a new date and time that's convenient for your schedule:\n\n📅 **Reschedule Your Appointment:**\n${schedulingLink}\n\n${booking.notes ? `I see you mentioned: "${booking.notes}" - please let me know if this affects your new preferred timing.\n\n` : ''}Once you've selected a new time slot, you'll receive a confirmation email with the updated details.\n\nIf you have any questions or need assistance with rescheduling, please don't hesitate to reach out.\n\nThank you for your flexibility, and I look forward to meeting with you at your new preferred time.\n\nBest regards,\n[Your Name]`
                          }
                        }));
                        
                        // Switch to email tab
                        window.dispatchEvent(new CustomEvent('navigateToTab', {
                          detail: 'email'
                        }));
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {bookings.length === 0 && (
              <Card className="bg-chatgpt-card border-border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Bookings will appear here once customers start using your booking links.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <Card className="bg-chatgpt-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Booking Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timezone and Working Hours */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Availability</h3>
                  
                  <div>
                    <Label className="text-foreground">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => prev ? {...prev, timezone: value} : null)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Working Hours</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(settings.workingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-20 text-sm font-medium text-foreground capitalize">{day}</div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={hours.enabled}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: {...hours, enabled: e.target.checked}
                                }
                              } : null)}
                              className="rounded"
                            />
                            <Input 
                              type="time" 
                              value={hours.start}
                              disabled={!hours.enabled}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: {...hours, start: e.target.value}
                                }
                              } : null)}
                              className="w-24 bg-background border-border text-foreground"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input 
                              type="time" 
                              value={hours.end}
                              disabled={!hours.enabled}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: {...hours, end: e.target.value}
                                }
                              } : null)}
                              className="w-24 bg-background border-border text-foreground"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reminder Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Reminders</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Email Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={settings.emailReminders}
                        onChange={(e) => setSettings(prev => prev ? {...prev, emailReminders: e.target.checked} : null)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">SMS Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={settings.smsReminders}
                        onChange={(e) => setSettings(prev => prev ? {...prev, smsReminders: e.target.checked} : null)}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-foreground">Reminder Timing:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={settings.reminderTimings.email24h}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              reminderTimings: {...prev.reminderTimings, email24h: e.target.checked}
                            } : null)}
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">Email 24h before</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={settings.reminderTimings.email1h}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              reminderTimings: {...prev.reminderTimings, email1h: e.target.checked}
                            } : null)}
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">Email 1h before</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={settings.reminderTimings.sms24h}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              reminderTimings: {...prev.reminderTimings, sms24h: e.target.checked}
                            } : null)}
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">SMS 24h before</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={settings.reminderTimings.sms1h}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              reminderTimings: {...prev.reminderTimings, sms1h: e.target.checked}
                            } : null)}
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">SMS 1h before</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button 
                    onClick={() => {
                      // Settings are automatically saved via useEffect
                      toast({
                        title: "Settings Saved",
                        description: "Your booking settings have been updated successfully",
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent className="max-w-2xl bg-chatgpt-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="template-name" className="text-foreground">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Consultation Call"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="template-description" className="text-foreground">Description *</Label>
                <Textarea
                  id="template-description"
                  placeholder="Describe what this appointment is for..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="template-duration" className="text-foreground">Duration (minutes) *</Label>
                <Input
                  id="template-duration"
                  type="number"
                  placeholder="60"
                  value={newTemplate.duration}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="template-buffer" className="text-foreground">Buffer Time (minutes)</Label>
                <Input
                  id="template-buffer"
                  type="number"
                  placeholder="15"
                  value={newTemplate.bufferTime}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 15 }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="template-type" className="text-foreground">Meeting Type</Label>
                <Select value={newTemplate.meetingType} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, meetingType: value }))}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template-price" className="text-foreground">Price (optional)</Label>
                <Input
                  id="template-price"
                  type="number"
                  placeholder="0"
                  value={newTemplate.price}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              {newTemplate.meetingType === 'in-person' && (
                <div className="md:col-span-2">
                  <Label htmlFor="template-location" className="text-foreground">Location</Label>
                  <Input
                    id="template-location"
                    placeholder="e.g., 123 Main St, City, State"
                    value={newTemplate.location}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              
              {newTemplate.meetingType === 'video-call' && (
                <div className="md:col-span-2">
                  <Label htmlFor="template-video" className="text-foreground">Video Link (optional)</Label>
                  <Input
                    id="template-video"
                    placeholder="e.g., https://zoom.us/j/123456789"
                    value={newTemplate.videoLink}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, videoLink: e.target.value }))}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              
              {newTemplate.meetingType === 'phone-call' && (
                <div className="md:col-span-2">
                  <Label htmlFor="template-phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="template-phone"
                    placeholder="e.g., +1 (555) 123-4567"
                    value={newTemplate.phoneNumber}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <Label htmlFor="template-instructions" className="text-foreground">Instructions for Customer</Label>
                <Textarea
                  id="template-instructions"
                  placeholder="Any special instructions or preparation needed..."
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, instructions: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateTemplateOpen(false);
                  setSelectedTemplate(null);
                  setNewTemplate({
                    name: '',
                    description: '',
                    duration: 60,
                    bufferTime: 15,
                    meetingType: 'video-call',
                    isActive: true,
                    currency: 'USD'
                  });
                }}
                className="border-border text-foreground hover:bg-background/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={createTemplate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
