# Firebase Setup Instructions

## 🔥 Firebase Authentication Setup Required

The application is ready, but you need to enable Email/Password authentication in your Firebase Console.

### Steps to Enable Firebase Authentication:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `im-b169f`

2. **Enable Email/Password Authentication**
   - Click on "Authentication" in the left sidebar
   - Go to "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. **Set up Firestore Database** (if not already done)
   - Click on "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select your region
   - Click "Enable"

4. **Update Firestore Security Rules** (Important!)
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own profile
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null; // Allow all authenticated users to read other profiles
       }
       
       // Documents - collaborators can read/write
       match /documents/{docId} {
         allow read: if request.auth != null && 
                     request.auth.uid in resource.data.collaborators;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
                                request.auth.uid in resource.data.collaborators;
       }
       
       // Comments - authenticated users can read/write
       match /comments/{commentId} {
         allow read, write: if request.auth != null;
       }
       
       // Notifications - users can read their own
       match /notifications/{notifId} {
         allow read, write: if request.auth != null && 
                             request.auth.uid == resource.data.user_id;
       }
     }
   }
   ```

5. **Enable CORS for Firebase** (if needed)
   - In Firebase Console, go to "Project Settings"
   - Under "Your apps", ensure your web app is added
   - The authorized domains should include your deployment URL

### Alternative: Test Without Firebase Authentication

If you want to test the app immediately without setting up Firebase Auth, we can create a mock authentication system. Let me know if you'd like this option.

### Current Status:
✅ Backend API is running
✅ Frontend is deployed
✅ Firebase config is set
⚠️ **Action Required**: Enable Email/Password authentication in Firebase Console

### After Enabling Authentication:
Once you enable Email/Password authentication in Firebase Console:
1. Refresh the application
2. Try registering a new account
3. You should be able to create and edit Investment Memorandum documents

### Need Help?
If you encounter any issues, please share:
1. Screenshot of the Firebase Authentication settings
2. Browser console error messages
3. I can help configure the settings correctly
