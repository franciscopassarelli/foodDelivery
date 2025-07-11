import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package, Star } from 'lucide-react';
import { listenToUserOrders } from '@/lib/firebase/orders';

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'on-way' | 'picked-up' | 'delivered' | 'cancelled';
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
}

const Orders = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = listenToUserOrders(user.uid, (data) => {
      const formattedOrders = data.map((order: any) => ({
        ...order,
        date:
          order.date instanceof Date
            ? order.date.toISOString()
            : order.date?.toDate?.()
            ? order.date.toDate().toISOString()
            : typeof order.date === 'string'
            ? order.date
            : '',
      }));
      setOrders(formattedOrders);
      console.log('ORDERS FROM FIREBASE:', data);
    });

    return () => unsubscribe();
  }, [user]);

 const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'on-way':
      return 'bg-blue-100 text-blue-800';
    case 'picked-up':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Pedido Confirmado';
    case 'preparing':
      return 'Preparando';
    case 'on-way':
      return 'En camino';
    case 'picked-up':
      return 'Recogido por el repartidor';
    case 'delivered':
      return 'Entregado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};


  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') return ['pending', 'preparing', 'on-way'].includes(order.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(order.status);
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Rastrea tus pedidos actuales y pasados</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : ''}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'btn-primary' : ''}
            >
              Activos
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'btn-primary' : ''}
            >
              Completados
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">Pedido #{order.id.slice(-6)}</h3>
                      <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{order.restaurant}</span>
                      <span>•</span>
                      <span>{formatDate(order.date)}</span>
                    </div>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</div>
                    {order.status === 'on-way' && order.estimatedTime && (
                      <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                        <Clock size={14} />
                        {order.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Link to={`/order/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <MapPin size={16} />
                      Rastrear Pedido
                    </Button>
                  </Link>

                  {order.status === 'delivered' && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Star size={16} />
                      Calificar
                    </Button>
                  )}

                  <Button variant="outline" className="flex items-center gap-2">
                    <Package size={16} />
                    Repetir Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay pedidos</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Aún no has realizado ningún pedido'
                : `No tienes pedidos ${filter === 'active' ? 'activos' : 'completados'}`}
            </p>
            <Link to="/menu">
              <Button className="btn-primary">Hacer mi primer pedido</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
