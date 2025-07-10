
import React from 'react';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';

interface AdminSectionRendererProps {
  activeSection: string;
}

export const AdminSectionRenderer = ({ activeSection }: AdminSectionRendererProps) => {
  switch (activeSection) {
    case 'products':
      return <AdminProducts />;
    case 'orders':
      return <AdminOrders />;
    case 'messages':
      return <AdminMessages />;
    case 'settings':
      return <AdminSettings />;
    default:
      return <AdminProducts />;
  }
};
