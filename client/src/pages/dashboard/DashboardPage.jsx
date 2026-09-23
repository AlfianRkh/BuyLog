import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import CategoryDonutChart from '../../components/charts/CategoryDonutChart';
import { api } from '../../services/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  Wallet,
  Receipt,
  Package,
  Tag,
  ArrowRight,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = () => {
  const { toggleSidebar } = useOutletContext();
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/monthly', {
        month: selectedMonth,
        year: selectedYear
      });
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (m, y) => {
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const summary = dashboardData?.summary || {
    total_spending: 0,
    total_transactions: 0,
    total_products: 0,
    total_brands: 0
  };

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Ringkasan aktivitas pembelian Anda"
        showMonthFilter={true}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onToggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        {/* Top Summary Cards */}
        <div className="stats-grid">
          {/* Card 1: Total Pembelian */}
          <div className="card stat-card">
            <div className="stat-icon-wrapper bg-green">
              <Wallet size={24} color="#10B981" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Pembelian</span>
              <span className="stat-value">{formatRupiah(summary.total_spending)}</span>
              {summary.spending_change_pct !== undefined && summary.spending_change_pct !== 0 && (
                <div className="stat-trend positive">
                  <TrendingUp size={12} />
                  <span>{summary.spending_change_pct > 0 ? `+${summary.spending_change_pct}%` : `${summary.spending_change_pct}%`} dari bulan lalu</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Jumlah Transaksi */}
          <div className="card stat-card">
            <div className="stat-icon-wrapper bg-blue">
              <Receipt size={24} color="#3B82F6" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Jumlah Transaksi</span>
              <span className="stat-value">{summary.total_transactions}</span>
              <span className="stat-subtext">Transaksi bulan ini</span>
            </div>
          </div>

          {/* Card 3: Jumlah Barang */}
          <div className="card stat-card">
            <div className="stat-icon-wrapper bg-purple">
              <Package size={24} color="#8B5CF6" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Jumlah Barang</span>
              <span className="stat-value">{summary.total_products}</span>
              <span className="stat-subtext">Barang terdaftar</span>
            </div>
          </div>

          {/* Card 4: Jumlah Merk */}
          <div className="card stat-card">
            <div className="stat-icon-wrapper bg-orange">
              <Tag size={24} color="#F59E0B" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Jumlah Merk</span>
              <span className="stat-value">{summary.total_brands}</span>
              <span className="stat-subtext">Merk terdaftar</span>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Pengeluaran per Kategori (Donut Chart) */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Pengeluaran per Kategori</h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="chart-loading">Memuat grafik...</div>
              ) : (
                <CategoryDonutChart
                  categories={dashboardData?.category_spending || []}
                  totalAmount={dashboardData?.total_category_spending || 0}
                />
              )}
            </div>
          </div>

          {/* Right Column: Pembelian Terbaru */}
          <div className="card dashboard-card">
            <div className="card-header flex-between">
              <h2 className="card-title">Pembelian Terbaru</h2>
              <Link to="/pembelian" className="see-all-link">
                <span>Lihat Semua</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body recent-purchases-list">
              {dashboardData?.recent_purchases && dashboardData.recent_purchases.length > 0 ? (
                dashboardData.recent_purchases.map((purchase) => (
                  <Link
                    to={`/pembelian/${purchase.id}`}
                    key={purchase.id}
                    className="recent-purchase-item"
                  >
                    <div className="item-thumbnail">
                      {purchase.photo_url ? (
                        <img src={purchase.photo_url} alt={purchase.primary_product_name} />
                      ) : (
                        <div className="item-thumbnail-placeholder">
                          <ShoppingBag size={18} color="#94A3B8" />
                        </div>
                      )}
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">
                        {purchase.primary_product_name || 'Pembelian'}{' '}
                        {purchase.primary_brand && <span className="item-brand">{purchase.primary_brand}</span>}{' '}
                        {purchase.primary_product_model && <span className="item-model">{purchase.primary_product_model}</span>}
                      </h3>
                      <p className="item-store">
                        {purchase.store_name || 'Toko'} • {purchase.city || (purchase.store_type === 'online' ? 'Online' : 'Surabaya')}
                      </p>
                    </div>
                    <div className="item-meta">
                      <span className="item-date">{formatDate(purchase.purchase_date)}</span>
                      <span className="item-price">{formatRupiah(purchase.total_amount)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <ShoppingBag size={32} color="#CBD5E1" />
                  <p>Belum ada riwayat pembelian</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
