import type { Booking, BookingTemplate, ReminderJob } from '@/types/booking';

export class ReminderSystem {
  private static instance: ReminderSystem;
  private reminderJobs: ReminderJob[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): ReminderSystem {
    if (!ReminderSystem.instance) {
      ReminderSystem.instance = new ReminderSystem();
    }
    return ReminderSystem.instance;
  }

  start() {
    // Load existing reminder jobs
    this.loadReminderJobs();
    
    // Check for reminders every minute
    this.intervalId = setInterval(() => {
      this.checkAndSendReminders();
    }, 60000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private loadReminderJobs() {
    const saved = localStorage.getItem('reminderJobs');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.reminderJobs = parsed.map((job: any) => ({
        ...job,
        scheduledFor: new Date(job.scheduledFor)
      }));
    }
  }

  scheduleReminders(booking: Booking, settings?: any) {
    const startTime = new Date(booking.startTime);
    
    // Only schedule if email reminders are enabled
    if (settings?.emailReminders !== false) {
      // Schedule 24h reminder
      const reminder24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > new Date() && settings?.reminderTimings?.email24h !== false) {
        this.scheduleReminder({
          id: `reminder_${booking.id}_24h_email`,
          bookingId: booking.id,
          type: 'email',
          scheduledFor: reminder24h,
          status: 'pending',
          template: '24h_before'
        });
      }

      // Schedule 1h reminder
      const reminder1h = new Date(startTime.getTime() - 60 * 60 * 1000);
      if (reminder1h > new Date() && settings?.reminderTimings?.email1h !== false) {
        this.scheduleReminder({
          id: `reminder_${booking.id}_1h_email`,
          bookingId: booking.id,
          type: 'email',
          scheduledFor: reminder1h,
          status: 'pending',
          template: '1h_before'
        });
      }
    }

    // Only schedule SMS if SMS reminders are enabled and phone number exists
    if (settings?.smsReminders && booking.customerPhone && settings?.reminderTimings?.sms24h !== false) {
      const reminder24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > new Date()) {
        this.scheduleReminder({
          id: `reminder_${booking.id}_24h_sms`,
          bookingId: booking.id,
          type: 'sms',
          scheduledFor: reminder24h,
          status: 'pending',
          template: '24h_before'
        });
      }

      const reminder1h = new Date(startTime.getTime() - 60 * 60 * 1000);
      if (reminder1h > new Date() && settings?.reminderTimings?.sms1h !== false) {
        this.scheduleReminder({
          id: `reminder_${booking.id}_1h_sms`,
          bookingId: booking.id,
          type: 'sms',
          scheduledFor: reminder1h,
          status: 'pending',
          template: '1h_before'
        });
      }
    }
  }

  private scheduleReminder(reminder: ReminderJob) {
    // Remove any existing reminder with same ID
    this.reminderJobs = this.reminderJobs.filter(job => job.id !== reminder.id);
    this.reminderJobs.push(reminder);
    localStorage.setItem('reminderJobs', JSON.stringify(this.reminderJobs));
  }

  private async checkAndSendReminders() {
    const now = new Date();
    const pendingReminders = this.reminderJobs.filter(
      job => job.status === 'pending' && job.scheduledFor <= now
    );

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder);
        reminder.status = 'sent';
      } catch (error) {
        console.error('Failed to send reminder:', error);
        reminder.status = 'failed';
      }
    }

    // Update stored reminders
    localStorage.setItem('reminderJobs', JSON.stringify(this.reminderJobs));
  }

  private async sendReminder(reminder: ReminderJob) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find((b: Booking) => b.id === reminder.bookingId);
    
    if (!booking) return;

    const templates = JSON.parse(localStorage.getItem('bookingTemplates') || '[]');
    const template = templates.find((t: BookingTemplate) => t.id === booking.templateId);

    if (reminder.type === 'email') {
      await this.sendEmailReminder(booking, template, reminder.template);
    } else if (reminder.type === 'sms') {
      await this.sendSMSReminder(booking, template, reminder.template);
    }

    // Update booking to mark reminder as sent
    this.updateBookingReminderStatus(booking.id, reminder.template, reminder.type);
  }

  private async sendEmailReminder(booking: Booking, template: BookingTemplate, reminderType: string) {
    try {
      // Import Gmail service dynamically
      const { gmailService } = await import('@/lib/gmail-integration');
      
      let subject = '';
      let body = '';

      if (reminderType === '24h_before') {
        subject = `Reminder: Your appointment is tomorrow at ${booking.startTime.toLocaleTimeString()}`;
        body = `
Hello ${booking.customerName},

This is a friendly reminder that you have an appointment scheduled for:

Date: ${booking.startTime.toLocaleDateString()}
Time: ${booking.startTime.toLocaleTimeString()}
Duration: ${booking.duration} minutes
Type: ${booking.meetingType}
${booking.location ? `Location: ${booking.location}` : ''}
${booking.videoLink ? `Video Link: ${booking.videoLink}` : ''}

Booking Code: ${booking.bookingCode}

If you need to reschedule or cancel, please contact us as soon as possible.

We look forward to meeting with you!

Best regards,
Your Team
        `;
      } else if (reminderType === '1h_before') {
        subject = `Reminder: Your appointment is in 1 hour`;
        body = `
Hello ${booking.customerName},

Your appointment is starting in 1 hour!

Details:
- Time: ${booking.startTime.toLocaleTimeString()}
- Duration: ${booking.duration} minutes
- Type: ${booking.meetingType}
${booking.location ? `- Location: ${booking.location}` : ''}
${booking.videoLink ? `- Video Link: ${booking.videoLink}` : ''}

Booking Code: ${booking.bookingCode}

We're excited to meet with you soon!

Best regards,
Your Team
        `;
      }

      // Get connected Gmail accounts
      const accounts = gmailService.getConnectedAccounts();
      if (accounts.length > 0) {
        // Send via first connected Gmail account
        await gmailService.sendEmail(accounts[0].id, booking.customerEmail, subject, body);
        console.log(`Email reminder sent to ${booking.customerEmail}`);
      } else {
        console.log('No Gmail accounts connected - email reminder not sent');
      }
    } catch (error) {
      console.error('Failed to send email reminder:', error);
      throw error;
    }
  }

  private async sendSMSReminder(booking: Booking, template: BookingTemplate, reminderType: string) {
    // For now, just log the SMS reminder
    // In a real implementation, you'd integrate with Twilio or similar SMS service
    let message = '';

    if (reminderType === '24h_before') {
      message = `Hi ${booking.customerName}, reminder: your appointment is tomorrow at ${booking.startTime.toLocaleTimeString()}. Booking code: ${booking.bookingCode}`;
    } else if (reminderType === '1h_before') {
      message = `Hi ${booking.customerName}, your appointment starts in 1 hour at ${booking.startTime.toLocaleTimeString()}. Booking code: ${booking.bookingCode}`;
    }

    console.log(`SMS reminder would be sent to ${booking.customerPhone}: ${message}`);
    
    // TODO: Integrate with actual SMS service
    // await smsService.sendSMS(booking.customerPhone, message);
  }

  private updateBookingReminderStatus(bookingId: string, template: string, type: string) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId);
    
    if (bookingIndex !== -1) {
      const reminderKey = `${type}${template}` as keyof typeof bookings[bookingIndex]['remindersSent'];
      bookings[bookingIndex].remindersSent[reminderKey] = true;
      bookings[bookingIndex].updatedAt = new Date();
      
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }

  // Public method to manually send confirmation email
  async sendBookingConfirmation(booking: Booking, template: BookingTemplate) {
    try {
      const { gmailService } = await import('@/lib/gmail-integration');
      
      const subject = `Booking Confirmation - ${booking.bookingCode}`;
      const body = `
Hello ${booking.customerName},

Your appointment has been booked successfully!

Booking Details:
- Date: ${booking.startTime.toLocaleDateString()}
- Time: ${booking.startTime.toLocaleTimeString()}
- Duration: ${booking.duration} minutes
- Type: ${booking.meetingType}
${booking.location ? `- Location: ${booking.location}` : ''}
${booking.videoLink ? `- Video Link: ${booking.videoLink}` : ''}
${booking.phoneNumber ? `- Phone: ${booking.phoneNumber}` : ''}

Booking Code: ${booking.bookingCode}

${template.instructions ? `\nInstructions: ${template.instructions}` : ''}

We'll send you a reminder before your appointment.

Best regards,
Your Team
      `;
      
      const accounts = gmailService.getConnectedAccounts();
      if (accounts.length > 0) {
        await gmailService.sendEmail(accounts[0].id, booking.customerEmail, subject, body);
        console.log(`Booking confirmation sent to ${booking.customerEmail}`);
        return true;
      } else {
        console.log('No Gmail accounts connected - confirmation email not sent');
        return false;
      }
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      return false;
    }
  }
}
