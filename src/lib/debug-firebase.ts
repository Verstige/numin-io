// Firebase Debugging Utilities
// Run these functions in the browser console to debug Firebase issues

import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { BusinessMapNodesService, BusinessMapEdgesService } from './firebase-business-map';

// Make debugging functions available globally
declare global {
  interface Window {
    debugFirebase: {
      checkAuth: () => void;
      testFirestore: () => Promise<void>;
      testNodeCreation: () => Promise<void>;
      listNodes: () => Promise<void>;
      checkFirebaseConfig: () => void;
    };
  }
}

export const debugFirebase = {
  // Check authentication status
  checkAuth: () => {
    console.log('🔐 Firebase Auth Status:');
    console.log('Current user:', auth.currentUser);
    console.log('User email:', auth.currentUser?.email);
    console.log('User UID:', auth.currentUser?.uid);
    console.log('Is authenticated:', !!auth.currentUser);
  },

  // Test Firestore connection
  testFirestore: async () => {
    try {
      console.log('🔥 Testing Firestore connection...');
      
      const testCollection = collection(db, 'test');
      const testDoc = await addDoc(testCollection, {
        message: 'Debug test',
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      
      console.log('✅ Firestore write successful! Document ID:', testDoc.id);
      
      // Test read
      const querySnapshot = await getDocs(testCollection);
      console.log('✅ Firestore read successful! Documents:', querySnapshot.size);
      
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  },

  // Test node creation specifically
  testNodeCreation: async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    console.log('🧪 Testing node creation for user:', user.email);
    
    try {
      const testNode = {
        userId: user.uid,
        teamId: 'default-team',
        nodeId: `debug_test_${Date.now()}`,
        nodeType: 'business' as any,
        position: { x: 200, y: 200 },
        data: {
          title: 'Debug Test Node',
          description: 'This is a debug test node',
          status: 'planning',
          priority: 'medium' as any,
          color: '#3b82f6',
          icon: 'Building2',
          metadata: {
            category: 'business',
            progress: 0,
            team: [],
            tags: ['debug', 'test'],
            nodeType: 'business'
          }
        }
      };

      console.log('📝 Creating test node with data:', testNode);
      const createdNode = await BusinessMapNodesService.createNode(user.uid, 'default-team', testNode);
      console.log('✅ Node created successfully:', createdNode);
      
    } catch (error) {
      console.error('❌ Node creation failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
    }
  },

  // List all nodes for current user
  listNodes: async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('📋 Listing nodes for user:', user.email);
      const nodes = await BusinessMapNodesService.getNodes(user.uid, 'default-team');
      console.log('📊 Found nodes:', nodes.length);
      console.log('📝 Node details:', nodes);
      
    } catch (error) {
      console.error('❌ Failed to list nodes:', error);
    }
  },

  // Check Firebase configuration
  checkFirebaseConfig: () => {
    console.log('⚙️ Firebase Configuration:');
    console.log('Database:', db);
    console.log('Auth:', auth);
    console.log('App:', db.app);
    console.log('Project ID:', db.app.options.projectId);
    console.log('Auth Domain:', db.app.options.authDomain);
  }
};

// Make debugging functions available globally
if (typeof window !== 'undefined') {
  window.debugFirebase = debugFirebase;
  console.log('🛠️ Firebase debugging tools loaded!');
  console.log('Run window.debugFirebase.checkAuth() to check authentication');
  console.log('Run window.debugFirebase.testFirestore() to test Firestore');
  console.log('Run window.debugFirebase.testNodeCreation() to test node creation');
  console.log('Run window.debugFirebase.listNodes() to list existing nodes');
  console.log('Run window.debugFirebase.checkFirebaseConfig() to check config');
}
