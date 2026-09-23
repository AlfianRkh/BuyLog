import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import CategoryDonutChart from '../../components/charts/CategoryDonutChart';
import { api } from '../../services/api';
import { formatRupiah, formatPercent } from '../../utils/formatters';
import {
  TrendingUp,
  Wallet,
  Receipt,
  Store,
  Package,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import './LaporanPage.css';

const LaporanPage = () => {
  const { toggleSidebar } = useOutletContext();
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/monthly', {
        month: selectedMonth,
        year: selectedYear
      });
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = reportData?.summary || {
    total_spending: 0,
    spending_change_pct: 0,
    total_transactions: 0,
    transactions_change_pct: 0
  };

  return (
    <div>
      <Header
        title="Laporan"
        subtitle="Pengeluaran per-kategori dan statistik pembelian"
        showMonthFilter={true}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        onToggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        {/* Top 2 Big Metric Cards */}
        <div className="report-summary-grid">
          <div className="card report-metric-card">
            <div className="report-metric-icon bg-green">
              <Wallet size={26} color="#10B981" />
            </div>
            <div className="report-metric-content">
              <span className="report-metric-label">Total Pengeluaran</span>
              <span className="report-metric-value">{formatRupiah(summary.total_spending)}</span>
              <div className="report-metric-trend text-green">
                <TrendingUp size={14} />
                <span>{summary.spending_change_pct >= 0 ? `+${summary.spending_change_pct}%` : `${summary.spending_change_pct}%`} dari bulan sebelumnya</span>
              </div>
            </div>
          </div>

          <div className="card report-metric-card">
            <div className="report-metric-icon bg-blue">
              <Receipt size={26} color="#3B82F6" />
            </div>
            <div className="report-metric-content">
              <span className="report-metric-label">Jumlah Transaksi</span>
              <span className="report-metric-value">{summary.total_transactions}</span>
              <div className="report-metric-trend text-blue">
                <TrendingUp size={14} />
                <span>{summary.transactions_change_pct >= 0 ? `+${summary.transactions_change_pct}%` : `${summary.transactions_change_pct}%`} dari bulan sebelumnya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Spending Breakdown (Donut Chart) */}
        <div className="card mt-4">
          <div className="card-header">
            <h2 className="card-title">Pengeluaran per Kategori</h2>
          </div>
          <div className="card-body">
            <CategoryDonutChart
              categories={reportData?.category_breakdown || []}
              totalAmount={summary.total_spending}
            />
          </div>
        </div>

        {/* Bottom Two Columns: Top Stores & Top Products */}
        <div className="report-rankings-grid mt-4">
          {/* Toko Paling Sering */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex-align">
                <Store size={18} color="#3B82F6" />
                <span>Toko Paling Sering</span>
              </h2>
            </div>
            <div className="rankings-list">
              {reportData?.top_stores && reportData.top_stores.length > 0 ? (
                reportData.top_stores.map((store, index) => (
                  <div key={store.id} className="ranking-item">
                    <span className="ranking-number">{index + 1}</span>
                    <div className="ranking-store-icon">
                      <Store size={16} color="#475569" />
                    </div>
                    <div className="ranking-details">
                      <span className="ranking-title">{store.store_name}</span>
                      <span className="ranking-sub">{formatRupiah(store.total_spent)}</span>
                    </div>
                    <span className="ranking-badge">
                      {store.transaction_count} transaksi
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">Belum ada data toko</div>
              )}
            </div>
          </div>

          {/* Barang Paling Sering Dibeli */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex-align">
                <Package size={18} color="#3B82F6" />
                <span>Barang Paling Sering Dibeli</span>
              </h2>
            </div>
            <div className="rankings-list">
              {reportData?.top_products && reportData.top_products.length > 0 ? (
                reportData.top_products.map((item, index) => (
                  <div key={item.id} className="ranking-item">
                    <span className="ranking-number">{index + 1}</span>
                    <div className="ranking-thumb">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.product_name} />
                      ) : (
                        <ShoppingBag size={16} color="#94A3B8" />
                      )}
                    </div>
                    <div className="ranking-details">
                      <span className="ranking-title">{item.product_name}</span>
                      <span className="ranking-sub">{item.brand_name || '-'}</span>
                    </div>
                    <span className="ranking-badge">
                      {item.total_quantity}x
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">Belum ada data barang</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
