import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, LoginPayload, RegisterPayload, ReadinessPayload } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { connectSocket, disconnectSocket, getSocket } from '../sockets/socket';
import { SOCKET_EVENTS } from '../sockets/socketEvents';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateReadiness: (payload: ReadinessPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bloodbridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('bloodbridge_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('bloodbridge_token');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (err) {
      console.warn('[Auth] Failed to fetch live user profile from backend:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Initialize session & Socket.IO connection
  useEffect(() => {
    const savedToken = localStorage.getItem('bloodbridge_token');
    if (savedToken) {
      const socket = connectSocket(savedToken);
      refreshUser();

      // Listen for personal emergency alerts
      const handleEmergencyAlert = (data: any) => {
        toastRef.current.warning(
          `Emergency broadcast for ${data.bloodGroup} at ${data.hospitalName}! Tap to view and respond.`,
          '🚨 Urgent Blood Needed'
        );
      };

      const handlePromoted = (data: any) => {
        toastRef.current.success(
          data.message || 'You have been promoted to Primary Donor. The patient is waiting for you!',
          '⭐ Promoted to Primary'
        );
      };

      socket.on(SOCKET_EVENTS.EMERGENCY_ALERT, handleEmergencyAlert);
      socket.on(SOCKET_EVENTS.EMERGENCY_PROMOTED, handlePromoted);

      return () => {
        socket.off(SOCKET_EVENTS.EMERGENCY_ALERT, handleEmergencyAlert);
        socket.off(SOCKET_EVENTS.EMERGENCY_PROMOTED, handlePromoted);
      };
    } else {
      setIsLoading(false);
    }
  }, [token, refreshUser]);

  // Handle unauthorized events across tabs/requests
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Your session has expired. Please log in again.', 'Session Expired');
    };

    window.addEventListener('bloodbridge:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bloodbridge:unauthorized', handleUnauthorized);
  }, [logout, toast]);

  const login = async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    localStorage.setItem('bloodbridge_token', data.token);
    setToken(data.token);
    setUser(data.user);
    connectSocket(data.token);
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const updateReadiness = async (payload: ReadinessPayload) => {
    const updated = await authService.updateReadiness(payload);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateReadiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
