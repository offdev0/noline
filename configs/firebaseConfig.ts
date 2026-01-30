import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration extracted from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAL6pEBxX1BzVeDugIeHtyqzkeVNoNBloU",
  authDomain: "noline-eef1a.firebaseapp.com",
  projectId: "noline-eef1a",
  storageBucket: "noline-eef1a.firebasestorage.app",
  messagingSenderId: "83234148402",
  appId: "1:83234148402:android:1afb8eaa027069f7c06c2b"
};

// Initialize Firebase - check if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence for React Native
// Use getAuth if auth is already initialized, otherwise use initializeAuth
let auth: ReturnType<typeof getAuth>;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  // If auth is already initialized, getAuth will return the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    // For other errors, try getAuth as fallback
    auth = getAuth(app);
  }
}

export { auth };
