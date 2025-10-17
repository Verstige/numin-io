export interface BookingSlot {
  id: string;
  userId: string; // The person who owns this availability
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  bufferTime: number; // minutes before/after
  location?: string;
  meetingType: 'in-person' | 'video-call' | 'phone-call';
  videoLink?: string;
  phoneNumber?: string;
  instructions?: string;
  price?: number;
  currency?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  bookingCode: string; // Unique booking code for customers
  templateId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  meetingType: 'in-person' | 'video-call' | 'phone-call';
  videoLink?: string;
  phoneNumber?: string;
  notes?: string;
  specialRequests?: string;
  price?: number;
  currency?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  remindersSent: {
    email24h: boolean;
    email1h: boolean;
    sms24h: boolean;
    sms1h: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface BookingSettings {
  userId: string;
  timezone: string;
  workingHours: {
    [key: string]: { start: string; end: string; enabled: boolean }; // Monday-Sunday
  };
  advanceBookingDays: number;
  minNoticeHours: number;
  maxBookingsPerDay: number;
  allowWeekendBookings: boolean;
  allowHolidayBookings: boolean;
  autoConfirmBookings: boolean;
  requirePayment: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  reminderTimings: {
    email24h: boolean;
    email1h: boolean;
    sms24h: boolean;
    sms1h: boolean;
  };
  cancellationPolicy: {
    allowCancellation: boolean;
    minHoursNotice: number;
    refundPercentage: number;
  };
}

export interface ReminderJob {
  id: string;
  bookingId: string;
  type: 'email' | 'sms';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
  template: '24h_before' | '1h_before' | 'confirmation';
}
