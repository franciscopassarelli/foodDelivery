import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { listenOrders, updateOrderStatus, OrderData } from '@/lib/firebase/orders';

import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, MapPin, User } from 'lucide-react';

const statusLabels = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  'on-way': 'En Camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
} as const;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  'on-way': 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    const unsubscribe = listenOrders(setOrders);
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderData['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Estado del pedido actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusBadge = (status: OrderData['status']) => (
    <Badge className={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600">Administra y actualiza el estado de los pedidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Preparando</p>
                <p className="text-xl font-bold">
                  {orders.filter(o => o.status === 'preparing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Camino</p>
                <p className="text-xl font-bold">
                  {orders.filter(o => o.status === 'on-way').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Entregados</p>
                <p className="text-xl font-bold">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido #</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.userId}</p>
                      {/* Podés mostrar otros datos como teléfono si tenés */}
                      <p className="text-xs text-gray-400">
                        {order.date instanceof Date 
                          ? order.date.toLocaleString() 
                          : order.date?.toDate?.().toLocaleString() || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48">
                    <p className="text-sm truncate">{order.deliveryAddress || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                   <Select 
  value={order.status} 
  onValueChange={(value) => handleStatusChange(order.id!, value as OrderData['status'])}
>

                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="preparing">Preparando</SelectItem>
                        <SelectItem value="on-way">En Camino</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
