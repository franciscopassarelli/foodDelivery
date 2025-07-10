import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  getDoc,
  onSnapshot,
  updateDoc,
  getDocs,
} from 'firebase/firestore';

export interface OrderData {
  id?: string;
  userId: string;
  date: Date | any;
  status: 'pending' | 'preparing' | 'on-way' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  restaurant: string;
  estimatedTime?: string;
  deliveredTime?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  deliveryId?: string; // ✅ AGREGADO
}


// Obtener un pedido por ID
export const getOrderById = async (orderId: string) => {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('El pedido no existe');
  }

  return {
    id: snap.id,
    ...snap.data()
  } as OrderData;
};

// Listener para pedidos de un usuario (para vista cliente)
export const listenToUserOrders = (
  userId: string,
  callback: (orders: OrderData[]) => void
) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderData[];
    callback(orders);
  }, (error) => {
    console.error('Error en snapshot listener:', error);
  });
};

// Listener para **todos** los pedidos (para vista admin)
export const listenOrders = (callback: (orders: OrderData[]) => void) => {
  const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderData[];
    callback(orders);
  });
};
export const saveOrder = async (order: OrderData) => {
  await addDoc(collection(db, 'orders'), {
    ...order,
    status: order.status || 'pending',
    deliveryId: 'unassigned', // <--- ESTA LÍNEA ES CLAVE
    date: Timestamp.fromDate(order.date instanceof Date ? order.date : new Date()),
  });
};



// Actualizar el estado de un pedido (y cualquier campo si querés)
export const updateOrderStatus = async (orderId: string, status: OrderData['status']) => {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { status });
};


export const listenToOrderById = (orderId: string, callback: (orderData: any) => void) => {
  const orderRef = doc(db, 'orders', orderId);

  return onSnapshot(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        date:
          data.date instanceof Date
            ? data.date.toISOString()
            : data.date?.toDate?.()
            ? data.date.toDate().toISOString()
            : '',
      });
    }
  });
};