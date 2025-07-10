
import React, { useState } from 'react';
import { useAuth, Address } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressSelectorProps {
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ selectedAddressId, onAddressSelect }) => {
  const { user, addAddress, updateAddress, deleteAddress } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    zipCode: '',
    instructions: ''
  });

  const addresses = user?.addresses || [];
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    addAddress(newAddress);
    setNewAddress({ name: '', street: '', city: '', zipCode: '', instructions: '' });
    setIsAddDialogOpen(false);
    toast.success('Dirección agregada exitosamente');
  };

  const handleEditAddress = () => {
    if (!editingAddress) return;

    updateAddress(editingAddress.id, editingAddress);
    setEditingAddress(null);
    setIsEditDialogOpen(false);
    toast.success('Dirección actualizada exitosamente');
  };

  const handleDeleteAddress = (addressId: string) => {
    deleteAddress(addressId);
    if (selectedAddressId === addressId && addresses.length > 1) {
      const remaining = addresses.filter(addr => addr.id !== addressId);
      onAddressSelect(remaining[0]?.id || '');
    }
    toast.success('Dirección eliminada');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-4">
            <Select value={selectedAddressId || ''} onValueChange={onAddressSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una dirección" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map(address => (
                  <SelectItem key={address.id} value={address.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{address.name}</span>
                      <span className="text-sm text-gray-500">{address.street}, {address.city}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAddress && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{selectedAddress.name}</h4>
                    <p className="text-sm text-gray-600">{selectedAddress.street}</p>
                    <p className="text-sm text-gray-600">{selectedAddress.city}, CP: {selectedAddress.zipCode}</p>
                    {selectedAddress.instructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        <strong>Instrucciones:</strong> {selectedAddress.instructions}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAddress(selectedAddress);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    {addresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(selectedAddress.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus size={16} className="mr-2" />
              Agregar nueva dirección
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Dirección</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la dirección *</Label>
                <Input
                  id="name"
                  placeholder="Casa, Trabajo, etc."
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="street">Dirección *</Label>
                <Input
                  id="street"
                  placeholder="Calle y número"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    placeholder="Ciudad"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    placeholder="CP"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instructions">Instrucciones de entrega</Label>
                <Textarea
                  id="instructions"
                  placeholder="Piso, departamento, referencias, etc."
                  value={newAddress.instructions}
                  onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddAddress} className="flex-1">
                  Agregar Dirección
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Dirección</DialogTitle>
            </DialogHeader>
            {editingAddress && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nombre de la dirección *</Label>
                  <Input
                    id="edit-name"
                    value={editingAddress.name}
                    onChange={(e) => setEditingAddress({ ...editingAddress, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-street">Dirección *</Label>
                  <Input
                    id="edit-street"
                    value={editingAddress.street}
                    onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-city">Ciudad *</Label>
                    <Input
                      id="edit-city"
                      value={editingAddress.city}
                      onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-zipCode">Código Postal</Label>
                    <Input
                      id="edit-zipCode"
                      value={editingAddress.zipCode}
                      onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-instructions">Instrucciones de entrega</Label>
                  <Textarea
                    id="edit-instructions"
                    value={editingAddress.instructions || ''}
                    onChange={(e) => setEditingAddress({ ...editingAddress, instructions: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditAddress} className="flex-1">
                    Guardar Cambios
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AddressSelector;
