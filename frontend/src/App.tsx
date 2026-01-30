import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@contexts/AuthContext';
import { ProtectedRoute } from '@components/ProtectedRoute';
import LoginPage from '@pages/LoginPage';
import TestPage from '@pages/TestPage';
import AlertsPage from '@pages/AlertsPage';
import CreateAlertPage from '@pages/CreateAlertPage';
import DashboardPage from '@pages/DashboardPage';
import AdminPage from '@pages/AdminPage';
import AdminUsersPage from '@pages/AdminUsersPage';
import AdminAlertsPage from '@pages/AdminAlertsPage';
import DepartmentsPage from '@pages/DepartmentsPage';
import DepartmentDetailPage from '@pages/DepartmentDetailPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/:id" element={<DepartmentDetailPage />} />

          {/* Rutas protegidas para usuarios */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/create" element={<CreateAlertPage />} />
          </Route>

          {/* Rutas protegidas para administradores */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/alertas" element={<AdminAlertsPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/alerts" replace />} />
          
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Notificaciones Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
