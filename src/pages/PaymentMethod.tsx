import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Wallet, Banknote, ArrowLeft } from 'lucide-react';
import { saveOrder } from '@/lib/firebase/orders';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, totalPrice, totalItems, items } = useCart();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryAddress = location.state?.deliveryAddress;
  const deliveryFee = 3.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + deliveryFee + tax;

  const paymentMethods = [
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pago rápido y seguro',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, American Express',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 'cash',
      name: 'Efectivo en el Local',
      icon: <Banknote className="w-6 h-6" />,
      description: 'Paga cuando retires tu pedido',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Por favor selecciona un método de pago');
      return;
    }

    if (!deliveryAddress) {
      toast.error('Dirección de entrega no seleccionada');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula procesamiento

if (!user?.uid) {
  toast.error('Usuario no autenticado. Por favor iniciá sesión.');
  setIsProcessing(false);
  return;
}

const userId = user.uid;



   const status: 'pending' = 'pending';



   const order = {
  userId,
  date: new Date(),
  status,
  deliveryId: 'unassigned', // 👈🏼 Este es el que faltaba
  total: finalTotal,
  items: items.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  })),
  restaurant: 'Mi Restaurante',
  estimatedTime: '20-30 min',
  deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}`,
  paymentMethod: selectedMethod
};


      await saveOrder(order);

      toast.success('¡Pedido realizado exitosamente!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!deliveryAddress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-gray-600 mb-8">No se encontró la dirección de entrega</p>
            <Button onClick={() => navigate('/cart')}>Volver al Carrito</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Método de Pago</h1>
            <p className="text-gray-600">¿Cómo querés pagar?</p>
          </div>
        </div>

        {/* Resumen del pedido */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{totalItems} productos</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Entregar en:</strong> {deliveryAddress.name}
              </p>
              <p className="text-sm text-gray-600">
                {deliveryAddress.street}, {deliveryAddress.city}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de pago */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6">Selecciona tu método de pago</h3>

            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <Label
                      htmlFor={method.id}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-orange-200 hover:bg-orange-50 data-[checked]:border-orange-500 data-[checked]:bg-orange-50"
                      data-checked={selectedMethod === method.id}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />

                      <div className={`p-3 rounded-lg text-white ${method.color}`}>
                        {method.icon}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold">{method.name}</h4>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Confirmar */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full btn-primary py-4 text-lg font-semibold"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </div>
            ) : (
              `Confirmar Pago - $${finalTotal.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Al confirmar el pago, aceptás nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
