// Firebase Contacts Service
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
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: string;
  lastContact?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseContactsService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'contacts');
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

  static async getContacts(
    userId: string, 
    teamId: string
  ): Promise<Contact[]> {
    try {
      console.log('🔄 FirebaseContactsService.getContacts called with:', { userId, teamId });
      
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      console.log('🔄 Querying contacts collection');
      const querySnapshot = await getDocs(q);
      console.log('📊 Contacts query returned', querySnapshot.docs.length, 'documents');
      
      const contacts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Contact data:', { id: doc.id, name: data.name, email: data.email });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Contact;
      });
      
      console.log('✅ Returning contacts:', contacts.length);
      return contacts;
    } catch (error) {
      console.error('❌ Error getting contacts:', error);
      return [];
    }
  }

  static async createContact(
    userId: string,
    teamId: string,
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Contact> {
    try {
      console.log('🔄 FirebaseContactsService.createContact called with:', { userId, teamId, contact });
      
      // Clean the contact data to remove undefined values
      const cleanedContact = this.cleanDataForFirebase(contact);
      
      const contactData = {
        ...cleanedContact,
        userId: userId,
        teamId: teamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Contact data to save:', contactData);
      console.log('🔄 Collection path: contacts');
      
      const docRef = await addDoc(this.getCollection(userId, teamId), contactData);
      console.log('✅ Contact document created with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error creating contact:', error);
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

  static async updateContact(
    userId: string,
    teamId: string,
    contactId: string,
    updates: Partial<Contact>
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseContactsService.updateContact called with:', { userId, teamId, contactId, updates });
      
      // Clean the update data to remove undefined values
      const cleanedUpdates = this.cleanDataForFirebase(updates);
      
      const updateData: any = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      };

      const contactRef = doc(db, 'contacts', contactId);
      
      await updateDoc(contactRef, updateData);
      console.log('✅ Contact updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating contact:', error);
      throw error;
    }
  }

  static async deleteContact(
    userId: string,
    teamId: string,
    contactId: string
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseContactsService.deleteContact called with:', { userId, teamId, contactId });
      
      const contactRef = doc(db, 'contacts', contactId);
      
      await deleteDoc(contactRef);
      console.log('✅ Contact deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    }
  }

  static async getContact(
    userId: string,
    teamId: string,
    contactId: string
  ): Promise<Contact | null> {
    try {
      console.log('🔄 FirebaseContactsService.getContact called with:', { userId, teamId, contactId });
      
      const contactRef = doc(db, 'contacts', contactId);
      const contactSnap = await getDoc(contactRef);
      
      if (contactSnap.exists()) {
        const data = contactSnap.data();
        console.log('✅ Contact found:', { id: contactSnap.id, name: data.name });
        return {
          id: contactSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Contact;
      } else {
        console.log('❌ Contact not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting contact:', error);
      return null;
    }
  }
}
