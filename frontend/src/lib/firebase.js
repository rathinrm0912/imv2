import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUIbaz0U4nYl5b6mRrB3Iitd3MhfunEfA",
  authDomain: "im-b169f.firebaseapp.com",
  projectId: "im-b169f",
  storageBucket: "im-b169f.firebasestorage.app",
  messagingSenderId: "674696535188",
  appId: "1:674696535188:web:135799dea0cd25f5bee881",
  measurementId: "G-EHNHB5ZW5V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
