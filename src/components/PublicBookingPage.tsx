import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BookingTemplate, Booking } from '@/types/booking';
import { ReminderSystem } from '@/lib/reminder-system';

export default function PublicBookingPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { profile } = useAuth();
  const [template, setTemplate] = useState<BookingTemplate | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'select-date-time' | 'confirm-selection' | 'customer-info' | 'confirmation'>('select-date-time');

  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    console.log('=== Template Loading DEBUG ===');
    console.log('Template ID:', templateId);
    
    // Search for template across all users' localStorage keys
    let foundTemplate: BookingTemplate | null = null;
    
    // First try the current user's templates
    const userId = profile?.id || 'anonymous';
    const userTemplates = JSON.parse(localStorage.getItem(`bookingTemplates_${userId}`) || '[]');
    console.log('User templates:', userTemplates);
    foundTemplate = userTemplates.find((t: BookingTemplate) => t.id === templateId);
    
    // If not found in current user's templates, search all localStorage keys
    if (!foundTemplate) {
      console.log('Template not found in user templates, searching all keys...');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bookingTemplates_')) {
          const templates = JSON.parse(localStorage.getItem(key) || '[]');
          foundTemplate = templates.find((t: BookingTemplate) => t.id === templateId);
          if (foundTemplate) {
            console.log(`Found template in key: ${key}`);
            break;
          }
        }
      }
    }
    
    console.log('Found template:', foundTemplate);
    
    if (foundTemplate) {
      const loadedTemplate = {
        ...foundTemplate,
        createdAt: new Date(foundTemplate.createdAt),
        updatedAt: new Date(foundTemplate.updatedAt)
      };
      console.log('Setting template:', loadedTemplate);
      setTemplate(loadedTemplate);
    } else {
      // If no template found, create a default one for testing
      console.log('No template found, creating default');
      const defaultTemplate: BookingTemplate = {
        id: templateId || 'default_template',
        userId: 'current-user',
        name: 'Consultation Call',
        description: 'A consultation to discuss your needs and how we can help.',
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
      console.log('Created default template:', defaultTemplate);
      setTemplate(defaultTemplate);
    }

    // Search for bookings across all users' localStorage keys
    let bookings = JSON.parse(localStorage.getItem(`bookings_${userId}`) || '[]');
    
    // If not found in current user's bookings, search all localStorage keys
    if (bookings.length === 0) {
      console.log('No bookings found in user bookings, searching all keys...');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bookings_')) {
          const userBookings = JSON.parse(localStorage.getItem(key) || '[]');
          bookings = [...bookings, ...userBookings];
        }
      }
    }
    setExistingBookings(bookings.map((b: any) => ({
      ...b,
      startTime: new Date(b.startTime),
      endTime: new Date(b.endTime),
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
      cancelledAt: b.cancelledAt ? new Date(b.cancelledAt) : undefined
    })));

    // Search for settings across all users' localStorage keys
    let savedSettings = localStorage.getItem(`bookingSettings_${userId}`);
    console.log('User settings:', savedSettings);
    
    // If not found in current user's settings, search all localStorage keys
    if (!savedSettings) {
      console.log('Settings not found in user settings, searching all keys...');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bookingSettings_')) {
          savedSettings = localStorage.getItem(key);
          if (savedSettings) {
            console.log(`Found settings in key: ${key}`);
            break;
          }
        }
      }
    }
    
    console.log('Final settings:', savedSettings);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      console.log('Parsed settings:', parsedSettings);
      setSettings(parsedSettings);
    } else {
      // Create default settings if none exist
      console.log('No settings found, creating default');
      const defaultSettings = {
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
      console.log('Created default settings:', defaultSettings);
      setSettings(defaultSettings);
      localStorage.setItem(`bookingSettings_${userId}`, JSON.stringify(defaultSettings));
    }
  }, [templateId, profile?.id]);

  const generateTimeSlots = useCallback((date: Date) => {
    console.log('=== generateTimeSlots DEBUG ===');
    console.log('Template:', template);
    console.log('Settings:', settings);
    console.log('Date:', date);

    // If no template, create a simple fallback
    const currentTemplate = template || {
      duration: 60,
      bufferTime: 15
    };

    const slots: string[] = [];

    // Get working hours for the selected day
    let workingHours;
    if (settings && settings.workingHours) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof settings.workingHours;
      console.log('Day name:', dayName);
      workingHours = settings.workingHours[dayName];
      console.log('Working hours for this day:', workingHours);
    }

    // Use default working hours if settings not available or day not enabled
    if (!workingHours || !workingHours.enabled) {
      workingHours = { start: '09:00', end: '17:00', enabled: true };
      console.log('Using default working hours:', workingHours);
    }

    // Ensure working hours are valid
    if (!workingHours.start || !workingHours.end) {
      workingHours = { start: '09:00', end: '17:00', enabled: true };
      console.log('Invalid working hours, using defaults:', workingHours);
    }

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    console.log('Start time (minutes):', startTime, 'End time (minutes):', endTime);
    console.log('Template duration:', currentTemplate.duration, 'Buffer time:', currentTemplate.bufferTime);
    
    // Generate time slots with 30-minute intervals for better user experience
    const slotInterval = 30; // 30 minutes between slots
    const slotDuration = currentTemplate.duration || 60;
    
    for (let time = startTime; time < endTime - slotDuration; time += slotInterval) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      
      // Convert to 12-hour format with AM/PM
      let displayHour = hour;
      let ampm = 'AM';
      
      if (hour === 0) {
        displayHour = 12;
      } else if (hour === 12) {
        ampm = 'PM';
      } else if (hour > 12) {
        displayHour = hour - 12;
        ampm = 'PM';
      }
      
      const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      // Check if this slot conflicts with existing bookings
      const slotDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
      const slotEndDateTime = new Date(slotDateTime.getTime() + slotDuration * 60000);
      
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        return (slotDateTime < bookingEnd && slotEndDateTime > bookingStart) &&
               booking.status !== 'cancelled';
      });
      
      // Don't show slots in the past (but allow slots for today if they're in the future)
      const now = new Date();
      
      // Only check if in past if it's today, otherwise allow all future dates
      const isInPast = slotDateTime.toDateString() === now.toDateString() && slotDateTime < now;
      
      console.log(`Time slot ${timeString}:`, {
        slotDateTime,
        slotEndDateTime,
        hasConflict,
        isInPast,
        willInclude: !hasConflict && !isInPast
      });
      
      if (!hasConflict && !isInPast) {
        slots.push(timeString);
      }
    }
    
    console.log('Final generated slots:', slots);
    
    // If no slots were generated, create some default ones for testing
    if (slots.length === 0) {
      console.log('No slots generated, creating default slots for testing');
      const defaultSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
      console.log('Default slots:', defaultSlots);
      return defaultSlots;
    }
    
    return slots;
  }, [template, settings, existingBookings]);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      // Search for settings across all users' localStorage keys (same logic as initial load)
      let savedSettings = localStorage.getItem(`bookingSettings_${profile?.id || 'anonymous'}`);
      console.log('Current user settings:', savedSettings);
      
      // If not found in current user's settings, search all localStorage keys
      if (!savedSettings) {
        console.log('Settings not found in current user, searching all keys...');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('bookingSettings_')) {
            savedSettings = localStorage.getItem(key);
            if (savedSettings) {
              console.log(`Found updated settings in key: ${key}`);
              break;
            }
          }
        }
      }
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Settings updated:', parsedSettings);
        setSettings(parsedSettings);
        
        // Regenerate time slots if a date is already selected
        if (selectedDate) {
          const slots = generateTimeSlots(selectedDate);
          setAvailableSlots(slots);
          console.log('Regenerated time slots after settings change:', slots);
        }
      }
    };

    // Listen for storage changes (when settings are updated in BookingManager)
    const handleStorageChange = (e: StorageEvent) => {
      // Listen for ANY booking settings changes, not just current user
      if (e.key && e.key.startsWith('bookingSettings_')) {
        console.log('Booking settings changed:', e.key);
        handleSettingsChange();
      }
    };

    // Also listen for custom events (for same-tab updates)
    const handleCustomSettingsUpdate = () => {
      console.log('Custom settings update event received');
      handleSettingsChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingSettingsUpdated', handleCustomSettingsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingSettingsUpdated', handleCustomSettingsUpdate);
    };
  }, [selectedDate, generateTimeSlots, profile?.id]);

  const handleDateSelect = (date: Date | undefined) => {
    console.log('=== handleDateSelect DEBUG ===');
    console.log('Date received:', date);
    console.log('Template available:', !!template);
    console.log('Settings available:', !!settings);

    // Always set the selected date first
    setSelectedDate(date);
    
    if (date) {
      console.log('Date is valid, generating time slots...');
      
      // Always show some time slots immediately for testing
      const fallbackSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
      setAvailableSlots(fallbackSlots);
      console.log('Set fallback slots:', fallbackSlots);
      
      // Try to generate proper slots based on template/settings
      if (template && settings) {
        console.log('Template and settings available, generating proper slots...');
        const slots = generateTimeSlots(date);
        console.log('Generated slots:', slots);
        if (slots.length > 0) {
          setAvailableSlots(slots);
        }
      } else {
        console.log('Template or settings not available, using fallback slots');
      }
    } else {
      console.log('Date is undefined, clearing slots');
      setAvailableSlots([]);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep('confirm-selection');
  };

  const generateBookingCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const [bookingCode, setBookingCode] = useState<string>('');

  const handleBookingSubmit = async () => {
    if (!template || !selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    
    try {
      // Create booking with proper end time calculation
      // Parse 12-hour time format (e.g., "9:00 AM", "2:00 PM")
      const timeMatch = selectedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) throw new Error('Invalid time format');
      
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime.getTime() + template.duration * 60000);
      const generatedCode = generateBookingCode();
      setBookingCode(generatedCode);
      
      const booking: Booking = {
        id: `booking_${Date.now()}`,
        bookingCode: generatedCode,
        templateId: template.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: template.duration,
        status: settings?.autoConfirmBookings ? 'confirmed' : 'pending',
        location: template.location,
        meetingType: template.meetingType,
        videoLink: template.videoLink,
        phoneNumber: template.phoneNumber,
        notes: customerInfo.notes,
        price: template.price,
        currency: template.currency,
        remindersSent: {
          email24h: false,
          email1h: false,
          sms24h: false,
          sms1h: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save booking with user-specific key
      const userId = profile?.id || 'anonymous';
      const existingBookings = JSON.parse(localStorage.getItem(`bookings_${userId}`) || '[]');
      localStorage.setItem(`bookings_${userId}`, JSON.stringify([...existingBookings, booking]));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bookingsUpdated'));
      
      // Send confirmation email and schedule reminders
      const reminderSystem = ReminderSystem.getInstance();
      const emailSent = await reminderSystem.sendBookingConfirmation(booking, template);
      reminderSystem.scheduleReminders(booking, settings);
      
      if (emailSent) {
        toast({
          title: "Booking Confirmed",
          description: "We've sent you a confirmation email with all the details.",
        });
      } else {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully.",
          variant: "destructive"
        });
      }
      
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-chatgpt-card border-border shadow-sm max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Template Not Found</h2>
            <p className="text-muted-foreground">The booking template you're looking for doesn't exist or has been deactivated.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!template.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-chatgpt-card border-border shadow-sm max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Booking Unavailable</h2>
            <p className="text-muted-foreground">This booking template is currently not accepting new appointments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Card className="bg-chatgpt-card border-border shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-foreground text-center">{template.name}</CardTitle>
              <p className="text-muted-foreground text-center">{template.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{template.duration} minutes</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {template.meetingType === 'video-call' && <Video className="w-4 h-4 text-muted-foreground" />}
                  {template.meetingType === 'phone-call' && <Phone className="w-4 h-4 text-muted-foreground" />}
                  {template.meetingType === 'in-person' && <MapPin className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-foreground capitalize">{template.meetingType.replace('-', ' ')}</span>
                </div>
                {template.price && template.price > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-semibold">
                      ${template.price} {template.currency}
                    </span>
                  </div>
                )}
              </div>
              
              {template.location && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{template.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Steps */}
          {bookingStep === 'select-date-time' && (
            <Card className="bg-chatgpt-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select Date & Time
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Choose a date and time for your {template.name.toLowerCase()}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Select Date</h3>
                  <div className="border rounded-md p-4 bg-background">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        .rdp-day_selected {
                          background-color: #3b82f6 !important;
                          color: white !important;
                          border-radius: 4px !important;
                        }
                        .rdp-day_selected:hover {
                          background-color: #2563eb !important;
                        }
                        .rdp-day_selected:focus {
                          background-color: #2563eb !important;
                        }
                        .rdp-day_selected:before {
                          display: none !important;
                        }
                        .rdp-day_selected:after {
                          display: none !important;
                        }
                        .rdp-day_selected * {
                          background-color: transparent !important;
                        }
                        /* Remove any green backgrounds from all possible selectors */
                        .rdp-day[data-selected="true"] {
                          background-color: #3b82f6 !important;
                        }
                        .rdp-day_selected,
                        .rdp-day_selected:hover,
                        .rdp-day_selected:focus,
                        .rdp-day_selected:active {
                          background-color: #3b82f6 !important;
                          background-image: none !important;
                          background: #3b82f6 !important;
                        }
                        /* Target any green background specifically */
                        .rdp-day_selected[style*="background-color: rgb(34, 197, 94)"],
                        .rdp-day_selected[style*="background-color: #22c55e"],
                        .rdp-day_selected[style*="background-color: green"] {
                          background-color: #3b82f6 !important;
                        }
                      `
                    }} />
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="rounded-md mx-auto"
                    />
                  </div>
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Selected: {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  
                  {/* Quick date selection buttons */}
                  <div className="flex gap-2 justify-center mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        handleDateSelect(tomorrow);
                      }}
                      className="text-xs"
                    >
                      Tomorrow
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const dayAfter = new Date();
                        dayAfter.setDate(dayAfter.getDate() + 2);
                        handleDateSelect(dayAfter);
                      }}
                      className="text-xs"
                    >
                      Day After
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        handleDateSelect(nextWeek);
                      }}
                      className="text-xs"
                    >
                      Next Week
                    </Button>
                  </div>
                </div>


                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">
                      Select Time for {selectedDate.toLocaleDateString()}
                    </h3>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            onClick={() => handleTimeSelect(slot)}
                            className={`transition-all duration-200 hover:scale-105 ${
                              selectedTime === slot 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "border-border text-foreground hover:bg-background/50 hover:border-blue-300"
                            }`}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No available time slots for this date.</p>
                        <p className="text-sm text-muted-foreground mt-2">Please try a different date.</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Please select a date first to see available times.</p>
                      </div>
                    )}
                  </div>
                )}



              </CardContent>
            </Card>
          )}

          {bookingStep === 'confirm-selection' && (
            <Card className="bg-chatgpt-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Confirm Your Selection
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Please review your selected date and time before proceeding
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-background/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">Selected Date</p>
                      <p className="text-muted-foreground">
                        {selectedDate?.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">Selected Time</p>
                      <p className="text-muted-foreground">{selectedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">Duration</p>
                      <p className="text-muted-foreground">{template?.duration || 60} minutes</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setBookingStep('select-date-time')}
                    className="px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Selection
                  </Button>
                  <Button 
                    onClick={() => setBookingStep('customer-info')}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    Continue to Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {bookingStep === 'customer-info' && (
            <Card className="bg-chatgpt-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Your Information</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Please provide your contact details to confirm your booking
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                      className="bg-background border-border text-foreground"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                      className="bg-background border-border text-foreground"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                      className="bg-background border-border text-foreground"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-foreground">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, notes: e.target.value}))}
                    className="bg-background border-border text-foreground"
                    rows={3}
                    placeholder="Any special requests or information you'd like to share..."
                  />
                </div>

                {template.instructions && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Important Instructions:</h4>
                    <p className="text-sm text-blue-800">{template.instructions}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingStep('select-date-time')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Date & Time
                  </Button>
                  <Button 
                    onClick={handleBookingSubmit}
                    disabled={!customerInfo.name || !customerInfo.email || isBooking}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    {isBooking ? 'Creating Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {bookingStep === 'confirmation' && (
            <Card className="bg-chatgpt-card border-border shadow-sm">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent you a confirmation email with all the details.
                </p>
                
                <div className="bg-background/50 rounded-lg p-6 space-y-3 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Date:</span>
                      <p className="text-foreground font-medium">{selectedDate?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Time:</span>
                      <p className="text-foreground font-medium">{selectedTime}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                      <p className="text-foreground font-medium">{template.duration} minutes</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <p className="text-foreground font-medium capitalize">
                        {template.meetingType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  {template.location && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Location:</span>
                      <p className="text-foreground font-medium">{template.location}</p>
                    </div>
                  )}
                  
                  {template.videoLink && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Video Link:</span>
                      <p className="text-foreground font-medium">{template.videoLink}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Booking Code:</strong> {bookingCode}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Keep this code for your records. You can use it to reference your booking.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
