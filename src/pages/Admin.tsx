import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSectionRenderer } from '@/components/admin/AdminSectionRenderer';

const Admin = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('products');

  // Si no hay usuario o no es admin, redirigir al login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout activeSection={activeSection} setActiveSection={setActiveSection}>
      <AdminSectionRenderer activeSection={activeSection} />
    </AdminLayout>
  );
};

export default Admin;
