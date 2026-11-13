import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '../components/layout/MainLayout';

// Pages
import { LandingPage } from '../pages/landing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { RequestsListPage } from '../pages/requests/RequestsListPage';
import { CreateRequestPage } from '../pages/requests/CreateRequestPage';
import { RequestDetailsPage } from '../pages/requests/RequestDetailsPage';
import { RequestTrackingPage } from '../pages/requests/RequestTrackingPage';
import { DonorProfilePage } from '../pages/donor/DonorProfilePage';
import { ChatPage } from '../pages/chat/ChatPage';
import { ProfileSettingsPage } from '../pages/profile/ProfileSettingsPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Landing Page (Default Root Route) */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Public Authentication Routes (Redirect to /dashboard if logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* 3. Protected Application Routes inside MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestsListPage />} />
        <Route path="/requests/create" element={<CreateRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailsPage />} />
        <Route path="/requests/:id/tracking" element={<RequestTrackingPage />} />
        <Route path="/donors/profile" element={<DonorProfilePage />} />
        <Route path="/chat/:requestId" element={<ChatPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
      </Route>

      {/* 4. Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
