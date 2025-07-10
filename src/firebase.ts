// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDsS_AMlypdHcoultQ8HbDMK5PBQtuBheo",
  authDomain: "queprecio.firebaseapp.com",
  projectId: "queprecio",
  storageBucket: "queprecio.appspot.com",
  messagingSenderId: "144456283402",
  appId: "1:144456283402:web:03caceb4725e29503fb6f3"
};

// 🛠️ Esta línea evita que se inicialice más de una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
