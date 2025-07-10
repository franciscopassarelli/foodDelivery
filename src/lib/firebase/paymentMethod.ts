import { db } from '@/firebase'; // Asegurate que este archivo exporta correctamente tu instancia de Firestore
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

export type PaymentMethod = {
  id?: string; // Será asignado por Firestore
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

// Agregar método de pago
export const addPaymentMethod = async (userId: string, method: PaymentMethod) => {
  const ref = collection(db, 'users', userId, 'paymentMethods');
  const docRef = await addDoc(ref, method);
  return { ...method, id: docRef.id };
};

// Actualizar método de pago
export const updatePaymentMethod = async (
  userId: string,
  methodId: string,
  updatedData: Partial<PaymentMethod>
) => {
  const ref = doc(db, 'users', userId, 'paymentMethods', methodId);
  await updateDoc(ref, updatedData);
};

// Eliminar método de pago
export const deletePaymentMethod = async (userId: string, methodId: string) => {
  const ref = doc(db, 'users', userId, 'paymentMethods', methodId);
  await deleteDoc(ref);
};

// (Opcional) Obtener métodos de pago del usuario
export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const snapshot = await getDocs(collection(db, 'users', userId, 'paymentMethods'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PaymentMethod[];
};
