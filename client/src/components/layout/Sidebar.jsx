import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Store,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  ShoppingBag,
  Wallet,
  ChevronRight,
  BookOpen,
  Users,
  PieChart,
  Radar,
  Eye,
  TrendingUp,
  Sparkles,
  Scale,
  Columns3,
  ListFilter,
  Sliders,
  Refrigerator,
  Clock,
  History,
  Camera,
  Receipt,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const mainMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pembelian', label: 'Pembelian', icon: ShoppingCart },
  { path: '/barang', label: 'Barang', icon: Package },
  { path: '/merk', label: 'Merk', icon: Tag },
  { path: '/toko', label: 'Toko', icon: Store },
  { path: '/lokasi', label: 'Lokasi', icon: MapPin },
  { path: '/laporan', label: 'Laporan', icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

const debtSubmenuItems = [
  { path: '/hutang-piutang/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { path: '/hutang-piutang/catatan', label: 'Buku Catatan', icon: BookOpen },
  { path: '/hutang-piutang/kontak', label: 'Kontak & Tagihan', icon: Users },
  { path: '/hutang-piutang/laporan', label: 'Laporan Hutang', icon: PieChart },
  { path: '/hutang-piutang/pengaturan', label: 'Pengaturan WA', icon: Settings }
];

const priceRadarSubmenuItems = [
  { path: '/priceradar/dashboard', label: 'Dashboard', icon: Radar },
  { path: '/priceradar/watchlist', label: 'Watchlist Produk', icon: Eye },
  { path: '/priceradar/sumber-harga', label: 'Sumber Harga', icon: Store },
  { path: '/priceradar/statistik', label: 'Statistik & Evaluasi', icon: TrendingUp }
];

const wishboardSubmenuItems = [
  { path: '/wishboard/dashboard', label: 'Dashboard Wishlist', icon: LayoutDashboard },
  { path: '/wishboard/board', label: 'Kanban Board', icon: Columns3 },
  { path: '/wishboard/matrix', label: 'Decision Matrix', icon: Scale },
  { path: '/wishboard/list', label: 'List View', icon: ListFilter },
  { path: '/wishboard/settings', label: 'Pengaturan Formula', icon: Sliders }
];

const stockpantrySubmenuItems = [
  { path: '/stockpantry/dashboard', label: 'Dashboard Pantry', icon: LayoutDashboard },
  { path: '/stockpantry/inventaris', label: 'Inventaris Dapur', icon: Package },
  { path: '/stockpantry/expiry', label: 'Pelacak Kedaluwarsa', icon: Clock },
  { path: '/stockpantry/shopping-list', label: 'Smart Shopping List', icon: ShoppingCart },
  { path: '/stockpantry/history', label: 'Riwayat Konsumsi', icon: History },
  { path: '/stockpantry/zones', label: 'Zona Penyimpanan', icon: MapPin }
];

const smartFinSubmenuItems = [
  { path: '/smartfin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/smartfin/scan', label: 'Pindai Struk AI', icon: Camera },
  { path: '/smartfin/transactions', label: 'Buku Transaksi', icon: Receipt },
  { path: '/smartfin/split-bill', label: 'Smart Split-Bill', icon: PieChart },
  { path: '/smartfin/accounts', label: 'Dompet & Rekening', icon: Wallet },
  { path: '/smartfin/budgets', label: 'Pos Anggaran', icon: PiggyBank },
  { path: '/smartfin/reports', label: 'Laporan Analisis', icon: BarChart3 },
  { path: '/smartfin/settings', label: 'Pengaturan OCR', icon: Settings }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDebtTrackerActive = location.pathname.startsWith('/hutang-piutang');
  const isPriceRadarActive = location.pathname.startsWith('/priceradar');
  const isWishBoardActive = location.pathname.startsWith('/wishboard');
  const isStockPantryActive = location.pathname.startsWith('/stockpantry');
  const isSmartFinActive = location.pathname.startsWith('/smartfin');

  const [isDebtOpen, setIsDebtOpen] = useState(isDebtTrackerActive);
  const [isPriceRadarOpen, setIsPriceRadarOpen] = useState(isPriceRadarActive);
  const [isWishBoardOpen, setIsWishBoardOpen] = useState(isWishBoardActive);
  const [isStockPantryOpen, setIsStockPantryOpen] = useState(isStockPantryActive);
  const [isSmartFinOpen, setIsSmartFinOpen] = useState(isSmartFinActive);

  useEffect(() => {
    if (isDebtTrackerActive) setIsDebtOpen(true);
    if (isPriceRadarActive) setIsPriceRadarOpen(true);
    if (isWishBoardActive) setIsWishBoardOpen(true);
    if (isStockPantryActive) setIsStockPantryOpen(true);
    if (isSmartFinActive) setIsSmartFinOpen(true);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShoppingBag size={22} color="#FFFFFF" />
          </div>
          <span className="brand-name">BuyLog</span>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {/* Main BuyLog Menu */}
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Section Divider & Submenu Group for DebtTracker */}
          <div className="nav-section-title">Hutang & Piutang</div>

          <div className="nav-group">
            <button
              onClick={() => setIsDebtOpen(!isDebtOpen)}
              className={`nav-group-header ${isDebtTrackerActive ? 'active-group' : ''}`}
            >
              <div className="nav-group-content">
                <Wallet size={20} className="nav-icon" />
                <span>Hutang Piutang</span>
              </div>
              <ChevronRight size={16} className={`chevron-icon ${isDebtOpen ? 'open' : ''}`} />
            </button>

            {isDebtOpen && (
              <div className="nav-submenu">
                {debtSubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Divider & Submenu Group for PriceRadar */}
          <div className="nav-section-title">PriceRadar</div>

          <div className="nav-group">
            <button
              onClick={() => setIsPriceRadarOpen(!isPriceRadarOpen)}
              className={`nav-group-header ${isPriceRadarActive ? 'active-group' : ''}`}
            >
              <div className="nav-group-content">
                <Radar size={20} className="nav-icon text-[#4cd7f6]" />
                <span className="text-[#4cd7f6] font-bold">PriceRadar</span>
              </div>
              <ChevronRight size={16} className={`chevron-icon ${isPriceRadarOpen ? 'open' : ''}`} />
            </button>

            {isPriceRadarOpen && (
              <div className="nav-submenu">
                {priceRadarSubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Divider & Submenu Group for WishBoard Engine */}
          <div className="nav-section-title">WishBoard Engine</div>

          <div className="nav-group">
            <button
              onClick={() => setIsWishBoardOpen(!isWishBoardOpen)}
              className={`nav-group-header ${isWishBoardActive ? 'active-group' : ''}`}
            >
              <div className="nav-group-content">
                <Sparkles size={20} className="nav-icon text-[#a078ff]" />
                <span className="text-[#a078ff] font-bold">WishBoard</span>
              </div>
              <ChevronRight size={16} className={`chevron-icon ${isWishBoardOpen ? 'open' : ''}`} />
            </button>

            {isWishBoardOpen && (
              <div className="nav-submenu">
                {wishboardSubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Divider & Submenu Group for StockPantry */}
          <div className="nav-section-title">StockPantry</div>

          <div className="nav-group">
            <button
              onClick={() => setIsStockPantryOpen(!isStockPantryOpen)}
              className={`nav-group-header ${isStockPantryActive ? 'active-group' : ''}`}
            >
              <div className="nav-group-content">
                <Refrigerator size={20} className="nav-icon text-[#10b981]" />
                <span className="text-[#10b981] font-bold">StockPantry</span>
              </div>
              <ChevronRight size={16} className={`chevron-icon ${isStockPantryOpen ? 'open' : ''}`} />
            </button>

            {isStockPantryOpen && (
              <div className="nav-submenu">
                {stockpantrySubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Divider & Submenu Group for SmartFin */}
          <div className="nav-section-title">SmartFin AI Vision</div>

          <div className="nav-group">
            <button
              onClick={() => setIsSmartFinOpen(!isSmartFinOpen)}
              className={`nav-group-header ${isSmartFinActive ? 'active-group' : ''}`}
            >
              <div className="nav-group-content">
                <Receipt size={20} className="nav-icon text-[#4edea3]" />
                <span className="text-[#4edea3] font-bold">SmartFin</span>
              </div>
              <ChevronRight size={16} className={`chevron-icon ${isSmartFinOpen ? 'open' : ''}`} />
            </button>

            {isSmartFinOpen && (
              <div className="nav-submenu">
                {smartFinSubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{user?.name || 'Pengguna'}</span>
              <span className="user-email">{user?.email || 'user@example.com'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
