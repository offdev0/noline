import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
