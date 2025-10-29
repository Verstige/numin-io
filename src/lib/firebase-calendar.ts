// Firebase Calendar Events Service
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  reminder?: boolean;
  reminderTime?: string;
  color?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseCalendarEventsService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'calendarEvents');
  }

  // Helper function to remove undefined values from object
  private static cleanDataForFirebase(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  static async getEvents(
    userId: string, 
    teamId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    try {
      console.log('🔄 FirebaseCalendarEventsService.getEvents called with:', { userId, teamId, startDate, endDate });
      
      let q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId),
        orderBy('eventDate', 'asc')
      );

      // Add date range filters if provided
      if (startDate) {
        q = query(q, where('eventDate', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('eventDate', '<=', Timestamp.fromDate(endDate)));
      }

      console.log('🔄 Querying calendar events collection');
      const querySnapshot = await getDocs(q);
      console.log('📊 Calendar events query returned', querySnapshot.docs.length, 'documents');
      
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Calendar event data:', { id: doc.id, title: data.title, eventDate: data.eventDate });
        return {
          id: doc.id,
          ...data,
          eventDate: data.eventDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CalendarEvent;
      });
      
      console.log('✅ Returning calendar events:', events.length);
      return events;
    } catch (error) {
      console.error('❌ Error getting calendar events:', error);
      return [];
    }
  }

  static async createEvent(
    userId: string,
    teamId: string,
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CalendarEvent> {
    try {
      console.log('🔄 FirebaseCalendarEventsService.createEvent called with:', { userId, teamId, event });
      
      // Clean the event data to remove undefined values
      const cleanedEvent = this.cleanDataForFirebase(event);
      
      const eventData = {
        ...cleanedEvent,
        userId: userId,
        teamId: teamId,
        eventDate: Timestamp.fromDate(event.eventDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Event data to save:', eventData);
      console.log('🔄 Collection path: calendarEvents');
      
      const docRef = await addDoc(this.getCollection(userId, teamId), eventData);
      console.log('✅ Calendar event document created with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error creating calendar event:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Add specific error handling for common Firebase errors
      if (error.code === 'permission-denied') {
        console.error('❌ Permission denied - check Firebase security rules');
        throw new Error('Permission denied. Please check your Firebase security rules.');
      } else if (error.code === 'unavailable') {
        console.error('❌ Firebase service unavailable');
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      } else if (error.code === 'invalid-argument') {
        console.error('❌ Invalid argument - check data structure');
        throw new Error('Invalid data structure. Please check all required fields.');
      }
      
      throw error;
    }
  }

  static async updateEvent(
    userId: string,
    teamId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseCalendarEventsService.updateEvent called with:', { userId, teamId, eventId, updates });
      
      // Clean the update data to remove undefined values
      const cleanedUpdates = this.cleanDataForFirebase(updates);
      
      const updateData: any = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      };

      // Convert Date objects to Timestamps
      if (updates.eventDate) {
        updateData.eventDate = Timestamp.fromDate(updates.eventDate);
      }

      const eventRef = collection(db, 'calendarEvents');
      const eventDoc = eventRef.doc(eventId);
      
      await updateDoc(eventDoc, updateData);
      console.log('✅ Calendar event updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating calendar event:', error);
      throw error;
    }
  }

  static async deleteEvent(
    userId: string,
    teamId: string,
    eventId: string
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseCalendarEventsService.deleteEvent called with:', { userId, teamId, eventId });
      
      const eventRef = collection(db, 'calendarEvents');
      const eventDoc = eventRef.doc(eventId);
      
      await deleteDoc(eventDoc);
      console.log('✅ Calendar event deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting calendar event:', error);
      throw error;
    }
  }
}
