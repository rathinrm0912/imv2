import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUIbaz0U4nYl5b6mRrB3Iitd3MhfunEfA",
  authDomain: "im-b169f.firebaseapp.com",
  projectId: "im-b169f",
  storageBucket: "im-b169f.firebasestorage.app",
  messagingSenderId: "674696535188",
  appId: "1:674696535188:web:135799dea0cd25f5bee881",
  measurementId: "G-EHNHB5ZW5V"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, db };
export default app;
