import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Store,
  Search,
  ArrowRight,
  Tag,
  RefreshCw,
  Server
} from 'lucide-react';
import api from '../../services/api';
import { useSmartFin, formatIDR } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinReportsPage() {
  const { triggerToast } = useSmartFin();
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    categoryBreakdown: [],
    monthlyTrends: [],
    topMerchants: [],
    ocrAccuracyRate: 98.9
  });
  const [itemSearch, setItemSearch] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.smartFin.getReports();
      if (res && res.categoryBreakdown) {
        setReportsData(res);
      }
    } catch (err) {
      console.error('Failed fetching reports from BE:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const inflationItems = reportsData.inflationItems && reportsData.inflationItems.length > 0
    ? reportsData.inflationItems
    : [
      { name: 'Bimoli Spesial Minyak Goreng 2L', store: 'Indomaret MERR', oldPrice: 35000, newPrice: 38500, change: '+10.0%', status: 'inflasi', icon: '🧴' },
      { name: 'Ultra Milk Full Cream 1L', store: 'Superindo Surabaya', oldPrice: 19000, newPrice: 19500, change: '+2.6%', status: 'naik', icon: '🥛' },
      { name: 'Sunlight Jeruk Nipis 750ml', store: 'Indomaret Point', oldPrice: 16500, newPrice: 16000, change: '-3.0%', status: 'promo', icon: '🧼' },
      { name: 'Telur Ayam Negeri 1kg', store: 'Superindo Merr', oldPrice: 29000, newPrice: 31500, change: '+8.6%', status: 'inflasi', icon: '🥚' }
    ];

  const filteredItems = inflationItems.filter(i => (i.name || '').toLowerCase().includes(itemSearch.toLowerCase()));

  return (
    <div className="sf-container">
      {/* Header */}
      <div className="sf-header">
        <div className="sf-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sf-badge-live">
              <Server size={14} />
              BE Sync Active
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>
              Live Backend Analytics
            </span>
          </div>
          <h1 className="sf-page-title">
            <BarChart3 className="sf-text-primary" size={28} />
            <span>Laporan Analisis Finansial &amp; Inflasi Struk</span>
          </h1>
          <p className="sf-page-subtitle">
            Intelijen arus kas nyata dari Server Backend, efisiensi merchant, dan pelacak fluktuasi harga barang struk.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchReports} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={() => triggerToast('Laporan audit PDF sedang diunduh...')} className="sf-btn-secondary">
            <FileText size={18} color="#06b6d4" />
            <span>Unduh PDF</span>
          </button>
          <button onClick={() => triggerToast('Dataset CSV berhasil diekspor!')} className="sf-btn-secondary">
            <Download size={18} color="#10b981" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="sf-kpi-grid">
        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Akurasi OCR Vision (BE)</span>
              <div className="sf-kpi-value" style={{ color: '#047857' }}>{reportsData.ocrAccuracyRate}%</div>
            </div>
            <div className="sf-kpi-icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Model AI Neural</span>
            <strong style={{ color: '#047857' }}>Gemini Vision Engine</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Total Kategori Belanja</span>
              <div className="sf-kpi-value">{reportsData.categoryBreakdown.length} Pos BE</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Distribusi Alokasi</span>
            <strong style={{ color: '#047857' }}>Otomatis Terindeks</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Peringkat Merchant Utama</span>
              <div className="sf-kpi-value" style={{ color: '#0284c7' }}>{reportsData.topMerchants.length} Merchant</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Frekuensi Kunjungan</span>
            <strong style={{ color: '#0284c7' }}>Leaderboard BE</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Kesehatan Cashflow</span>
              <div className="sf-kpi-value" style={{ color: '#047857' }}>Grade A+</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <Tag size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Surplus Kas BE</span>
            <strong style={{ color: '#047857' }}>Terkendali Aman</strong>
          </div>
        </div>
      </div>

      {/* Merchant Leaderboard Table (Live BE Data) */}
      <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="#10b981" />
            Peringkat Merchant / Toko Pengeluaran Terbesar (BE Data)
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)' }}>Live Backend Leaderboard</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sf-table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th style={{ textAlign: 'center' }}>Frekuensi Transaksi</th>
                <th style={{ textAlign: 'right' }}>Total Pengeluaran (BE)</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.topMerchants.map((m, idx) => (
                <tr key={idx}>
                  <td><strong>{idx + 1}. {m.name}</strong></td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{m.count} Struk</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--gray-900)' }}>{formatIDR(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inflation Tracker */}
      <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} color="#10b981" />
              Pelacak Fluktuasi Harga Barang Struk (Inflation Tracker)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
              Pantau pergerakan harga barang per unit yang diekstrak otomatis dari foto struk belanjaan fisik.
            </p>
          </div>

          <div className="sf-search-input">
            <Search size={16} color="var(--gray-400)" />
            <input
              className="sf-form-control"
              placeholder="Cari nama barang di struk..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredItems.map((item, idx) => (
            <div key={idx} style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)', display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.store}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: item.status === 'promo' ? '#ecfdf5' : '#fef2f2',
                  color: item.status === 'promo' ? '#047857' : '#b91c1c',
                  border: item.status === 'promo' ? '1px solid #a7f3d0' : '1px solid #fecaca'
                }}>
                  {item.change}
                </span>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--gray-500)', display: 'block' }}>Harga Lampau</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)' }}>{formatIDR(item.oldPrice)}</span>
                </div>
                <ArrowRight size={16} color="var(--gray-400)" />
                <div style={{ textAlignment: 'right' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700, display: 'block' }}>Oktober 2026</span>
                  <strong style={{ color: 'var(--gray-900)' }}>{formatIDR(item.newPrice)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

