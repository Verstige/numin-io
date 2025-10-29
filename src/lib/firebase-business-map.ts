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
  nodeType: 'business' | 'subproject' | 'system' | 'process' | 'task' | 'milestone' | 'resource' | 'team';
  position: {
    x: number;
    y: number;
  };
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high';
    progress?: number;
    color?: string;
    icon?: string;
    url?: string | null;
    isCustom?: boolean;
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
// FIREBASE WORKSPACE TASKS SERVICE
// ============================================

export interface FirebaseWorkspaceTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  assigneeAvatar?: string;
  dueDate?: Date;
  startDate?: Date;
  tags: string[];
  projectId?: string;
  visibility: 'private' | 'team';
  subtasks: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseWorkspaceTasksService {
  static async getTasks(userId: string, teamId: string, projectId?: string): Promise<FirebaseWorkspaceTask[]> {
    // Return immediately from localStorage (no async delay) with user-specific key
    const userSpecificKey = `firebaseTasks_${userId}_${teamId}`;
    const savedTasks = localStorage.getItem(userSpecificKey);
    let localTasks: FirebaseWorkspaceTask[] = [];
    if (savedTasks) {
      localTasks = JSON.parse(savedTasks);
      console.log('📝 Loaded tasks from localStorage for user:', userId, 'Count:', localTasks.length);
    }

    // Try Firebase in background (don't wait for it)
    setTimeout(async () => {
      try {
        let q = query(
          collection(db, 'users', userId, 'teams', teamId, 'tasks'),
          orderBy('createdAt', 'desc')
        );

        if (projectId) {
          q = query(
            collection(db, 'users', userId, 'teams', teamId, 'tasks'),
            where('projectId', '==', projectId),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(q);
        const dbTasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description || '',
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            assignee: data.assignee || 'Unassigned',
            assigneeAvatar: data.assigneeAvatar,
            dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : undefined,
            startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : undefined,
            tags: data.tags || [],
            projectId: data.projectId,
            visibility: data.visibility || 'team',
            subtasks: data.subtasks || [],
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
          };
        });
        
        // Update localStorage with Firebase data
        localStorage.setItem(userSpecificKey, JSON.stringify(dbTasks));
        console.log('✅ Synced tasks from Firebase to localStorage');
      } catch (dbError) {
        console.warn('Firebase not available, using localStorage:', dbError);
      }
    }, 0);

    return localTasks;
  }

  static async createTask(task: Omit<FirebaseWorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>, userId: string, teamId: string): Promise<FirebaseWorkspaceTask> {
    // Always create in localStorage first for immediate response
    const newTask: FirebaseWorkspaceTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userSpecificKey = `firebaseTasks_${userId}_${teamId}`;
    const savedTasks = localStorage.getItem(userSpecificKey);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    tasks.unshift(newTask);
    localStorage.setItem(userSpecificKey, JSON.stringify(tasks));
    console.log('✅ Task saved to localStorage for user:', userId, 'Task ID:', newTask.id);

    // Try to save to Firebase in background
    try {
      const firebaseTaskData = {
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status,
        priority: newTask.priority,
        assignee: newTask.assignee,
        assigneeAvatar: newTask.assigneeAvatar,
        dueDate: newTask.dueDate ? Timestamp.fromDate(newTask.dueDate) : null,
        startDate: newTask.startDate ? Timestamp.fromDate(newTask.startDate) : null,
        tags: newTask.tags,
        projectId: newTask.projectId || null,
        visibility: newTask.visibility,
        subtasks: newTask.subtasks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'teams', teamId, 'tasks'), firebaseTaskData);
      
      // Update localStorage with Firebase ID
      const updatedTasks = tasks.map(t => 
        t.id === newTask.id 
          ? { ...t, id: docRef.id }
          : t
      );
      localStorage.setItem(userSpecificKey, JSON.stringify(updatedTasks));
      console.log('✅ Task synced to Firebase for user:', userId);

      return {
        ...newTask,
        id: docRef.id
      };
    } catch (dbError) {
      console.warn('Firebase save failed, using localStorage only:', dbError);
    }

    return newTask;
  }

  static async updateTask(id: string, updates: Partial<FirebaseWorkspaceTask>, userId: string, teamId: string): Promise<FirebaseWorkspaceTask> {
    const userSpecificKey = `firebaseTasks_${userId}_${teamId}`;
    const savedTasks = localStorage.getItem(userSpecificKey);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    const taskIndex = tasks.findIndex((t: FirebaseWorkspaceTask) => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    tasks[taskIndex] = updatedTask;
    localStorage.setItem(userSpecificKey, JSON.stringify(tasks));
    console.log('✅ Task updated in localStorage');

    // Try to update in Firebase in background
    try {
      const firebaseUpdates: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Convert dates to Firebase timestamps
      if (updates.dueDate) {
        firebaseUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      if (updates.startDate) {
        firebaseUpdates.startDate = Timestamp.fromDate(updates.startDate);
      }

      await updateDoc(doc(collection(db, 'users', userId, 'teams', teamId, 'tasks'), id), firebaseUpdates);
      console.log('✅ Task updated in Firebase');
    } catch (dbError) {
      console.warn('Firebase update failed, using localStorage only:', dbError);
    }

    return updatedTask;
  }

  static async deleteTask(id: string, userId: string, teamId: string): Promise<void> {
    const userSpecificKey = `firebaseTasks_${userId}_${teamId}`;
    const savedTasks = localStorage.getItem(userSpecificKey);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    const updatedTasks = tasks.filter((t: FirebaseWorkspaceTask) => t.id !== id);
    localStorage.setItem(userSpecificKey, JSON.stringify(updatedTasks));
    console.log('✅ Task deleted from localStorage');

    // Try to delete from Firebase in background
    try {
      await deleteDoc(doc(collection(db, 'users', userId, 'teams', teamId, 'tasks'), id));
      console.log('✅ Task deleted from Firebase');
    } catch (dbError) {
      console.warn('Firebase delete failed, using localStorage only:', dbError);
    }
  }

  // Subscribe to tasks for real-time updates
  static subscribeToTasks(userId: string, teamId: string, callback: (tasks: FirebaseWorkspaceTask[]) => void): () => void {
    const q = query(
      collection(db, 'users', userId, 'teams', teamId, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          assignee: data.assignee || 'Unassigned',
          assigneeAvatar: data.assigneeAvatar,
          dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : undefined,
          startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : undefined,
          tags: data.tags || [],
          projectId: data.projectId,
          visibility: data.visibility || 'team',
          subtasks: data.subtasks || [],
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
        };
      });
      callback(tasks);
    });
  }
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

  static async updateTask(userId: string, teamId: string, taskId: string, updates: any): Promise<any> {
    try {
      const taskRef = doc(this.getTasksCollection(userId, teamId), taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const docSnap = await getDoc(taskRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      throw new Error('Failed to update task');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(userId: string, teamId: string, taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.getTasksCollection(userId, teamId), taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Subscribe to tasks for real-time updates
  static subscribeToTasks(userId: string, teamId: string, callback: (tasks: any[]) => void): () => void {
    const q = query(
      this.getTasksCollection(userId, teamId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    });
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
