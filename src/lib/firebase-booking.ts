import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BookingTemplate, Booking, BookingSettings, BookingSlot } from '@/types/booking';

// ============================================
// FIREBASE BOOKING SERVICES
// ============================================

export class FirebaseBookingTemplatesService {
  private static getCollection(userId: string, teamId: string) {
    // Use a simpler path that's more likely to work with default Firebase rules
    return collection(db, 'bookingTemplates');
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

  // Test function to check Firebase connectivity
  static async testConnection(userId: string, teamId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing Firebase connection...');
      const testCollection = collection(db, 'test');
      const testDoc = await addDoc(testCollection, { test: true, timestamp: serverTimestamp() });
      console.log('✅ Firebase connection test successful:', testDoc.id);
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return false;
    }
  }

  static async getTemplates(userId: string, teamId: string): Promise<BookingTemplate[]> {
    try {
      console.log('🔄 FirebaseBookingTemplatesService.getTemplates called with:', { userId, teamId });
      
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId)
      );
      
      console.log('🔄 Querying collection: bookingTemplates');
      const querySnapshot = await getDocs(q);
      console.log('📊 Query returned', querySnapshot.docs.length, 'documents');
      
      const templates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Document data:', { id: doc.id, userId: data.userId, name: data.name });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as BookingTemplate;
      });
      
      // Sort by createdAt on the client side to avoid Firebase index requirement
      templates.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      console.log('✅ Returning templates:', templates.length);
      return templates;
    } catch (error) {
      console.error('❌ Error getting booking templates:', error);
      return [];
    }
  }

  static async createTemplate(
    userId: string, 
    teamId: string, 
    template: Omit<BookingTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BookingTemplate> {
    try {
      console.log('🔄 FirebaseBookingTemplatesService.createTemplate called with:', { userId, teamId, template });
      
      // Clean the template data to remove undefined values
      const cleanedTemplate = this.cleanDataForFirebase(template);
      
      const templateData = {
        ...cleanedTemplate,
        userId,
        teamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Template data to save:', templateData);
      console.log('🔄 Collection path: bookingTemplates');

      const docRef = await addDoc(this.getCollection(userId, teamId), templateData);
      console.log('✅ Document created with ID:', docRef.id);
      
      // Verify the document was actually saved by reading it back
      const verifyDoc = await getDocs(query(this.getCollection(userId, teamId), where('__name__', '==', docRef.id)));
      console.log('🔍 Verification query returned', verifyDoc.docs.length, 'documents');
      
      const result = {
        id: docRef.id,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ Returning created template:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating booking template:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Handle specific Firebase errors
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

  static async updateTemplate(
    userId: string, 
    teamId: string, 
    templateId: string, 
    updates: Partial<BookingTemplate>
  ): Promise<void> {
    try {
      const templateRef = doc(this.getCollection(userId, teamId), templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating booking template:', error);
      throw error;
    }
  }

  static async deleteTemplate(userId: string, teamId: string, templateId: string): Promise<void> {
    try {
      const templateRef = doc(this.getCollection(userId, teamId), templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting booking template:', error);
      throw error;
    }
  }

  static subscribeToTemplates(
    userId: string,
    teamId: string,
    callback: (templates: BookingTemplate[]) => void
  ): () => void {
    const q = query(
      this.getCollection(userId, teamId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as BookingTemplate));
      callback(templates);
    });
  }
}

export class FirebaseBookingsService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'bookings');
  }

  static async getBookings(userId: string, teamId: string): Promise<Booking[]> {
    try {
      console.log('🔄 FirebaseBookingsService.getBookings called with:', { userId, teamId });
      
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId)
      );
      
      console.log('🔄 Querying bookings collection');
      const querySnapshot = await getDocs(q);
      console.log('📊 Bookings query returned', querySnapshot.docs.length, 'documents');
      
      const bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Booking data:', { id: doc.id, customerName: data.customerName, status: data.status });
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          cancelledAt: data.cancelledAt?.toDate() || undefined
        } as Booking;
      });
      
      // Sort by createdAt on the client side to avoid Firebase index requirement
      bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Returning bookings:', bookings.length);
      return bookings;
    } catch (error) {
      console.error('❌ Error getting bookings:', error);
      return [];
    }
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

  static async createBooking(
    userId: string, 
    teamId: string, 
    booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Booking> {
    try {
      // Clean the booking data to remove undefined values
      const cleanedBooking = this.cleanDataForFirebase(booking);
      
      const bookingData = {
        ...cleanedBooking,
        userId: userId,  // ✅ Add userId to document data for proper querying
        startTime: Timestamp.fromDate(booking.startTime),
        endTime: Timestamp.fromDate(booking.endTime),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cancelledAt: booking.cancelledAt ? Timestamp.fromDate(booking.cancelledAt) : null
      };

      // Validate required fields
      if (!bookingData.userId) {
        throw new Error('userId is required');
      }
      if (!bookingData.templateId) {
        throw new Error('templateId is required');
      }
      if (!bookingData.customerName) {
        throw new Error('customerName is required');
      }
      if (!bookingData.customerEmail) {
        throw new Error('customerEmail is required');
      }
      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error('startTime and endTime are required');
      }

      console.log('🔄 Booking data to save:', bookingData);
      console.log('🔄 Collection path: bookings');
      console.log('🔄 User ID in booking data:', bookingData.userId);
      console.log('🔄 Template ID in booking data:', bookingData.templateId);
      console.log('🔄 Customer name in booking data:', bookingData.customerName);
      
      const docRef = await addDoc(this.getCollection(userId, teamId), bookingData);
      console.log('✅ Booking document created with ID:', docRef.id);
      
      // Verify the document was actually saved
      console.log('🔍 Verifying document was saved...');
      const verifyQuery = query(
        this.getCollection(userId, teamId),
        where('__name__', '==', docRef.id)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      console.log('🔍 Verification query returned', verifySnapshot.docs.length, 'documents');
      if (verifySnapshot.docs.length > 0) {
        const savedData = verifySnapshot.docs[0].data();
        console.log('✅ Document verified - saved data includes userId:', savedData.userId);
      } else {
        console.error('❌ Document verification failed - document not found after creation');
      }
      
      return {
        id: docRef.id,
        ...booking,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
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
      } else if (error.code === 'failed-precondition') {
        console.error('❌ Failed precondition - check Firebase rules or indexes');
        throw new Error('Database precondition failed. Please check Firebase configuration.');
      }
      
      throw error;
    }
  }

  static async updateBooking(
    userId: string, 
    teamId: string, 
    bookingId: string, 
    updates: Partial<Booking>
  ): Promise<void> {
    try {
      const bookingRef = doc(this.getCollection(userId, teamId), bookingId);
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }
      if (updates.cancelledAt) {
        updateData.cancelledAt = Timestamp.fromDate(updates.cancelledAt);
      }

      await updateDoc(bookingRef, updateData);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  static async deleteBooking(userId: string, teamId: string, bookingId: string): Promise<void> {
    try {
      const bookingRef = doc(this.getCollection(userId, teamId), bookingId);
      await deleteDoc(bookingRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  static subscribeToBookings(
    userId: string,
    teamId: string,
    callback: (bookings: Booking[]) => void
  ): () => void {
    const q = query(
      this.getCollection(userId, teamId),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        cancelledAt: doc.data().cancelledAt?.toDate() || undefined
      } as Booking));
      
      // Sort by createdAt on the client side to avoid Firebase index requirement
      bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      callback(bookings);
    });
  }
}

export class FirebaseBookingSettingsService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'bookingSettings');
  }

  static async getSettings(userId: string, teamId: string): Promise<BookingSettings | null> {
    try {
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as BookingSettings;
    } catch (error) {
      console.error('Error getting booking settings:', error);
      return null;
    }
  }

  static async saveSettings(
    userId: string, 
    teamId: string, 
    settings: Omit<BookingSettings, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BookingSettings> {
    try {
      const settingsData = {
        ...settings,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.getCollection(userId, teamId), settingsData);
      
      return {
        id: docRef.id,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error saving booking settings:', error);
      throw error;
    }
  }

  static async updateSettings(
    userId: string, 
    teamId: string, 
    settingsId: string, 
    updates: Partial<BookingSettings>
  ): Promise<void> {
    try {
      const settingsRef = doc(this.getCollection(userId, teamId), settingsId);
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating booking settings:', error);
      throw error;
    }
  }
}
