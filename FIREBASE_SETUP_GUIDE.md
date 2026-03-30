# Firebase Setup & Configuration Guide

## 🔐 Security First: Environment Variables

### Step 1: Create Environment Files

Your Firebase credentials should **NEVER** be committed to Git. Instead, use environment variables.

#### 1a. Copy `.env.example` to `.env.local`
```bash
cp .env.example .env.local
```

#### 1b. Update `.env.local` with your Firebase credentials

`.env.local` (This file is in .gitignore and safe):
```env
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0462726835
VITE_FIREBASE_APP_ID=1:938867173112:web:c0946f3585ffb8287b3d0d
VITE_FIREBASE_API_KEY=AIzaSyDL0p4UmlvA6yLe2-QUT82yQsm1s99iy8g
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0462726835.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0462726835.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=938867173112
GEMINI_API_KEY=your_gemini_api_key
```

### Step 2: Verify `.gitignore`

Your `.gitignore` now includes:
```gitignore
.env
.env.local
.env.*.local
firebase-applet-config.json
```

✅ This ensures credentials are never pushed to Git.

---

## 🔧 What Was Fixed

### 1. **Firebase Initialization** (`firebase.ts`)
- ✅ Removed hardcoded JSON import
- ✅ Added environment variable support
- ✅ Added configuration validation
- ✅ Enabled offline persistence (IndexedDB)
- ✅ Fixed invalid database ID usage

**Before:**
```typescript
import firebaseConfig from './firebase-applet-config.json';
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
```

**After:**
```typescript
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
export const db = getFirestore(app); // Uses default database
enableIndexedDbPersistence(db); // Offline support
```

### 2. **Error Handling** (`services/firebaseService.ts`)
- ✅ Errors no longer crash the app
- ✅ Graceful fallback for network issues
- ✅ Better error messages and logging
- ✅ Consistent error handling patterns

**Before:**
```typescript
function handleFirestoreError(error, operationType, path) {
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo)); // ❌ CRASHES APP
}
```

**After:**
```typescript
function handleFirestoreError(error, operationType, path, options = {}) {
  console.error(`Firebase ${operationType} Error (${path}):`, errInfo);
  // Doesn't throw by default - returns error info
  if (options.throwError === true) {
    throw new Error(errInfo.error);
  }
  return errInfo;
}
```

### 3. **Real-Time Subscriptions**
- ✅ Error handlers no longer crash the app
- ✅ Better user feedback with retry messages

**Example - Tasks subscription:**
```typescript
subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
  return onSnapshot(q, (snapshot) => {
    callback(tasks);
  }, (error) => {
    // Log error but DON'T throw
    handleFirestoreError(error, OperationType.LIST, path);
    console.warn('Failed to sync tasks, retrying...');
  });
}
```

### 4. **Connection Testing**
- ✅ Enhanced diagnostics
- ✅ Better error messages
- ✅ Returns status instead of throwing

---

## 🚀 Next Steps

### Step 1: Install Dependencies (if not already done)
```bash
cd /Users/reda/Desktop/Evo-1
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Verify Configuration
Open browser console and look for:
```
✅ Firebase connection successful
✅ Firestore offline persistence enabled
```

### Step 4: Test Error Handling
Try going offline (DevTools Network → Offline) and:
- Create a new task
- Edit existing task
- Toggle theme
- App should handle gracefully with retry messages

---

## 📋 Firebase Security Rules

Your Firestore rules are already properly configured at `firestore.rules`. However, one improvement:

### Recommendation: Remove Hardcoded Email
**Current (firestore.rules, line 44-45):**
```plaintext
function isAdmin() {
  return isAuthenticated() &&
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
      (request.auth.token.email == "reda.elhajji.43@gmail.com" && ...));
}
```

**Better approach using Custom Claims:**
1. Go to Firebase Console → Authentication → Users
2. Set custom claim on admin user:
   ```json
   { "admin": true }
   ```

3. Update rules:
   ```plaintext
   function isAdmin() {
     return isAuthenticated() && request.auth.token.admin == true;
   }
   ```

---

## 🔍 Troubleshooting

### Issue: "Cannot find module 'firebase/app'"
**Solution:** Ensure `npm install` is complete
```bash
npm install
```

### Issue: Environment variables not loading
**Solution:** Restart dev server after creating `.env.local`
```bash
npm run dev
```

### Issue: "Permission denied" errors in console
**Solution:** Check Firestore rules match your user structure

### Issue: "Database not found" error
**Solution:** Verify `VITE_FIREBASE_PROJECT_ID` in `.env.local` is correct

### Issue: App data disappears when offline
**Solution:** Offline persistence should work automatically after fixes. Check browser storage (IndexedDB) in DevTools.

---

## 📚 File Changes Summary

| File | Changes | Status |
|------|---------|--------|
| `firebase.ts` | ✅ Use env vars, enable persistence, fix DB ID | Fixed |
| `services/firebaseService.ts` | ✅ Better error handling, no crashes | Fixed |
| `.gitignore` | ✅ Added env file protection | Fixed |
| `.env.example` | ✅ Created template | Created |
| `.env.local` | ✅ Created with your credentials | Created |
| `firebase-applet-config.json` | ⚠️ Still exists but ignored by git | Keep local only |

---

## ✅ Security Checklist

- [x] Credentials moved to `.env.local`
- [x] `.env.local` added to `.gitignore`
- [x] `firebase-applet-config.json` added to `.gitignore`
- [x] Environment variables validated at startup
- [x] No sensitive data in version control
- [x] Error handling won't crash app
- [x] Offline persistence enabled
- [ ] **TODO:** Remove old `firebase-applet-config.json` from git history (use `git filter-branch` or `bfg` if needed)

---

## 🎯 Production Deployment

When deploying to production:

1. **Set environment variables on your hosting platform:**
   - Firebase Hosting: Use `firebase.json` or env vars
   - Vercel: Project → Settings → Environment Variables
   - Netlify: Site → Build & Deploy → Environment
   - GitHub Pages: Use GitHub Secrets

2. **Example for Vercel:**
   ```bash
   vercel env add VITE_FIREBASE_PROJECT_ID gen-lang-client-0462726835
   vercel env add VITE_FIREBASE_API_KEY AIzaSy...
   # etc.
   ```

3. **Test production build:**
   ```bash
   npm run build
   npm run preview
   ```

