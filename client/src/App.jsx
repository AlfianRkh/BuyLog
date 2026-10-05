import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages - BuyLog Main
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

// Pages - DebtTracker / Hutang Piutang
import HutangPiutangDashboardPage from './pages/hutangPiutang/HutangPiutangDashboardPage';
import HutangPiutangLedgerPage from './pages/hutangPiutang/HutangPiutangLedgerPage';
import HutangPiutangDetailPage from './pages/hutangPiutang/HutangPiutangDetailPage';
import HutangPiutangKontakPage from './pages/hutangPiutang/HutangPiutangKontakPage';
import HutangPiutangLaporanPage from './pages/hutangPiutang/HutangPiutangLaporanPage';
import HutangPiutangPengaturanPage from './pages/hutangPiutang/HutangPiutangPengaturanPage';

// Pages - PriceRadar
import PriceRadarDashboardPage from './pages/priceRadar/PriceRadarDashboardPage';
import PriceRadarWatchlistPage from './pages/priceRadar/PriceRadarWatchlistPage';
import PriceRadarProductDetailPage from './pages/priceRadar/PriceRadarProductDetailPage';
import PriceRadarSourcesPage from './pages/priceRadar/PriceRadarSourcesPage';
import PriceRadarStatsPage from './pages/priceRadar/PriceRadarStatsPage';

// Context & Pages - WishBoard Engine
import { WishBoardProvider } from './contexts/WishBoardContext';
import WishBoardDashboardPage from './pages/wishboard/WishBoardDashboardPage';
import WishBoardKanbanPage from './pages/wishboard/WishBoardKanbanPage';
import WishBoardMatrixPage from './pages/wishboard/WishBoardMatrixPage';
import WishBoardListPage from './pages/wishboard/WishBoardListPage';
import WishBoardDetailPage from './pages/wishboard/WishBoardDetailPage';
import WishBoardSettingsPage from './pages/wishboard/WishBoardSettingsPage';

// Context & Pages - StockPantry Engine
import { StockPantryProvider } from './contexts/StockPantryContext';
import StockPantryDashboardPage from './pages/stockPantry/StockPantryDashboardPage';
import StockPantryInventoryPage from './pages/stockPantry/StockPantryInventoryPage';
import StockPantryExpiryPage from './pages/stockPantry/StockPantryExpiryPage';
import StockPantryShoppingListPage from './pages/stockPantry/StockPantryShoppingListPage';
import StockPantryHistoryPage from './pages/stockPantry/StockPantryHistoryPage';
import StockPantryZonesPage from './pages/stockPantry/StockPantryZonesPage';

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
        <WishBoardProvider>
          <StockPantryProvider>
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

                  {/* DebtTracker Submenu Routes */}
                  <Route path="hutang-piutang" element={<Navigate to="/hutang-piutang/dashboard" replace />} />
                  <Route path="hutang-piutang/dashboard" element={<HutangPiutangDashboardPage />} />
                  <Route path="hutang-piutang/catatan" element={<HutangPiutangLedgerPage />} />
                  <Route path="hutang-piutang/detail" element={<HutangPiutangDetailPage />} />
                  <Route path="hutang-piutang/kontak" element={<HutangPiutangKontakPage />} />
                  <Route path="hutang-piutang/laporan" element={<HutangPiutangLaporanPage />} />
                  <Route path="hutang-piutang/pengaturan" element={<HutangPiutangPengaturanPage />} />

                  {/* PriceRadar Submenu Routes */}
                  <Route path="priceradar" element={<Navigate to="/priceradar/dashboard" replace />} />
                  <Route path="priceradar/dashboard" element={<PriceRadarDashboardPage />} />
                  <Route path="priceradar/watchlist" element={<PriceRadarWatchlistPage />} />
                  <Route path="priceradar/produk/:slug" element={<PriceRadarProductDetailPage />} />
                  <Route path="priceradar/sumber-harga" element={<PriceRadarSourcesPage />} />
                  <Route path="priceradar/statistik" element={<PriceRadarStatsPage />} />

                  {/* WishBoard Engine Submenu Routes */}
                  <Route path="wishboard" element={<Navigate to="/wishboard/dashboard" replace />} />
                  <Route path="wishboard/dashboard" element={<WishBoardDashboardPage />} />
                  <Route path="wishboard/board" element={<WishBoardKanbanPage />} />
                  <Route path="wishboard/matrix" element={<WishBoardMatrixPage />} />
                  <Route path="wishboard/list" element={<WishBoardListPage />} />
                  <Route path="wishboard/detail" element={<WishBoardDetailPage />} />
                  <Route path="wishboard/settings" element={<WishBoardSettingsPage />} />

                  {/* StockPantry Submenu Routes */}
                  <Route path="stockpantry" element={<Navigate to="/stockpantry/dashboard" replace />} />
                  <Route path="stockpantry/dashboard" element={<StockPantryDashboardPage />} />
                  <Route path="stockpantry/inventaris" element={<StockPantryInventoryPage />} />
                  <Route path="stockpantry/expiry" element={<StockPantryExpiryPage />} />
                  <Route path="stockpantry/shopping-list" element={<StockPantryShoppingListPage />} />
                  <Route path="stockpantry/history" element={<StockPantryHistoryPage />} />
                  <Route path="stockpantry/zones" element={<StockPantryZonesPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ToastProvider>
          </StockPantryProvider>
        </WishBoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
