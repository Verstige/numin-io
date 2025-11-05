// Firebase Notes Service
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
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  visibility: 'private' | 'team';
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseNotesService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'notes');
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

  static async getNotes(
    userId: string, 
    teamId: string
  ): Promise<Note[]> {
    try {
      console.log('🔄 FirebaseNotesService.getNotes called with:', { userId, teamId });
      
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      console.log('🔄 Querying notes collection');
      const querySnapshot = await getDocs(q);
      console.log('📊 Notes query returned', querySnapshot.docs.length, 'documents');
      
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Note data:', { id: doc.id, title: data.title });
        return {
          id: doc.id,
          title: data.title,
          content: data.content || '',
          tags: data.tags || [],
          visibility: data.visibility || 'private',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Note;
      });
      
      console.log('✅ Returning notes:', notes.length);
      return notes;
    } catch (error) {
      console.error('❌ Error getting notes:', error);
      return [];
    }
  }

  static async createNote(
    userId: string,
    teamId: string,
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Note> {
    try {
      console.log('🔄 FirebaseNotesService.createNote called with:', { userId, teamId, note });
      
      // Clean the note data to remove undefined values
      const cleanedNote = this.cleanDataForFirebase(note);
      
      const noteData = {
        ...cleanedNote,
        userId: userId,
        teamId: teamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Note data to save:', noteData);
      console.log('🔄 Collection path: notes');
      
      const docRef = await addDoc(this.getCollection(userId, teamId), noteData);
      console.log('✅ Note document created with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error creating note:', error);
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

  static async updateNote(
    userId: string,
    teamId: string,
    noteId: string,
    updates: Partial<Note>
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseNotesService.updateNote called with:', { userId, teamId, noteId, updates });
      
      // Clean the update data to remove undefined values
      const cleanedUpdates = this.cleanDataForFirebase(updates);
      
      const updateData: any = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      };

      const noteRef = doc(db, 'notes', noteId);
      
      await updateDoc(noteRef, updateData);
      console.log('✅ Note updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  }

  static async deleteNote(
    userId: string,
    teamId: string,
    noteId: string
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseNotesService.deleteNote called with:', { userId, teamId, noteId });
      
      const noteRef = doc(db, 'notes', noteId);
      
      await deleteDoc(noteRef);
      console.log('✅ Note deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  static async getNote(
    userId: string,
    teamId: string,
    noteId: string
  ): Promise<Note | null> {
    try {
      console.log('🔄 FirebaseNotesService.getNote called with:', { userId, teamId, noteId });
      
      const noteRef = doc(db, 'notes', noteId);
      const noteSnap = await getDoc(noteRef);
      
      if (noteSnap.exists()) {
        const data = noteSnap.data();
        console.log('✅ Note found:', { id: noteSnap.id, title: data.title });
        return {
          id: noteSnap.id,
          title: data.title,
          content: data.content || '',
          tags: data.tags || [],
          visibility: data.visibility || 'private',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Note;
      } else {
        console.log('❌ Note not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting note:', error);
      return null;
    }
  }
}
