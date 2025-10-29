import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FirebaseCalendarEventsService, type CalendarEvent } from '@/lib/firebase-calendar';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  MapPin,
  Bell,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Using CalendarEvent from workspace-persistence.ts

interface WorkspaceCalendarProps {
  tasks?: Array<{
    id: string;
    title: string;
    dueDate?: Date;
    status: string;
    priority: string;
  }>;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function WorkspaceCalendar({ tasks = [], onEventClick }: WorkspaceCalendarProps) {
  const { user } = useFirebaseAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    duration: 60,
    type: 'task' as 'task' | 'meeting' | 'deadline' | 'reminder',
    priority: 'medium' as 'low' | 'medium' | 'high',
    attendees: '',
    location: ''
  });

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('📅 Loading calendar events from Firebase...');
        
        const userId = user.uid;
        const teamId = 'default-team'; // Use default team for now
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const calendarEvents = await FirebaseCalendarEventsService.getEvents(userId, teamId, startDate, endDate);
        setEvents(calendarEvents);
        console.log('✅ Calendar events loaded from Firebase:', calendarEvents.length);
        
      } catch (error) {
        console.error('Error loading calendar events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [user, currentDate]);

  // Generate calendar events from tasks and bookings
  useEffect(() => {
    const loadCalendarEvents = async () => {
      if (!user) return;
      
      try {
        const teamId = user.id;
        const taskEvents: CalendarEvent[] = tasks
          .filter(task => task.dueDate)
          .map(task => ({
            id: `task-${task.id}`,
            title: task.title,
            description: `Task: ${task.title}`,
            eventDate: new Date(task.dueDate!),
            eventType: 'task' as const,
            priority: task.priority as 'low' | 'medium' | 'high',
            attendees: [],
            teamId: teamId,
            createdBy: user.id,
            visibility: 'team' as const,
            isRecurring: false,
            reminderMinutes: [],
            status: 'scheduled' as const,
            durationMinutes: 60,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

        // Load bookings and convert to calendar events
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingEvents: CalendarEvent[] = bookings
          .filter((booking: any) => booking.status !== 'cancelled')
          .map((booking: any) => ({
            id: `booking-${booking.id}`,
            title: `Meeting with ${booking.customerName}`,
            description: `${booking.meetingType} meeting - ${booking.customerEmail}`,
            eventDate: new Date(booking.startTime),
            eventTime: new Date(booking.startTime).toTimeString().slice(0, 5),
            durationMinutes: booking.duration,
            eventType: 'meeting' as const,
            priority: 'medium' as const,
            attendees: [booking.customerEmail],
            location: booking.location,
            projectId: booking.templateId,
            teamId: teamId,
            createdBy: user.id,
            visibility: 'team' as const,
            isRecurring: false,
            reminderMinutes: [],
            status: 'scheduled' as const,
            createdAt: new Date(booking.createdAt),
            updatedAt: new Date(booking.updatedAt)
          }));

        // Combine with existing events, avoiding duplicates
        setEvents(prev => {
          // Remove old task and booking events
          const nonTaskBookingEvents = prev.filter(e => 
            !e.id.startsWith('task-') && !e.id.startsWith('booking-')
          );
          
          // Add new task events
          const existingTaskIds = prev.filter(e => e.eventType === 'task').map(e => e.taskId);
          const newTaskEvents = taskEvents.filter(te => !existingTaskIds.includes(te.taskId));
          
          // Add new booking events
          const existingBookingIds = prev.filter(e => e.id.startsWith('booking-')).map(e => e.id);
          const newBookingEvents = bookingEvents.filter(be => !existingBookingIds.includes(be.id));
          
          return [...nonTaskBookingEvents, ...newTaskEvents, ...newBookingEvents];
        });
      } catch (error) {
        console.error('Error loading calendar events from tasks/bookings:', error);
      }
    };

    loadCalendarEvents();

    // Listen for booking updates
    const handleBookingUpdate = () => {
      loadCalendarEvents();
    };

    window.addEventListener('bookingsUpdated', handleBookingUpdate);

    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingUpdate);
    };
  }, [tasks, user]);

  // Events are now managed by the database service

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Ensure eventDate is a Date object
      const eventDate = event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'task':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'meeting':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getEventPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'medium':
        return <Circle className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return <Circle className="w-3 h-3 text-gray-500" />;
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !user) {
      alert('Please enter an event title');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Creating calendar event in Firebase...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      // Create the event date by combining date and time
      const eventDateTime = new Date(newEvent.date);
      if (newEvent.time) {
        const [hours, minutes] = newEvent.time.split(':').map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);
      }
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || '',
        eventDate: eventDateTime,
        startTime: newEvent.time || '',
        endTime: newEvent.time ? 
          new Date(eventDateTime.getTime() + (newEvent.duration * 60000)).toTimeString().slice(0, 5) : '',
        location: newEvent.location || '',
        attendees: newEvent.attendees ? newEvent.attendees.split(',').map(email => email.trim()) : [],
        reminder: false,
        color: '#3b82f6', // Default blue color
        status: 'scheduled' as const,
        priority: newEvent.priority || 'medium' as const,
        category: newEvent.type || 'general'
      };

      console.log('🔄 Event data to save:', eventData);
      const createdEvent = await FirebaseCalendarEventsService.createEvent(userId, teamId, eventData);
      console.log('✅ Calendar event created successfully:', createdEvent.id);
      
      setEvents(prev => [...prev, createdEvent]);
      setIsAddEventOpen(false);
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        time: '',
        duration: 60,
        type: 'task',
        priority: 'medium',
        attendees: '',
        location: ''
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setIsLoading(true);
        console.log('🔄 Deleting calendar event from Firebase...');
        
        const userId = user.uid;
        const teamId = 'default-team';
        
        await FirebaseCalendarEventsService.deleteEvent(userId, teamId, eventId);
        console.log('✅ Calendar event deleted successfully');
        
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setIsViewEventOpen(false);
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        alert('Failed to delete event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({ ...prev, date }));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
    onEventClick?.(event);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Workspace Calendar
            </CardTitle>
            <Button 
              onClick={() => setIsAddEventOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="border-border text-foreground hover:bg-background/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="border-border text-foreground hover:bg-background/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-24"></div>;
              }

              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  className={cn(
                    "h-24 p-1 border border-border/50 rounded cursor-pointer hover:bg-background/50 transition-colors",
                    isToday && "bg-blue-500/10 border-blue-500/50",
                    isSelected && "bg-blue-500/20 border-blue-500"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium text-foreground mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer truncate",
                          getEventTypeColor(event.eventType)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {getEventPriorityIcon(event.priority || 'medium')}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="bg-chatgpt-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 bg-background/50 rounded-lg border border-border cursor-pointer hover:bg-background/70 transition-colors"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getEventPriorityIcon(event.priority || 'medium')}
                          <h3 className="font-medium text-foreground">{event.title}</h3>
                          <Badge className={cn("text-xs", getEventTypeColor(event.eventType))}>
                            {event.eventType}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {event.eventTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(event.eventTime)}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.length} attendees
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddEventOpen(true)}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-2xl bg-chatgpt-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Event</DialogTitle>
            <DialogDescription>
              Create a new calendar event to track your schedule and important dates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="event-title" className="text-foreground">Title *</Label>
                <Input
                  id="event-title"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="event-date" className="text-foreground">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date.toISOString().split('T')[0]}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="event-time" className="text-foreground">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="event-type" className="text-foreground">Type</Label>
                <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="event-priority" className="text-foreground">Priority</Label>
                <Select value={newEvent.priority} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-background border-border text-foreground">
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
                <Label htmlFor="event-duration" className="text-foreground">Duration (minutes)</Label>
                <Input
                  id="event-duration"
                  type="number"
                  placeholder="60"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="event-location" className="text-foreground">Location</Label>
                <Input
                  id="event-location"
                  placeholder="Enter location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="event-attendees" className="text-foreground">Attendees (comma-separated emails)</Label>
                <Input
                  id="event-attendees"
                  placeholder="user@example.com, user2@example.com"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="event-description" className="text-foreground">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Enter event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddEventOpen(false)}
                className="border-border text-foreground hover:bg-background/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddEvent}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Add Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="max-w-2xl bg-chatgpt-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Event Details</DialogTitle>
            <DialogDescription>
              View and manage your calendar event details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventPriorityIcon(selectedEvent.priority || 'medium')}
                    <h3 className="text-xl font-semibold text-foreground">{selectedEvent.title}</h3>
                    <Badge className={cn("text-xs", getEventTypeColor(selectedEvent.eventType))}>
                      {selectedEvent.eventType}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-foreground">{selectedEvent.eventDate.toLocaleDateString()}</p>
                  </div>
                  
                  {selectedEvent.eventTime && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{formatTime(selectedEvent.eventTime)}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="flex items-center gap-2">
                      {getEventPriorityIcon(selectedEvent.priority || 'medium')}
                      <p className="text-foreground capitalize">{selectedEvent.priority}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.durationMinutes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <p className="text-foreground">{selectedEvent.durationMinutes} minutes</p>
                    </div>
                  )}
                  
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Attendees</Label>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{selectedEvent.attendees.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewEventOpen(false)}
                  className="border-border text-foreground hover:bg-background/50"
                >
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLoading ? 'Deleting...' : 'Delete Event'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
