import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfileData {
  fullName: string;
  email: string;
  bio?: string;
  company?: string;
  role?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  avatarUrl?: string;
  updatedAt?: Date;
}

export class FirebaseUserProfileService {
  private static getDocRef(userId: string) {
    return doc(db, 'users', userId);
  }

  static async getProfile(userId: string): Promise<UserProfileData | null> {
    try {
      const docRef = this.getDocRef(userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();

      return {
        fullName: data.fullName || '',
        email: data.email || '',
        bio: data.bio || '',
        company: data.company || '',
        role: data.role || '',
        phone: data.phone || '',
        timezone: data.timezone || '',
        language: data.language || '',
        avatarUrl: data.avatarUrl || '',
        updatedAt: data.updatedAt?.toDate?.() || undefined,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async saveProfile(userId: string, profile: UserProfileData): Promise<void> {
    try {
      const docRef = this.getDocRef(userId);

      await setDoc(docRef, {
        fullName: profile.fullName,
        email: profile.email,
        bio: profile.bio || '',
        company: profile.company || '',
        role: profile.role || '',
        phone: profile.phone || '',
        timezone: profile.timezone || '',
        language: profile.language || '',
        avatarUrl: profile.avatarUrl || '',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }
}
