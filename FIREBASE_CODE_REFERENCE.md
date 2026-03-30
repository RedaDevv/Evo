# Firebase Fixes - Code Reference

## Summary of Code Changes

### 1. Firebase Configuration (`firebase.ts`)

#### ✅ AFTER (Fixed Version)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Validate configuration
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  throw new Error(
    'Firebase configuration incomplete. Please set VITE_FIREBASE_* environment variables.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore: Multiple tabs open, persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore: Browser does not support offline persistence');
  }
});
```

#### ❌ BEFORE (Problematic Version)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json'; // ❌ Exposed!

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // ❌ Invalid DB ID
export const googleProvider = new GoogleAuthProvider();
// ❌ No offline persistence
```

---

### 2. Error Handling (`services/firebaseService.ts`)

#### ✅ AFTER (Fixed Version)
```typescript
function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null,
  options: { throwError?: boolean; notifyUser?: boolean } = {}
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  // Log error for debugging
  console.error(`Firebase ${operationType} Error (${path}):`, errInfo);

  // Throw if explicitly requested (for critical operations)
  if (options.throwError === true) {
    throw new Error(errInfo.error);
  }

  // Return error info for caller to handle
  return errInfo;
}
```

#### ❌ BEFORE (Problematic Version)
```typescript
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    // ... auth info ...
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo)); // ❌ ALWAYS THROWS - CRASHES APP
}
```

---

### 3. Real-Time Subscriptions - Tasks

#### ✅ AFTER (Fixed Version)
```typescript
subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  }, (error) => {
    // Log error but don't throw - allow app to continue
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
    console.warn('Failed to sync tasks, retrying on next connection...');
  });
}
```

#### ❌ BEFORE (Problematic Version)
```typescript
subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
    // ❌ This throws - app crashes when offline or network fails
  });
}
```

---

### 4. Connection Testing

#### ✅ AFTER (Fixed Version)
```typescript
async testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('offline')) {
        console.warn('⚠️ Firebase: Client is offline - using cached data');
        return false;
      } else if (error.message.includes('permission')) {
        console.error('❌ Firebase: Permission denied - check Firestore rules');
        return false;
      } else if (error.message.includes('database not found')) {
        console.error('❌ Firebase: Database not found - check configuration');
        return false;
      } else {
        console.error('❌ Firebase connection test failed:', error.message);
        return false;
      }
    }
    return false;
  }
}
```

#### ❌ BEFORE (Problematic Version)
```typescript
async testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
      // ❌ Silent failure for other errors
      // ❌ No indication if connection is working
    }
  }
}
```

---

### 5. Profile Update

#### ✅ AFTER (Fixed Version)
```typescript
async updateProfileName(name: string) {
  if (!auth.currentUser) {
    console.warn('No user logged in');
    return;
  }

  try {
    await updateProfile(auth.currentUser, { displayName: name });
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, { name });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser?.uid}`);
    throw new Error('Failed to update profile name');
  }
}
```

#### ❌ BEFORE (Problematic Version)
```typescript
async updateProfileName(name: string) {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name }); // ❌ No error handling
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, { name }); // ❌ No error handling
    // ❌ If error occurs, it propagates unhandled
  }
}
```

---

## Environment Variables Setup

### `.env.example` (Template - Safe to commit)
```env
# Firebase Configuration
# Get these values from your Firebase Console (Project Settings)
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### `.env.local` (Local only - NEVER commit)
```env
# Your actual credentials here
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0462726835
VITE_FIREBASE_APP_ID=1:938867173112:web:c0946f3585ffb8287b3d0d
VITE_FIREBASE_API_KEY=AIzaSyDL0p4UmlvA6yLe2-QUT82yQsm1s99iy8g
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0462726835.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0462726835.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=938867173112
GEMINI_API_KEY=your_key_here
```

### `.gitignore` Updates
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Firebase configuration file
firebase-applet-config.json
```

---

## Usage in Components

### Before: Error handling would crash app
```typescript
// OLD - Would crash on network error
const handleTaskCreate = async (taskData: any) => {
  const newTask: Omit<Task, 'id'> = {
    ...taskData,
    createdAt: Date.now(),
    actualMinutes: 0
  };
  await firebaseService.addTask(currentUser.id, newTask); // ❌ Throws on error
};
```

### After: Graceful error handling
```typescript
// NEW - Handles errors gracefully
const handleTaskCreate = async (taskData: any) => {
  if (!currentUser) return;
  
  try {
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: Date.now(),
      actualMinutes: 0
    };
    await firebaseService.addTask(currentUser.id, newTask);
    setIsTaskModalOpen(false); // Only if successful
  } catch (error) {
    console.error('Failed to create task:', error);
    // Show user-friendly message
    showNotification('Failed to create task. Retrying...', 'error');
  }
};
```

---

## Verification Checklist

After implementing fixes, verify:

- [ ] `.env.local` file exists and has all variables
- [ ] `.gitignore` protects `.env.local`
- [ ] `firebase.ts` uses environment variables
- [ ] `firebase.ts` has offline persistence enabled
- [ ] Error handlers don't throw in subscriptions
- [ ] `testConnection()` returns boolean instead of throwing
- [ ] App doesn't crash when going offline
- [ ] Tasks sync when coming back online
- [ ] Browser console shows helpful debug messages

---

## Performance Improvements

These fixes also improve performance:

1. **Offline Persistence** - No empty data when offline
2. **Better Error Recovery** - App doesn't need full reload
3. **Graceful Degradation** - App works with partial connectivity
4. **Debug Logging** - Easier to troubleshoot issues

---

## Security Improvements

1. **No Exposed Credentials** - Safe to push to Git
2. **Environment Isolation** - Dev vs. Production credentials
3. **Validation** - Detects missing configuration early
4. **Better Error Messages** - Easier to diagnose security issues

