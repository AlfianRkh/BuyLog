import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PembelianListPage from './pages/pembelian/PembelianListPage';
import PembelianCreatePage from './pages/pembelian/PembelianCreatePage';
import PembelianDetailPage from './pages/pembelian/PembelianDetailPage';
import BarangListPage from './pages/barang/BarangListPage';
import BarangDetailPage from './pages/barang/BarangDetailPage';
import MerkPage from './pages/merk/MerkPage';
import TokoPage from './pages/toko/TokoPage';
import LokasiPage from './pages/lokasi/LokasiPage';
import LaporanPage from './pages/laporan/LaporanPage';
import PengaturanPage from './pages/pengaturan/PengaturanPage';

// Styles
import './styles/variables.css';
import './styles/global.css';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        Memuat BuyLog...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirects to /dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
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

            {/* Protected App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pembelian" element={<PembelianListPage />} />
              <Route path="pembelian/tambah" element={<PembelianCreatePage />} />
              <Route path="pembelian/:id" element={<PembelianDetailPage />} />
              <Route path="barang" element={<BarangListPage />} />
              <Route path="barang/:id" element={<BarangDetailPage />} />
              <Route path="merk" element={<MerkPage />} />
              <Route path="toko" element={<TokoPage />} />
              <Route path="lokasi" element={<LokasiPage />} />
              <Route path="laporan" element={<LaporanPage />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
