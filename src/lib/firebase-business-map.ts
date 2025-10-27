// Firebase Business Map Service
// Handles all business map data persistence using Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// TYPES
// ============================================

export interface BusinessMapNode {
  id: string;
  userId: string;
  teamId: string;
  nodeId: string; // ReactFlow node ID
  nodeType: 'business' | 'project' | 'task' | 'milestone' | 'resource' | 'team';
  position: {
    x: number;
    y: number;
  };
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high';
    color?: string;
    icon?: string;
    metadata?: any;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BusinessMapEdge {
  id: string;
  userId: string;
  teamId: string;
  sourceNodeId: string;
  targetNodeId: string;
  createdAt: Timestamp;
}

export interface BusinessMapLayout {
  id: string;
  userId: string;
  teamId: string;
  layoutType: 'default' | 'custom';
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// BUSINESS MAP NODES SERVICE
// ============================================

export class BusinessMapNodesService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'businessMapNodes');
  }

  static async getNodes(userId: string, teamId: string): Promise<BusinessMapNode[]> {
    try {
      const q = query(
        this.getCollection(userId, teamId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BusinessMapNode));
    } catch (error) {
      console.error('Error getting business map nodes:', error);
      return [];
    }
  }

  static async createNode(
    userId: string, 
    teamId: string, 
    nodeData: Omit<BusinessMapNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BusinessMapNode> {
    try {
      const docRef = await addDoc(this.getCollection(userId, teamId), {
        ...nodeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get the created document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        } as BusinessMapNode;
      }
      throw new Error('Failed to create node');
    } catch (error) {
      console.error('Error creating business map node:', error);
      throw error;
    }
  }

  static async updateNode(
    userId: string,
    teamId: string,
    nodeId: string,
    updates: Partial<BusinessMapNode>
  ): Promise<void> {
    try {
      const nodeRef = doc(this.getCollection(userId, teamId), nodeId);
      await updateDoc(nodeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating business map node:', error);
      throw error;
    }
  }

  static async deleteNode(
    userId: string,
    teamId: string,
    nodeId: string
  ): Promise<void> {
    try {
      const nodeRef = doc(this.getCollection(userId, teamId), nodeId);
      await deleteDoc(nodeRef);
    } catch (error) {
      console.error('Error deleting business map node:', error);
      throw error;
    }
  }

  static subscribeToNodes(
    userId: string,
    teamId: string,
    callback: (nodes: BusinessMapNode[]) => void
  ): () => void {
    const q = query(
      this.getCollection(userId, teamId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const nodes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BusinessMapNode));
      callback(nodes);
    });
  }
}

// ============================================
// BUSINESS MAP EDGES SERVICE
// ============================================

export class BusinessMapEdgesService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'businessMapEdges');
  }

  static async getEdges(userId: string, teamId: string): Promise<BusinessMapEdge[]> {
    try {
      const q = query(
        this.getCollection(userId, teamId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BusinessMapEdge));
    } catch (error) {
      console.error('Error getting business map edges:', error);
      return [];
    }
  }

  static async createEdge(
    userId: string,
    teamId: string,
    edgeData: Omit<BusinessMapEdge, 'id' | 'createdAt'>
  ): Promise<BusinessMapEdge> {
    try {
      const docRef = await addDoc(this.getCollection(userId, teamId), {
        ...edgeData,
        createdAt: serverTimestamp()
      });

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        } as BusinessMapEdge;
      }
      throw new Error('Failed to create edge');
    } catch (error) {
      console.error('Error creating business map edge:', error);
      throw error;
    }
  }

  static async deleteEdge(
    userId: string,
    teamId: string,
    edgeId: string
  ): Promise<void> {
    try {
      const edgeRef = doc(this.getCollection(userId, teamId), edgeId);
      await deleteDoc(edgeRef);
    } catch (error) {
      console.error('Error deleting business map edge:', error);
      throw error;
    }
  }

  static subscribeToEdges(
    userId: string,
    teamId: string,
    callback: (edges: BusinessMapEdge[]) => void
  ): () => void {
    const q = query(
      this.getCollection(userId, teamId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const edges = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BusinessMapEdge));
      callback(edges);
    });
  }
}

// ============================================
// BUSINESS MAP LAYOUT SERVICE
// ============================================

export class BusinessMapLayoutService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'businessMapLayouts');
  }

  static async getLayout(userId: string, teamId: string): Promise<BusinessMapLayout | null> {
    try {
      const q = query(
        this.getCollection(userId, teamId),
        where('layoutType', '==', 'default'),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as BusinessMapLayout;
    } catch (error) {
      console.error('Error getting business map layout:', error);
      return null;
    }
  }

  static async saveLayout(
    userId: string,
    teamId: string,
    layoutData: Omit<BusinessMapLayout, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BusinessMapLayout> {
    try {
      const docRef = await addDoc(this.getCollection(userId, teamId), {
        ...layoutData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        } as BusinessMapLayout;
      }
      throw new Error('Failed to save layout');
    } catch (error) {
      console.error('Error saving business map layout:', error);
      throw error;
    }
  }

  static async updateLayout(
    userId: string,
    teamId: string,
    layoutId: string,
    updates: Partial<BusinessMapLayout>
  ): Promise<void> {
    try {
      const layoutRef = doc(this.getCollection(userId, teamId), layoutId);
      await updateDoc(layoutRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating business map layout:', error);
      throw error;
    }
  }
}

// ============================================
// WORKSPACE DATA SERVICE (Firebase version)
// ============================================

export class FirebaseWorkspaceService {
  private static getNotesCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'notes');
  }

  private static getTasksCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'tasks');
  }

  private static getCalendarEventsCollection(userId: string, teamId: string) {
    return collection(db, 'users', userId, 'teams', teamId, 'calendarEvents');
  }

  // Notes
  static async getNotes(userId: string, teamId: string): Promise<any[]> {
    try {
      const q = query(
        this.getNotesCollection(userId, teamId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  static async createNote(userId: string, teamId: string, noteData: any): Promise<any> {
    try {
      const docRef = await addDoc(this.getNotesCollection(userId, teamId), {
        ...noteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        };
      }
      throw new Error('Failed to create note');
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Tasks
  static async getTasks(userId: string, teamId: string): Promise<any[]> {
    try {
      const q = query(
        this.getTasksCollection(userId, teamId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  static async createTask(userId: string, teamId: string, taskData: any): Promise<any> {
    try {
      const docRef = await addDoc(this.getTasksCollection(userId, teamId), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        };
      }
      throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Calendar Events
  static async getCalendarEvents(userId: string, teamId: string): Promise<any[]> {
    try {
      const q = query(
        this.getCalendarEventsCollection(userId, teamId),
        orderBy('eventDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      return [];
    }
  }

  static async createCalendarEvent(userId: string, teamId: string, eventData: any): Promise<any> {
    try {
      const docRef = await addDoc(this.getCalendarEventsCollection(userId, teamId), {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docRef.id,
          ...docSnap.data()
        };
      }
      throw new Error('Failed to create calendar event');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
}
