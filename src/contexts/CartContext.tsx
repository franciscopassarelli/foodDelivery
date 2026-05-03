import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: string[];
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // 🔑 key dinámica por usuario
  const getCartKey = () => {
    return user?.id ? `foodDeliveryCart_${user.id}` : 'foodDeliveryCart_guest';
  };

  // 📦 cargar carrito cuando cambia usuario
  useEffect(() => {
    const savedCart = localStorage.getItem(getCartKey());
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    } else {
      setItems([]);
    }
  }, [user]);

  // 💾 guardar carrito
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
  }, [items, user]);

  // 🚫 limpiar si no es customer
  useEffect(() => {
    if (user && user.role !== 'customer') {
      setItems([]);
    }
  }, [user]);

  // ➕ agregar producto (protegido por rol)
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    if (user?.role !== 'customer') {
      console.warn('Solo customers pueden agregar al carrito');
      return;
    }

    setItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id);

      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  // ❌ eliminar producto
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // 🔄 actualizar cantidad
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // 🧹 limpiar carrito
  const clearCart = () => {
    setItems([]);
  };

  // 📊 totales
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};