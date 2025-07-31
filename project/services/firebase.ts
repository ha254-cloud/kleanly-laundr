// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, connectAuthEmulator, getReactNativePersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3EG_vMbeMeuf8mdMhOtu-3ePqff6polo",
  authDomain: "kleanly-67b7b.firebaseapp.com",
  projectId: "kleanly-67b7b",
  storageBucket: "kleanly-67b7b.appspot.com", // fixed .app to .appspot.com
  messagingSenderId: "474784025290",
  appId: "1:474784025290:web:92b6bbfa7b85c52f040233",
  measurementId: "G-GR5WPXRPY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code !== 'auth/already-initialized') {
    console.error('Firebase Auth initialization error:', error);
  }
  // Fallback to basic auth initialization
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development
if (__DEV__ || process.env.NODE_ENV === 'development') {
  try {
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    // @ts-ignore: Firestore does not expose a public property for emulator config
    if (!(db as any)._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    console.log('Emulator connection already established or failed:', error);
  }
}

// Analytics (web only)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not initialized:', error);
  }
}

export { auth, analytics };
export default app;