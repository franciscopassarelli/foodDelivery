import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Star, Truck } from 'lucide-react';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Index = () => {
  const { isAuthenticated } = useAuth();

const featuredCategories = [
  { name: 'Pizza', image: '/pizzas3.jpg', items: 5 },
  { name: 'Hamburguesas', image: '/burg.webp', items: 8 },
  { name: 'Sushi', image: '/sushi4.jpg', items: 6 },
  { name: 'Tacos', image: '/tacos1.jpg', items: 5 },
  { name: 'Postres', image: '/helados1.jpg', items: 7 },
  { name: 'Bebidas', image: '/bebidas3.jpg', items: 10 }
];

  

  const featuredRestaurants = [
    {
      id: 1,
      name: 'Pizza Palace',
      image: '/pizzas3.jpg',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: '$2.99',
      category: 'Pizza, Italiana'
    },
    {
      id: 2,
      name: 'Burger House',
      image: '/burguer1.jpg',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: '$1.99',
      category: 'Hamburguesas, Rápida'
    },
    {
      id: 3,
      name: 'Sushi Master',
      image: '/sushi4.jpg',
      rating: 4.9,
      deliveryTime: '30-45 min',
      deliveryFee: '$3.99',
      category: 'Sushi, Japonesa'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/hamb.jpg')",
          backgroundAttachment: 'fixed' // parallax sutil
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_0_2px_black]">
              ¡Tu comida favorita,<br />a solo un click!
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Descubre la variedad y disfruta la mejor comida en casa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/menu">
                <Button className="btn-accent text-lg px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Ver Menú
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                 <Button
  variant="outline"
  className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
>
  Registrarse Gratis
</Button>

                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="text-orange-500" size={32} />,
                title: 'Entrega Rápida',
                desc: 'Recibe tu comida en 30 minutos o menos',
                bg: 'bg-orange-100'
              },
              {
                icon: <MapPin className="text-green-500" size={32} />,
                title: 'Seguimiento en Vivo',
                desc: 'Rastrea tu pedido en tiempo real',
                bg: 'bg-green-100'
              },
              {
                icon: <Star className="text-blue-500" size={32} />,
                title: 'Calidad Garantizada',
                desc: 'Solo los mejores restaurantes',
                bg: 'bg-blue-100'
              }
            ].map(({ icon, title, desc, bg }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className={`${bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

  {/* Categories Carousel - Swiper */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-12">Explora por Categorías</h2>
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={16}
      slidesPerView={'auto'}
      grabCursor={true}
      navigation={true}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 5 }
      }}
      className="px-2"
    >
      {featuredCategories.map((cat, index) => (
        <SwiperSlide key={index} style={{ width: '160px' }}>
          <Link to="/menu">
            <Card className="rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <div
                className="h-32 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${cat.image})`
                }}
              >
                <div className="w-full h-full bg-black/30 flex items-center justify-center">
                  <h3 className="text-white text-lg font-bold text-center px-2 drop-shadow-md">
                    {cat.name}
                  </h3>
                </div>
              </div>
              <CardContent className="text-center py-3">
                <Badge className="bg-orange-100 text-orange-700">{cat.items} Variedades</Badge>
              </CardContent>
            </Card>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</section>

 {/* Featured Restaurants */}
<div className="py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12">Destacados del día</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredRestaurants.map((restaurant, index) => (
        <motion.div
          key={restaurant.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <Link to="/menu">
            <Card className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              {/* Imagen */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-yellow-500 px-2 py-1 text-xs font-semibold rounded shadow-sm flex items-center gap-1">
                  <Star size={14} className="fill-current" />
                  {restaurant.rating}
                </div>
              </div>

              {/* Contenido */}
              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">{restaurant.category}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {restaurant.deliveryTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck size={14} />
                    {restaurant.deliveryFee}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
</div>

      {/* CTA Section con imagen y efecto parallax */}
      <div
        className="py-16 text-white"
        style={{
          backgroundImage: "url('/hamb.jpg')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          position: 'relative'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div> {/* overlay para legibilidad */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            ¿Listo para tu primera orden?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl mb-8 opacity-90"
          >
            Únete a miles de usuarios que ya disfrutan de la mejor comida
          </motion.p>
          <Link to="/menu">
            <Button className="btn-accent text-lg px-12 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Ordenar Ahora
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      {/* Footer */}
<footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
      
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">FD</span>
          </div>
          <span className="text-2xl font-bold text-white">FoodDelivery</span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          La mejor comida, entregada rápido y seguro.<br />
          Directo a tu puerta.
        </p>
      </div>

      {/* Enlaces */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Explora</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><Link to="/menu" className="hover:text-white transition">Menú</Link></li>
          <li><Link to="/support" className="hover:text-white transition">Soporte</Link></li>
          <li><Link to="/orders" className="hover:text-white transition">Mis Pedidos</Link></li>
          <li><Link to="/profile" className="hover:text-white transition">Mi Perfil</Link></li>
        </ul>
      </div>

      {/* Empresa */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Empresa</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><a href="#" className="hover:text-white transition">Sobre Nosotros</a></li>
          <li><a href="#" className="hover:text-white transition">Términos y Condiciones</a></li>
          <li><a href="#" className="hover:text-white transition">Política de Privacidad</a></li>
        </ul>
      </div>

      {/* Contacto */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Contacto</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><span>📧 hello@fooddelivery.com</span></li>
          <li><span>📞 +1 (555) 123-4567</span></li>
          <li><span>📍 Buenos Aires, Argentina</span></li>
        </ul>
      </div>
    </div>

    <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
      &copy; 2024 FoodDelivery. Todos los derechos reservados.
    </div>
  </div>
</footer>

    </div>
  );
};

export default Index;
