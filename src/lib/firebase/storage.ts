// lib/firebase/storage.ts
import { storage } from '@/firebase'; // Adjust the import path as necessary
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadProfileImage = async (file: File, uid: string) => {
  const storageRef = ref(storage, `profileImages/${uid}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
