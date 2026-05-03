import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser) {
        toast.success('¡Bienvenido de vuelta!');

        if (loggedUser.role === 'admin') {
  navigate('/admin');
} else if (loggedUser.role === 'delivery') {
  navigate('/delivery');
} else {
  navigate('/');
}
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">FD</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta para continuar</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-primary mt-2"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-orange-600 font-semibold hover:underline">
              Regístrate
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Volver al inicio
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
  <p className="text-sm font-semibold text-gray-700 mb-3">
    🧪 Usuarios de prueba
  </p>

  <div className="space-y-2 text-sm">
    
    <button
      onClick={() => {
        setEmail('cliente@demo.com');
        setPassword('123456');
      }}
      className="w-full text-left p-2 rounded hover:bg-gray-100 transition"
    >
      👤 <span className="font-medium">Cliente</span>
    </button>

    <button
      onClick={() => {
        setEmail('chicodelivery@demo.com');
        setPassword('Delivery');
      }}
      className="w-full text-left p-2 rounded hover:bg-gray-100 transition"
    >
      🛵 <span className="font-medium">Repartidor</span>
    </button>

    <button
      onClick={() => {
        setEmail('admin@demo.com');
        setPassword('administrador');
      }}
      className="w-full text-left p-2 rounded hover:bg-gray-100 transition"
    >
      🛠️ <span className="font-medium">Administrador</span>
    </button>

  </div>

  <p className="text-xs text-gray-500 mt-3">
    También puedes registrarte con tu propia cuenta.
  </p>
</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
