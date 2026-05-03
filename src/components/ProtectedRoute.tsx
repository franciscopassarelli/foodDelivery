import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "delivery" | "customer";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // 🟡 Estado de carga (mejor UX)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        <p className="mt-4 text-gray-600 text-sm">Cargando información...</p>
      </div>
    );
  }

  // 🔐 No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Sin permisos
  if (role && user?.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600">
            Acceso denegado
          </h2>

          <p className="text-gray-600 mt-2">
            No tienes permisos para acceder a esta página.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;