import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { DeliveryOrder } from './useDeliveryOrders';

export const updateOrderStatus = async (
  orderId: string,
  status: DeliveryOrder['status'],
  extraFields?: Partial<DeliveryOrder>
) => {
  const ref = doc(db, 'orders', orderId);
  const update: Partial<DeliveryOrder> = { status };

  if (extraFields) {
    Object.assign(update, extraFields);
  }

  if (status === 'preparing') {
    update.deliveryId = 'unassigned';
  }

  await updateDoc(ref, update);
};