import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  children: React.ReactNode;
}

export const AdminLayout = ({ activeSection, setActiveSection, children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        {/* Header mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
          <button onClick={() => setSidebarOpen(false)} aria-label="Toggle Sidebar">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>

        <div className="flex min-h-screen w-full relative">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};
