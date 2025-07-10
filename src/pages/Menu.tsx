import React, { useEffect, useState } from 'react';
import { getProducts } from '@/lib/firebase/products';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Plus, Star, Clock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  rating?: number;
  prepTime?: string;
  popular?: boolean;
}

const categories = [
  { id: 'all', name: 'Todo' },
  { id: 'Pizza', name: 'Pizza' },
  { id: 'Hamburguesas', name: 'Hamburguesas' },
  { id: 'Sushi', name: 'Sushi' },
  { id: 'Tacos', name: 'Tacos' },
  { id: 'Postres', name: 'Postres' },
  { id: 'Bebidas', name: 'Bebidas' }
];

const Menu = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast.error('Error al cargar productos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || ''
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Nuestro Menú</h1>
          <p className="text-gray-600 text-lg">Descubre nuestros deliciosos platos</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm rounded-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-10 text-center">
          <div className="inline-flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-1.5 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-orange-50'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">Cargando productos...</div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl"
              >
                {/* Image */}
                <div className="relative h-48">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-orange-100 text-5xl">🍽️</div>
                  )}
                  {product.popular && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                      Popular
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star fill="currentColor" size={16} />
                      <span className="text-sm font-medium text-gray-800">
                        {product.rating ?? '—'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description ?? 'Sin descripción'}
                  </p>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <Clock size={14} />
                    {product.prepTime ?? '—'}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="btn-sm btn-primary flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
