import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace these with your actual Firebase project credentials
// Get them from: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCEd56Tt0xwElsxwx4QWSFrA6_NGnyWIoM",
  authDomain: "promptmaster-c6bf5.firebaseapp.com",
  projectId: "promptmaster-c6bf5",
  storageBucket: "promptmaster-c6bf5.firebasestorage.app",
  messagingSenderId: "485803114279",
  appId: "1:485803114279:web:432fd4974c0c94f5257302",
  measurementId: "G-FG04MQGK1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
