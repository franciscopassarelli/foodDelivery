// src/lib/firebase/useDeliveryOrders.ts

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase';

// Interfaz del pedido para el repartidor
export interface DeliveryOrder {
  id: string;
  customer: string;
  customerPhone: string;
  deliveryAddress: string; // ✅ Agregado
  address: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  estimatedTime: string;
  distance: string;
  status: 'pending' | 'preparing' | 'on-way' | 'picked-up' | 'delivered';
  deliveryId?: string;
}

// Hook personalizado que escucha en tiempo real los pedidos
export const useDeliveryOrders = (userId: string | undefined) => {
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Consulta de pedidos disponibles que todavía no fueron tomados
    const qAvailable = query(
      collection(db, 'orders'),
      where('status', '==', 'preparing'),
      where('deliveryId', '==', 'unassigned')
    );

    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as DeliveryOrder[];
      setAvailableOrders(orders);
    });

    // Consulta de pedidos asignados a este repartidor en curso
    const qMyOrders = query(
      collection(db, 'orders'),
      where('deliveryId', '==', userId),
      where('status', 'in', ['on-way', 'picked-up'])
    );

    const unsubMyOrders = onSnapshot(qMyOrders, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as DeliveryOrder[];
      setMyOrders(orders);
    });

    // Limpiar listeners en desmontaje
    return () => {
      unsubAvailable();
      unsubMyOrders();
    };
  }, [userId]);

  return { availableOrders, myOrders };
};
