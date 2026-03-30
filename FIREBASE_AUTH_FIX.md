# Firebase: auth/unauthorized-domain Error - Fix Guide

## Problem
You're getting `Error (auth/unauthorized-domain)` when testing locally. This happens because Firebase doesn't recognize your localhost domain.

## Solution

### Option 1: Add localhost to Firebase Console (RECOMMENDED)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `gen-lang-client-0462726835`
3. Click **Authentication** in left sidebar
4. Go to **Settings** tab
5. Scroll to **Authorized domains**
6. Click **Add domain** and add:
   - `localhost`
   - `127.0.0.1`
   - `localhost:5173`
   - `localhost:3000`
   - `localhost:4173`

7. Save and refresh your browser

### Option 2: Disable reCAPTCHA verification for localhost (ALREADY APPLIED)

We've already added this to `firebase.ts`:
```typescript
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  auth.settings.appVerificationDisabledForTesting = true;
}
```

This allows testing without reCAPTCHA on localhost.

### Option 3: Use emulator (for advanced testing)

```bash
firebase emulators:start
```

## Testing Locally

After adding domains to Firebase Console:

```bash
cd /Users/reda/Desktop/Evo-1
npm run dev
```

Then open: http://localhost:5173

## Port Reference

- **Dev server (hot reload):** `npm run dev` → http://localhost:5173
- **Preview (production build):** `npm run preview` → http://localhost:4173

## Common Ports to Authorize

- `localhost:5173` (Vite dev default)
- `localhost:3000` (alternative dev port)
- `localhost:4173` (preview port)
- `localhost` (any port via wildcard)
- `127.0.0.1` (localhost IP)

## If Still Not Working

1. **Hard refresh browser:** `Cmd + Shift + R` (macOS) or `Ctrl + Shift + R` (Windows/Linux)
2. **Clear browser cache:** DevTools → Application → Clear site data
3. **Check Firebase project ID:** Verify `VITE_FIREBASE_PROJECT_ID` matches your Firebase project
4. **Verify API Key:** Make sure `VITE_FIREBASE_API_KEY` is valid
5. **Check browser console:** Look for any auth-related warnings

## Environment Variables Check

Your current Firebase config:
```
Project ID: gen-lang-client-0462726835
Auth Domain: gen-lang-client-0462726835.firebaseapp.com
API Key: AIzaSyDL0p4UmlvA6yLe2-QUT82yQsm1s99iy8g
```

All look correct. The domain just needs to be authorized in Firebase Console.
