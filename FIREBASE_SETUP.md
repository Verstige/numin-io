# Firebase Setup Guide for Nexus AI

## 🔥 Firebase Project Configuration

To complete the Firebase integration, you need to set up a Firebase project and configure the application. Here's what you need to do:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `nexus-ai` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable other providers (Google, GitHub, etc.)

### 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web app (</> icon)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 5. Update Firebase Configuration

Replace the placeholder configuration in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 6. Set Up Firestore Security Rules

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

### 7. Test the Integration

1. Start your development server: `npm run dev`
2. Open the browser console
3. Try creating a business node in the business map
4. Check the Firestore console to see if data is being saved
5. Open the same workspace in another browser/device to test sync

## 🚀 Benefits of Firebase Integration

### ✅ Cross-Device Synchronization
- All your business map data syncs in real-time across devices
- No more lost data when switching between devices
- Automatic offline support with sync when connection returns

### ✅ Real-Time Updates
- Changes appear instantly on all connected devices
- Perfect for team collaboration
- No need to refresh the page

### ✅ Secure Authentication
- User-specific data isolation
- Secure authentication with Firebase Auth
- Easy integration with social login providers

### ✅ Scalable Infrastructure
- Firebase handles all the backend infrastructure
- Automatic scaling as your user base grows
- Built-in CDN for fast global access

## 🔧 Development vs Production

### Development Mode
- Uses test mode Firestore rules
- All data is accessible (for development)
- Firebase emulators available for local testing

### Production Mode
- Strict security rules enforced
- User data properly isolated
- Production-grade performance and reliability

## 📱 Mobile Support

Firebase works seamlessly across:
- Web browsers
- iOS devices
- Android devices
- Desktop applications

Your business map data will sync across all platforms!

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase not initialized" error**
   - Check your Firebase configuration in `src/lib/firebase.ts`
   - Ensure all required fields are filled

2. **"Permission denied" error**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Data not syncing**
   - Check browser console for errors
   - Verify Firebase project is active
   - Check network connectivity

4. **Authentication issues**
   - Ensure Authentication is enabled in Firebase Console
   - Check sign-in method configuration

### Getting Help:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Community Forum: https://firebase.googleblog.com/

## 🎉 Next Steps

Once Firebase is configured:

1. **Test cross-device sync** - Create nodes on one device, check if they appear on another
2. **Set up user authentication** - Implement login/signup flows
3. **Configure team collaboration** - Add team-based data sharing
4. **Set up production environment** - Configure production Firebase project
5. **Monitor usage** - Use Firebase Analytics to track user engagement

Your Nexus AI platform now has enterprise-grade data persistence! 🚀
