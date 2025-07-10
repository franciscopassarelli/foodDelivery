import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  MapPin, Clock, Phone, Navigation,
  Package, CheckCircle, DollarSign
} from 'lucide-react';
import { doc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

import { useDeliveryOrders, DeliveryOrder } from '@/lib/firebase/useDeliveryOrders';

const Delivery = () => {
  const { user } = useAuth();
  const [driverStatus, setDriverStatus] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { availableOrders, myOrders } = useDeliveryOrders(user?.uid);

  const handleAcceptOrder = async (order: DeliveryOrder) => {
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'orders', order.id);
        const snap = await tx.get(ref);
        const data = snap.data();

        if (!snap.exists() || data?.deliveryId !== 'unassigned') {
          throw new Error('El pedido ya fue tomado por otro repartidor');
        }

        tx.update(ref, {
          deliveryId: user!.uid,
          status: 'on-way',
        });
      });

      toast.success(`Pedido #${order.id.slice(-3)} asignado`);
    } catch (error: any) {
      toast.error(error.message || 'Error al aceptar el pedido');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: DeliveryOrder['status']) => {
    try {
      const ref = doc(db, 'orders', orderId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Pedido no encontrado');
        tx.update(ref, { status: newStatus });
      });

      toast.success(
        newStatus === 'picked-up' ? 'Pedido recogido' : 'Pedido entregado'
      );
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el estado');
    }
  };

  useEffect(() => {
    let watchId: number;

    if (driverStatus === 'online' && myOrders.length > 0) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          setLocation(coords);

          await setDoc(doc(db, 'deliveries', user!.uid), {
            orderId: myOrders[0].id,
            location: coords,
            updatedAt: new Date(),
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [driverStatus, myOrders, user]);

  if (user?.role !== 'delivery') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Esta página es solo para repartidores.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-way': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'on-way': return 'En camino';
      case 'picked-up': return 'Recogido';
      case 'delivered': return 'Entregado';
      default: return 'Desconocido';
    }
  };

  const todayStats = {
    deliveries: 8,
    earnings: 127.5,
    rating: 4.9,
    activeTime: '6h 30m',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Repartidor</h1>
            <p className="text-gray-600">¡Hola {user?.name}! Gestiona tus entregas</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge className={driverStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {driverStatus === 'online' ? '🟢 En línea' : '🔴 Fuera de línea'}
            </Badge>
            <Button onClick={() => setDriverStatus(driverStatus === 'online' ? 'offline' : 'online')}>
              {driverStatus === 'online' ? 'Desconectarse' : 'Conectarse'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6 text-center"><Package className="mx-auto mb-2" /><h3 className="text-2xl font-bold">{todayStats.deliveries}</h3><p>Entregas Hoy</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><DollarSign className="mx-auto mb-2" /><h3 className="text-2xl font-bold">${todayStats.earnings}</h3><p>Ganancias</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><div className="text-2xl mb-2">⭐</div><h3 className="text-2xl font-bold">{todayStats.rating}</h3><p>Calificación</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><Clock className="mx-auto mb-2" /><h3 className="text-2xl font-bold">{todayStats.activeTime}</h3><p>Tiempo Activo</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pedidos Disponibles */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} />Pedidos Disponibles</CardTitle></CardHeader>
            <CardContent>
              {driverStatus === 'offline' ? (
                <p className="text-center py-8 text-gray-500">Conéctate para ver pedidos</p>
              ) : availableOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay pedidos disponibles</p>
              ) : (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div><h4 className="font-semibold">Pedido #{order.id.slice(-3)}</h4><p className="text-sm text-gray-600">{order.customer}</p></div>
                        <div className="text-right"><p className="font-bold text-green-600">${order.total}</p><p className="text-sm text-gray-500">{order.distance}</p></div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <MapPin size={14} /><span>{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} /><span>{order.estimatedTime}</span>
                      </div>
                      <div className="text-sm mt-2 text-gray-700">
                        {order.items.map((item, i) => (
                          <span key={i}>{item.quantity}x {item.name}{i < order.items.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" onClick={() => handleAcceptOrder(order)}>Aceptar</Button>
                        <Button variant="outline"><Navigation size={16} />Ruta</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pedidos Activos */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} />Mis Pedidos Activos</CardTitle></CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No tienes pedidos activos</p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div><h4 className="font-semibold">Pedido #{order.id.slice(-3)}</h4><p className="text-sm text-gray-600">{order.customer}</p></div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                          <span className="font-bold text-green-600">${order.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <MapPin size={14} /><span>{order.address}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm"><Phone size={14} />Llamar</Button>
                        {order.status === 'on-way' && (
                          <Button onClick={() => handleUpdateStatus(order.id, 'picked-up')} size="sm">
                            Marcar Recogido
                          </Button>
                        )}
                        {order.status === 'picked-up' && (
                          <Button onClick={() => handleUpdateStatus(order.id, 'delivered')} size="sm">
                            <CheckCircle size={14} />Entregado
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
