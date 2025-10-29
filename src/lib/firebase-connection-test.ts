// Firebase Connection Test
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export async function testFirebaseConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test 1: Try to write to a test collection
    console.log('📝 Testing write operation...');
    const testCollection = collection(db, 'connection-test');
    const testDoc = await addDoc(testCollection, {
      test: true,
      timestamp: serverTimestamp(),
      message: 'Firebase connection test successful'
    });
    console.log('✅ Write test successful, document ID:', testDoc.id);
    
    // Test 2: Try to read from the test collection
    console.log('📖 Testing read operation...');
    const testQuery = query(testCollection, where('test', '==', true));
    const querySnapshot = await getDocs(testQuery);
    console.log('✅ Read test successful, found', querySnapshot.docs.length, 'documents');
    
    // Test 3: Try to write to bookings collection
    console.log('📅 Testing bookings collection write...');
    const bookingsCollection = collection(db, 'bookings');
    const bookingTestDoc = await addDoc(bookingsCollection, {
      userId: 'test-user-123',
      customerName: 'Test Customer',
      test: true,
      timestamp: serverTimestamp()
    });
    console.log('✅ Bookings write test successful, document ID:', bookingTestDoc.id);
    
    // Test 4: Try to read from bookings collection
    console.log('📖 Testing bookings collection read...');
    const bookingsQuery = query(bookingsCollection, where('userId', '==', 'test-user-123'));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    console.log('✅ Bookings read test successful, found', bookingsSnapshot.docs.length, 'documents');
    
    return {
      success: true,
      details: {
        testDocId: testDoc.id,
        bookingTestDocId: bookingTestDoc.id,
        documentsFound: querySnapshot.docs.length,
        bookingsFound: bookingsSnapshot.docs.length
      }
    };
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: {
        code: error.code,
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// Test Firebase security rules
export async function testFirebaseSecurityRules(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log('🔒 Testing Firebase security rules...');
    
    // Test writing to bookings collection with different user IDs
    const bookingsCollection = collection(db, 'bookings');
    
    // Test 1: Write with valid user ID
    console.log('📝 Testing write with valid user ID...');
    const validUserDoc = await addDoc(bookingsCollection, {
      userId: 'valid-user-123',
      customerName: 'Valid User Test',
      test: true,
      timestamp: serverTimestamp()
    });
    console.log('✅ Valid user write successful:', validUserDoc.id);
    
    // Test 2: Try to read with user filter
    console.log('📖 Testing read with user filter...');
    const userQuery = query(bookingsCollection, where('userId', '==', 'valid-user-123'));
    const userSnapshot = await getDocs(userQuery);
    console.log('✅ User filter read successful, found', userSnapshot.docs.length, 'documents');
    
    return {
      success: true,
      details: {
        validUserDocId: validUserDoc.id,
        documentsFound: userSnapshot.docs.length
      }
    };
    
  } catch (error: any) {
    console.error('❌ Firebase security rules test failed:', error);
    return {
      success: false,
      error: error.message,
      details: {
        code: error.code,
        message: error.message,
        stack: error.stack
      }
    };
  }
}
