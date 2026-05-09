import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import CustomerDashboard from '@/pages/CustomerDashboard';
import SellerDashboard from '@/pages/SellerDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

function AppRoutes() {
  const { login } = useAuthStore();

  // Rehydrate auth state from localStorage on page load
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        login(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [login]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller-dashboard"
        element={
          <ProtectedRoute allowedRoles={['shopkeeper']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
