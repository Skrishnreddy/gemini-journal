import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForGeminiJournalLocalDev123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gemini-journal-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "opsshield-ai-prod-20260715",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gemini-journal-dev.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109283746501",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109283746501:web:a1b2c3d4e5f60718293a4b"
};

let app = null;
let auth = null;
let firestore = null;
let googleProvider = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  firestore = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.warn('[Firebase Client] Initialization warning (running in hybrid/demo fallback mode):', err.message);
}

export {
  app,
  auth,
  firestore,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};
