import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
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

if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  throw new Error(
    'Firebase configuration incomplete. Please set VITE_FIREBASE_* environment variables.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure auth persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase: Could not set persistence:', err.message);
});

// Allow localhost in development - CRITICAL FIX for unauthorized-domain error
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.');

if (isDevelopment) {
  // Disable reCAPTCHA for development
  (auth as any).settings.appVerificationDisabledForTesting = true;
  console.log('✓ Firebase: Development mode - reCAPTCHA disabled for localhost');
}

// Enable Firestore offline persistence (must be called before any reads/writes)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore: Multiple tabs open, persistence disabled in this tab');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore: Browser does not support offline persistence');
  } else {
    console.warn('Firestore: Offline persistence error:', err.message);
  }
});
