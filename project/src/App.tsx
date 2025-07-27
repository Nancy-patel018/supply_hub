import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import LoginPage from './components/auth/LoginPage';
import VendorDashboard from './components/vendor/VendorDashboard';
import SupplierDashboard from './components/supplier/SupplierDashboard';
import TransporterDashboard from './components/transporter/TransporterDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  switch (user?.role) {
    case 'vendor':
      return <VendorDashboard />;
    case 'supplier':
      return <SupplierDashboard />;
    case 'transporter':
      return <TransporterDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LoginPage />;
  }
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
