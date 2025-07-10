
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Store, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Food Delivery',
    storeDescription: 'Comida deliciosa directo a tu puerta',
    phone: '+54 11 1234-5678',
    email: 'info@fooddelivery.com',
    address: 'Av. Corrientes 1234, Buenos Aires',
    deliveryEnabled: true,
    minOrderAmount: 15,
    deliveryFee: 5,
    freeDeliveryThreshold: 50,
    operatingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    openingTime: '11:00',
    closingTime: '23:00',
    acceptingOrders: true
  });

  const handleSave = () => {
    // Aquí normalmente guardarías en la base de datos
    toast.success('Configuración guardada correctamente');
  };

  const handleDayToggle = (day: string) => {
    setSettings({
      ...settings,
      operatingDays: {
        ...settings.operatingDays,
        [day]: !settings.operatingDays[day as keyof typeof settings.operatingDays]
      }
    });
  };

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Administra la configuración de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Negocio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Nombre del Negocio</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="storeDescription">Descripción</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Entregas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configuración de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="deliveryEnabled">Entregas Habilitadas</Label>
              <Switch
                id="deliveryEnabled"
                checked={settings.deliveryEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, deliveryEnabled: checked })}
              />
            </div>

            <div>
              <Label htmlFor="minOrderAmount">Pedido Mínimo ($)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="deliveryFee">Costo de Envío ($)</Label>
              <Input
                id="deliveryFee"
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="freeDeliveryThreshold">Envío Gratis desde ($)</Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="acceptingOrders">Aceptando Pedidos</Label>
              <Switch
                id="acceptingOrders"
                checked={settings.acceptingOrders}
                onCheckedChange={(checked) => setSettings({ ...settings, acceptingOrders: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Operación */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Operación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openingTime">Hora de Apertura</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="closingTime">Hora de Cierre</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Días de Operación</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      id={day}
                      checked={settings.operatingDays[day as keyof typeof settings.operatingDays]}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};
