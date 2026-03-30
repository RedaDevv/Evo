# 🔧 Fix: Firebase Firestore Database Not Found

## ❌ Problem
```
Database '(default)' not found. Please check your project configuration.
```

## ✅ Solution - Create Firestore Database

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com

### Step 2: Select Your Project
Click: **gen-lang-client-0462726835**

### Step 3: Create Firestore Database
1. Left sidebar → **Firestore Database** (or **Cloud Firestore**)
2. Click **+ Create database**
3. **Location:** Choose closest to you (e.g., `us-central1` or `europe-west1`)
4. **Security rules:** Choose **Start in test mode** (for development)
5. Click **Create**

### Step 4: Set Security Rules (Optional but Recommended)
Once database is created, go to **Rules** tab and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Allow subcollections (tasks, unavailabilities)
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 5: Publish Rules
Click **Publish**

### Step 6: Refresh Your App
- Go back to http://localhost:3001
- Refresh page (Cmd+R or Ctrl+R)
- Login again

---

## 🎯 What This Does

| Step | Purpose |
|------|---------|
| Create database | Enables Firestore for your project |
| Test mode | Allows development without complex security |
| Security rules | Protects data in production |
| Users collection | Stores user profiles & settings |
| Subcollections | Stores tasks & unavailabilities per user |

---

## ⚠️ Important: Test Mode Only for Development!

**Test mode allows ANYONE to read/write your database.**

Before going to production:
1. Update security rules (see template above)
2. Use authentication (you already have this)
3. Test thoroughly

---

## 🚀 After Setup Complete

The app will:
- ✅ Create `users/{uid}` documents when users register
- ✅ Store tasks in `users/{uid}/tasks`
- ✅ Store unavailabilities in `users/{uid}/unavailabilities`
- ✅ Sync data in real-time
- ✅ Work offline with IndexedDB persistence

---

## 📍 Alternative: Use Firestore Emulator (Advanced)

If you want to test completely offline:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then update `.env.local`:
```
VITE_USE_EMULATOR=true
```

And modify `firebase.ts`:
```typescript
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## ✅ Verification

After creating the database, you should see:
- ✅ No more "Database '(default)' not found" warnings
- ✅ App loads without spinning
- ✅ Tasks save to Firestore
- ✅ Data persists after refresh
