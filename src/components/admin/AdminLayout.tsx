
import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  children: React.ReactNode;
}

export const AdminLayout = ({ activeSection, setActiveSection, children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};
