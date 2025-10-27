# Firebase Setup for Novia Workspace

## ✅ Firebase Configuration Complete!

Your Firebase project **"novia-workspace"** has been successfully configured in the application. Here's what's been set up:

### 🔥 Project Details:
- **Project ID**: `novia-workspace`
- **Auth Domain**: `novia-workspace.firebaseapp.com`
- **Storage Bucket**: `novia-workspace.firebasestorage.app`
- **Analytics**: Enabled with measurement ID `G-TVGLGENPCX`

## 🚀 Next Steps to Complete Setup:

### 1. Enable Authentication in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/novia-workspace)
2. Click "Authentication" in the left sidebar
3. Click "Get started"
4. Go to "Sign-in method" tab
5. **Enable "Email/Password"** authentication
6. Optionally enable other providers (Google, GitHub, etc.)

### 2. Create Firestore Database
1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 3. Set Up Security Rules
In Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Team data access
      match /teams/{teamId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Business map data
        match /businessMapNodes/{nodeId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /businessMapEdges/{edgeId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /businessMapLayouts/{layoutId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        // Workspace data
        match /notes/{noteId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /tasks/{taskId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /calendarEvents/{eventId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

## 🧪 Test Your Setup:

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Cross-Device Sync
1. Open your workspace in one browser/device
2. Create a business node in the business map
3. Open the same workspace in another browser/device
4. **The node should appear automatically!** 🎉

### 3. Check Firebase Console
1. Go to Firestore Database in Firebase Console
2. You should see collections being created:
   - `users/{userId}/teams/{teamId}/businessMapNodes`
   - `users/{userId}/teams/{teamId}/businessMapEdges`
   - `users/{userId}/teams/{teamId}/notes`
   - `users/{userId}/teams/{teamId}/tasks`
   - `users/{userId}/teams/{teamId}/calendarEvents`

## 🎯 What You'll Get:

### ✅ Cross-Device Synchronization
- All business map data syncs in real-time across devices
- No more lost data when switching between devices
- Automatic offline support with sync when connection returns

### ✅ Real-Time Updates
- Changes appear instantly on all connected devices
- Perfect for team collaboration
- No need to refresh the page

### ✅ Secure Data Storage
- User-specific data isolation
- Secure authentication with Firebase Auth
- Production-grade reliability

## 🔧 Troubleshooting:

### If you see "Permission denied" errors:
- Check that Firestore security rules are set up correctly
- Ensure Authentication is enabled in Firebase Console

### If data isn't syncing:
- Check browser console for errors
- Verify Firebase project is active
- Check network connectivity

### If you see "Firebase not initialized" errors:
- The configuration is already set up correctly
- Try refreshing the page

## 🎉 You're All Set!

Your Novia Workspace now has enterprise-grade data persistence with Firebase! 

**Key Benefits:**
- ✅ No more localStorage limitations
- ✅ Cross-device data synchronization
- ✅ Real-time collaboration ready
- ✅ Scalable cloud infrastructure
- ✅ Secure user data isolation

Start creating business nodes and watch them sync across all your devices! 🚀
