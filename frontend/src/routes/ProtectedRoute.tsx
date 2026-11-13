import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-blood-700 flex items-center justify-center text-white shadow-lg shadow-blood-700/30 mb-4 animate-bounce">
          <Droplet className="w-7 h-7 fill-current" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#17212B]">
          <Loader2 className="w-4 h-4 animate-spin text-blood-700" />
          <span>Restoring BloodBridge Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

