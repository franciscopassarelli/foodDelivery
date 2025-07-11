import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck, Package, MapPin, Phone } from 'lucide-react';
import { listenToOrderById } from '@/lib/firebase/orders';

const statusStepMap = {
  pending: 1,
  preparing: 2,
  'on-way': 3,
  'picked-up': 4,
  delivered: 5,
};


const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = listenToOrderById(id, (data) => {
      setOrder(data);
      setCurrentStep(statusStepMap[data.status]);
    });
    return () => unsubscribe();
  }, [id]);

  if (!order) return <p className="text-center mt-10">Cargando pedido...</p>;

 const steps = [
  {
    id: 1,
    title: 'Pedido Confirmado',
    description: 'Tu pedido ha sido recibido',
    icon: CheckCircle,
    time: '14:30',
  },
  {
    id: 2,
    title: 'Preparando',
    description: 'El restaurante está preparando tu comida',
    icon: Clock,
    time: '14:35',
  },
  {
    id: 3,
    title: 'En camino',
    description: 'El repartidor va hacia el restaurante',
    icon: Truck,
    time: currentStep >= 3 ? order.estimatedTime : null,
  },
  {
    id: 4,
    title: 'Recogido por el repartidor',
    description: 'El repartidor ya tiene tu pedido y va hacia tu dirección',
    icon: Package,
    time: currentStep >= 4 ? order.estimatedTime : null,
  },
  {
    id: 5,
    title: 'Entregado',
    description: 'Tu pedido ha sido entregado',
    icon: Package,
    time: currentStep >= 5 ? order.deliveredTime : null,
  },
];


  const deliveryPerson = {
    name: 'Carlos Rodríguez',
    phone: '+1 (555) 123-4567',
    rating: 4.9,
    vehicle: 'Moto Honda - ABC123',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Seguimiento del Pedido</h1>
              <p className="text-gray-600">Pedido #{order.id.slice(-6)} • {order.restaurant}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                Tiempo estimado: {order.estimatedTime}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Estado del Pedido</h3>
                <div className="space-y-6">
                  {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' :
                          isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                        } text-white`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className={`font-semibold ${
                              isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.title}
                            </h4>
                            {step.time && (
                              <span className="text-sm text-gray-500">{step.time}</span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {currentStep >= 3 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Tu Repartidor</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">CR</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{deliveryPerson.name}</h4>
                        <div className="text-sm text-gray-600">
                          ⭐ {deliveryPerson.rating} • {deliveryPerson.vehicle}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="btn-secondary flex items-center gap-2">
                      <Phone size={16} /> Llamar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Ubicación en Tiempo Real</h3>
                <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Mapa en tiempo real</p>
                    <p className="text-sm text-gray-500">Función disponible próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-green-600">${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detalles de Entrega</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                <p className="text-gray-600 mb-4">
                  Si tienes problemas con tu pedido, contáctanos y te ayudaremos.
                </p>
                <Button size="sm" className="btn-primary">Contactar Soporte</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
