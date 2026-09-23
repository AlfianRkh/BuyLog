import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pembelian', label: 'Pembelian', icon: ShoppingCart },
  { path: '/barang', label: 'Barang', icon: Package },
  { path: '/merk', label: 'Merk', icon: Tag },
  { path: '/toko', label: 'Toko', icon: Store },
  { path: '/lokasi', label: 'Lokasi', icon: MapPin },
  { path: '/laporan', label: 'Laporan', icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          {menuItems.map((item) => {
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
