# 🚀 Quick Fix: Firebase Unauthorized Domain Error

## ❌ Problem You're Seeing
```
Firebase: Error (auth/unauthorized-domain)
```

## ✅ Solution - 2 Minutes

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com

### Step 2: Select Your Project
Click: **gen-lang-client-0462726835**

### Step 3: Add Authorized Domains
1. Left sidebar → **Authentication**
2. Click **Settings** tab
3. Scroll to **Authorized domains**
4. Click **+ Add domain**
5. Type: `localhost` → Click Add
6. Click **+ Add domain** again
7. Type: `127.0.0.1` → Click Add

### Step 4: Refresh Your Browser
- Press: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows/Linux)
- Clear cache completely if needed

### Step 5: Try Login Again
- Click "Continuer avec Google"
- Should work now! ✨

---

## 📌 If It Still Doesn't Work

### Option A: Use Email/Password Instead
- Click "Ou continuer avec"
- Use email + password to register/login
- Email/password auth works without domain authorization

### Option B: Full Browser Cache Clear
1. Open DevTools (F12)
2. Right-click refresh button → **Empty cache and hard refresh**
3. Try login again

### Option C: Check Your Project ID
Run this in browser console:
```javascript
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
```
Should show: `gen-lang-client-0462726835`

If different, update `.env.local` in the project root

---

## 🔍 What I Fixed

1. **firebase.ts**: Added development mode detection and reCAPTCHA disabling for localhost
2. **firebaseService.ts**: Added better error handling with helpful instructions
3. **AuthScreen.tsx**: Improved error display to show full error messages

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:5173
```

The server should stay running. If you need to stop it: Press **Ctrl + C** in terminal

---

## 📍 Port Reference
- Dev server: **localhost:5173** (hot reload enabled)
- Preview: **localhost:4173** (production mode)
- Backend: (if you have one)

---

## 💡 Pro Tips

1. **Keep terminal open** - The dev server needs to run in the background
2. **Use Ctrl+C to stop** - Then `npm run dev` to restart
3. **Hot reload works** - Edit files and browser updates automatically
4. **Check console** - F12 → Console tab for any errors

Happy coding! 🎉
