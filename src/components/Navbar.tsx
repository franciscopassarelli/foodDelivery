import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShoppingCart,
  Bell,
  Menu,
  Package,
  MessageSquare
} from 'lucide-react';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<null | 'notifications' | 'profile'>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const isCustomer = user?.role === 'customer';

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pedido confirmado';
      case 'preparing':
        return 'Preparando';
      case 'on-way':
        return 'En camino';
      default:
        return 'Actualización de pedido';
    }
  };

  const removeNotification = (indexToRemove: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  
  const isActive = (path: string) => location.pathname === path;

  React.useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const q = query(
      collection(db, 'supportMessages'),
      where('userId', '==', user.id)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0]?.data();
      const supportMessages = doc?.messages || [];

      const unread = supportMessages
        .filter((msg: any) => msg.sender === 'admin' && !msg.read)
        .map((msg: any) => ({
          type: 'message',
          text: msg.text,
          timestamp: msg.timestamp,
        }));

      setNotifications((prev) => {
        const others = prev.filter((n) => n.type !== 'message');
        return [...others, ...unread];
      });
    });

    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('userId', '==', user.id));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const activeOrders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order: any) =>
          ['pending', 'preparing', 'on-way'].includes(order.status)
        )
        .map((order: any) => ({
          type: 'order',
          status: order.status,
          id: order.id,
          restaurant: order.restaurant,
          timestamp: order.date,
        }));

      setNotifications((prev) => {
        const others = prev.filter((n) => n.type !== 'order');
        return [...others, ...activeOrders];
      });
    });

    return () => {
      unsubscribeMessages();
      unsubscribeOrders();
    };
  }, [isAuthenticated, user]);

  return (
    <nav className="bg-white shadow-lg border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">FD</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              FoodDelivery
            </span>
          </Link>

        <div className="hidden md:flex items-center space-x-6">
  {/* SOLO CUSTOMER ve menú */}
  {isCustomer && (
    <Link
      to="/menu"
      className={`btn-sm ${isActive('/menu') ? 'btn-primary' : 'text-gray-700 hover:text-orange-500'}`}
    >
      Menú
    </Link>
  )}

  {isAuthenticated && (
    <>
      {/* SOLO CUSTOMER ve pedidos */}
      {isCustomer && (
        <Link
          to="/orders"
          className={`btn-sm flex items-center gap-1 ${isActive('/orders') ? 'btn-primary' : 'text-gray-700 hover:text-orange-500'}`}
        >
          <Package size={16} />
          Pedidos
        </Link>
      )}

      {/* ESTE sí lo podés dejar para todos */}
      <Link
        to="/support"
        className={`btn-sm flex items-center gap-1 ${isActive('/support') ? 'btn-primary' : 'text-gray-700 hover:text-orange-500'}`}
      >
        <MessageSquare size={16} />
        Soporte
      </Link>
    </>
  )}
</div>

          {/* Right Buttons */}
          <div className="flex items-center space-x-4 relative">
            
            {/* Notificaciones */}
            {isAuthenticated && (
              <div className="relative hidden md:inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 relative"
                  onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>

                {activeDropdown === 'notifications' && (
                  <div className="absolute right-0 top-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-2">Mensajes recientes</h4>
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm">No tenés notificaciones o mensajes.</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.map((notif, index) => (
                            <div key={index} className="border-b pb-2 mb-2 text-sm">
                              {notif.type === 'message' ? (
                                <p className="font-semibold text-gray-800">Soporte: {notif.text}</p>
                              ) : (
                                <>
                                  <p className="text-gray-700">
                                    Pedido #{notif.id.slice(-6)}: {getOrderStatusText(notif.status)}
                                  </p>
                                  <p className="text-xs text-gray-500">{notif.restaurant}</p>
                                </>
                              )}
                              <button
                                onClick={() => removeNotification(index)}
                                className="text-red-500 text-xs mt-1 hover:underline"
                              >
                                Eliminar notificación
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        to="/support"
                        onClick={() => setActiveDropdown(null)}
                        className="mt-3 block text-orange-600 hover:underline text-sm"
                      >
                        Ir a soporte
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Carrito */}
            {isCustomer && (
  <Link to="/cart" className="hidden md:inline-flex">
    <Button variant="ghost" size="sm" className="p-2 relative">
      <ShoppingCart size={18} />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1">
          {totalItems}
        </Badge>
      )}
    </Button>
  </Link>
)}

{user?.role === 'delivery' && (
  <Link
    to="/delivery"
    className={`btn-sm ${isActive('/delivery') ? 'btn-primary' : 'text-gray-700 hover:text-orange-500'}`}
  >
    🛵 Delivery
  </Link>
)}

            {/* Perfil */}
            <div className="relative hidden md:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              >
                <User size={18} />
              </Button>

              {activeDropdown === 'profile' && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                  <div className="p-3 space-y-2 text-sm">
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" onClick={() => setActiveDropdown(null)} className="block hover:text-orange-500">Mi perfil</Link>
                        <button onClick={handleLogout} className="block w-full text-left hover:text-red-500">Salir</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setActiveDropdown(null)} className="block hover:text-orange-500">Ingresar</Link>
                        <Link to="/register" onClick={() => setActiveDropdown(null)} className="block hover:text-orange-500">Registrarse</Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>

        {/* Menú mobile */}
       {/* Menú mobile */}
{isMenuOpen && (
  <div className="md:hidden mt-2 space-y-2 border-t border-orange-200 pt-4 pb-4">
    
    {/* SOLO CUSTOMER */}
    {isCustomer && (
      <Link
        to="/menu"
        className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
        onClick={() => setIsMenuOpen(false)}
      >
        Menú
      </Link>
    )}

    {isCustomer && (
      <Link
        to="/cart"
        className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
        onClick={() => setIsMenuOpen(false)}
      >
        <span>Carrito</span>
        {totalItems > 0 && (
          <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
            {totalItems}
          </Badge>
        )}
      </Link>
    )}

    {isAuthenticated ? (
      <>
        {/* SOLO CUSTOMER */}
        {isCustomer && (
          <Link
            to="/orders"
            className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            Pedidos
          </Link>
        )}

        {/* TODOS */}
        <Link
          to="/support"
          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          Soporte
        </Link>

        <Link
          to="/profile"
          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          Mi perfil
        </Link>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
        >
          Salir
        </button>
      </>
    ) : (
      <>
        <Link
          to="/login"
          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          Ingresar
        </Link>
        <Link
          to="/register"
          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          Registrarse
        </Link>
      </>
    )}
  </div>
)}
      </div>
    </nav>
  );
};

export default Navbar;
