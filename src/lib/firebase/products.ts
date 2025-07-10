import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Colección "products"
const productsRef = collection(db, "products");

// Agregar producto
export const addProduct = async (product: any) => {
  const docRef = await addDoc(productsRef, product);
  return docRef.id;
};

// Obtener todos los productos
export const getProducts = async () => {
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? '',
      description: data.description ?? '',
      price: data.price ?? 0,
      stock: data.stock ?? 0,
      category: data.category ?? '',
      image: data.image ?? '',
      rating: data.rating ?? null,
      prepTime: data.prepTime ?? '',
      popular: data.popular ?? false,
      active: data.active ?? true,
    };
  });
};

// Editar producto
export const updateProduct = async (id: string, updatedData: any) => {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, updatedData);
};

// Borrar producto
export const deleteProduct = async (id: string) => {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
};
