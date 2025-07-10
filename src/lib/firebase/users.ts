// lib/firebase/users.ts

import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error);
  }
};
