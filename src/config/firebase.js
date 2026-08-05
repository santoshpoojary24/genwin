import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Real user Firebase project configuration with Realtime Database URL & Analytics App ID
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDf4sWvUUvpyPoD6zmQMa15Py2-aI5IclU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "genwin-store-app.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://genwin-store-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "genwin-store-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "genwin-store-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "491609952680",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:491609952680:web:ee95999258959ce06b4d9d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export default app;
