// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for Novia Workspace
const firebaseConfig = {
  apiKey: "AIzaSyD70VG7p1t1o6v8ugljP8h_Rhw6MRGcJqg",
  authDomain: "novia-workspace.firebaseapp.com",
  projectId: "novia-workspace",
  storageBucket: "novia-workspace.firebasestorage.app",
  messagingSenderId: "912009840943",
  appId: "1:912009840943:web:8f85531419a523026139da",
  measurementId: "G-TVGLGENPCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;
