import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, MapPin, CreditCard, Star, Package } from 'lucide-react';
import { updateUserProfile } from '@/lib/firebase/users';
import {
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  PaymentMethod,
} from '@/lib/firebase/paymentMethod';
import { uploadProfileImage } from '@/lib/firebase/storage';

const Profile = () => {
  const { user, updateUser, addAddress, updateAddress, deleteAddress } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: (user?.addresses?.find(a => a.isDefault)?.street) || ''
  });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddressForm, setNewAddressForm] = useState({
    label: '',
    address: '',
  });

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({
    type: '',
    last4: '',
    expiry: '',
    isDefault: false,
  });




const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user?.id) {
    console.warn("No hay archivo o usuario");
    return;
  }

  try {
    console.log("Subiendo imagen:", file);
    const url = await uploadProfileImage(file, user.id);
    console.log("URL obtenida de Firebase Storage:", url);

    await updateUserProfile(user.id, { photoURL: url });
    updateUser({ ...user, photoURL: url });
    console.log("Usuario actualizado:", { ...user, photoURL: url });

    toast.success("Imagen actualizada");
  } catch (error) {
    console.error("Error al subir imagen:", error);
    toast.error("Error al subir imagen");
  }
};



  const addresses = user?.addresses || [];

  // Fetch métodos de pago desde Firebase
  useEffect(() => {
    if (!user?.id) return;

    const fetchPaymentMethods = async () => {
      try {
        const data = await getPaymentMethods(user.id);
        setPaymentMethods(data);
      } catch (error) {
        console.error('Error al obtener tarjetas:', error);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: (user?.addresses?.find(a => a.isDefault)?.street) || ''
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      const dataToUpdate = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };
      await updateUserProfile(user.id, dataToUpdate);
      updateUser(dataToUpdate);  // Actualiza contexto local y localStorage
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al guardar perfil');
    }
  };

  const handleSaveAddress = () => {
    if (!newAddressForm.label || !newAddressForm.address) return;

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        name: newAddressForm.label,
        street: newAddressForm.address,
      });
      toast.success('Dirección actualizada');
    } else {
      addAddress({
        name: newAddressForm.label,
        street: newAddressForm.address,
        city: 'Buenos Aires',
        zipCode: '1000',
        isDefault: false,
      });
      toast.success('Dirección agregada');
    }

    setNewAddressForm({ label: '', address: '' });
    setEditingAddressId(null);
  };

  const handleEditAddress = (id: string, label: string, address: string) => {
    setEditingAddressId(id);
    setNewAddressForm({ label, address });
  };

  const handleCancelEdit = () => {
    setNewAddressForm({ label: '', address: '' });
    setEditingAddressId(null);
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCardForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveCard = async () => {
    if (!cardForm.type || !cardForm.last4 || !cardForm.expiry || !user?.id) return;

    try {
      if (editingCardId) {
        await updatePaymentMethod(user.id, editingCardId, cardForm);
        toast.success('Tarjeta actualizada');
      } else {
        await addPaymentMethod(user.id, cardForm);
        toast.success('Tarjeta agregada');
      }

      const data = await getPaymentMethods(user.id);
      setPaymentMethods(data);
      setCardForm({ type: '', last4: '', expiry: '', isDefault: false });
      setEditingCardId(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar tarjeta');
    }
  };

  const handleEditCard = (card: PaymentMethod) => {
    setCardForm({
      type: card.type,
      last4: card.last4,
      expiry: card.expiry,
      isDefault: card.isDefault,
    });
    setEditingCardId(card.id || null);
  };

  const handleCancelCardEdit = () => {
    setCardForm({ type: '', last4: '', expiry: '', isDefault: false });
    setEditingCardId(null);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user?.id) return;

    try {
      await deletePaymentMethod(user.id, cardId);
      const data = await getPaymentMethods(user.id);
      setPaymentMethods(data);
      toast.success('Tarjeta eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar tarjeta');
    }
  };

  const orderStats = {
    total: 24,
    completed: 22,
    cancelled: 2,
    favorite: 'Pizza Palace'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
  <span className="text-white font-bold text-xl">FD</span>
</div>



            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Cliente Premium</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="addresses">Direcciones</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Información Personal</CardTitle>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                  <Label htmlFor="address">Dirección Principal</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mis Direcciones</h3>
              <div className="space-y-4">
                <div>
                  <Label>Etiqueta</Label>
                  <Input name="label" value={newAddressForm.label} onChange={handleAddressInputChange} />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input name="address" value={newAddressForm.address} onChange={handleAddressInputChange} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress}>{editingAddressId ? 'Actualizar' : 'Agregar'}</Button>
                  {editingAddressId && <Button variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
                </div>
              </div>

              {addresses.map(address => (
                <Card key={address.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        <MapPin className="text-gray-400" size={20} />
                        <div>
                          <h4 className="font-semibold">{address.name}</h4>
                          <p className="text-gray-600">{address.street}</p>
                          {address.isDefault && <Badge variant="secondary">Predeterminada</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditAddress(address.id, address.name, address.street)}>Editar</Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteAddress(address.id)}>Eliminar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Métodos de Pago</h3>

              <div>
                <Label>Tipo (Visa, MasterCard...)</Label>
                <Input name="type" value={cardForm.type} onChange={handleCardInputChange} />
              </div>
              <div>
                <Label>Últimos 4 dígitos</Label>
                <Input name="last4" maxLength={4} value={cardForm.last4} onChange={handleCardInputChange} />
              </div>
              <div>
                <Label>Vencimiento (MM/AA)</Label>
                <Input name="expiry" value={cardForm.expiry} onChange={handleCardInputChange} />
              </div>
              <div>
                <label className="flex gap-2 items-center">
                  <input type="checkbox" name="isDefault" checked={cardForm.isDefault} onChange={handleCardInputChange} />
                  Usar como predeterminada
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCard}>{editingCardId ? 'Actualizar' : 'Agregar'}</Button>
                {editingCardId && <Button variant="outline" onClick={handleCancelCardEdit}>Cancelar</Button>}
              </div>

              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        <CreditCard className="text-gray-400" size={20} />
                        <div>
                          <h4 className="font-semibold">{method.type} •••• {method.last4}</h4>
                          <p className="text-gray-600">Expira {method.expiry}</p>
                          {method.isDefault && <Badge variant="secondary">Predeterminada</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditCard(method)}>Editar</Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteCard(method.id!)}>Eliminar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                  <h3 className="text-2xl font-bold">{orderStats.total}</h3>
                  <p className="text-gray-600">Pedidos Totales</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                  <h3 className="text-2xl font-bold">4.8</h3>
                  <p className="text-gray-600">Calificación Promedio</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🍕</div>
                  <h3 className="text-lg font-semibold">{orderStats.favorite}</h3>
                  <p className="text-gray-600">Restaurante Favorito</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-2xl font-bold">$247.82</h3>
                  <p className="text-gray-600">Total Gastado</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
