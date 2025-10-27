// Firebase Connection Test
// This file can be used to test Firebase connectivity

import { db, auth } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore connection
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Firestore connection successful! Document ID:', testDoc.id);
    
    // Test reading data
    const querySnapshot = await getDocs(testCollection);
    console.log('✅ Firestore read successful! Documents:', querySnapshot.size);
    
    // Test Auth connection
    console.log('✅ Firebase Auth initialized:', !!auth);
    
    return {
      success: true,
      message: 'Firebase connection test passed!',
      firestoreConnected: true,
      authConnected: !!auth
    };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      message: 'Firebase connection test failed',
      error: error.message
    };
  }
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run test after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    testFirebaseConnection().then(result => {
      if (result.success) {
        console.log('🎉 Firebase is ready for Novia Workspace!');
      } else {
        console.error('🚨 Firebase setup needs attention:', result.message);
      }
    });
  }, 2000);
}
