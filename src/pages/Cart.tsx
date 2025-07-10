
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AddressSelector from '@/components/AddressSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    user?.addresses?.find(addr => addr.isDefault)?.id || user?.addresses?.[0]?.id || null
  );

  const deliveryFee = 3.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + deliveryFee + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para realizar el pedido');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Por favor selecciona una dirección de entrega');
      return;
    }

    const selectedAddress = user?.addresses?.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Dirección de entrega no válida');
      return;
    }

    // Navegar a la página de método de pago
    navigate('/payment', { 
      state: { 
        deliveryAddress: selectedAddress,
        cartItems: items,
        total: finalTotal
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-8" />
            <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">
              Agrega algunos productos deliciosos para comenzar
            </p>
            <Link to="/menu">
              <Button className="btn-primary">
                Ver Menú
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tu Carrito</h1>
          <p className="text-gray-600">{totalItems} productos en tu carrito</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            {isAuthenticated && (
              <AddressSelector
                selectedAddressId={selectedAddressId}
                onAddressSelect={setSelectedAddressId}
              />
            )}

            {/* Cart Products */}
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                       <img 
  src={item.image || '/images/default-product.jpg'} 
  alt={item.name} 
  className="w-full h-full object-cover" 
/>

                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-green-800 font-bold">${item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeItem(item.id);
                          toast.success('Producto eliminado del carrito');
                        }}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Clear Cart */}
            <div className="flex justify-between items-center pt-4">
              <Link to="/menu">
                <Button variant="outline">
                  Agregar más productos
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  clearCart();
                  toast.success('Carrito vaciado');
                }}
                className="text-red-500 hover:text-red-700"
              >
                Vaciar carrito
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Resumen del Pedido</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
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
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-3"
                  disabled={!isAuthenticated || (!selectedAddressId && isAuthenticated)}
                >
                  Realizar Pedido
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    <Link to="/login" className="text-orange-600 hover:text-orange-700">
                      Inicia sesión
                    </Link>
                    {' '}para realizar tu pedido
                  </p>
                )}

                {isAuthenticated && !selectedAddressId && (
                  <p className="text-sm text-red-500 mt-4 text-center">
                    Selecciona una dirección de entrega
                  </p>
                )}

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Métodos de Pago</h4>
                  <div className="flex gap-2 flex-wrap">
                    <div className="bg-blue-100 px-3 py-1 rounded text-sm">💳 Visa</div>
                    <div className="bg-red-100 px-3 py-1 rounded text-sm">💳 Master</div>
                    <div className="bg-yellow-100 px-3 py-1 rounded text-sm">💰 PayPal</div>
                    <div className="bg-green-100 px-3 py-1 rounded text-sm">💵 Efectivo</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
