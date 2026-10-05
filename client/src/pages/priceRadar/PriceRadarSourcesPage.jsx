import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  PlusCircle,
  Grid,
  List,
  ShoppingBag,
  Database,
  Award,
  AlertTriangle,
  ExternalLink,
  Edit,
  History,
  Sparkles,
  Building
} from 'lucide-react';
import api from '../../services/api';
import AddPlatformModal from '../../components/priceRadar/AddPlatformModal';
import './PriceRadarSourcesPage.css';

export default function PriceRadarSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getSources({ category: filterCategory });
      setSources(res.sources || []);
    } catch (err) {
      console.error('Failed fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [filterCategory]);

  const defaultPlatforms = [
    {
      name: "Tokopedia",
      type: "MARKETPLACE",
      catKey: "marketplace",
      url: "https://tokopedia.com",
      displayUrl: "tokopedia.com",
      badge: "5x Best Deal Saat Ini",
      winRate: "WIN RATE 42%",
      priceLogs: "32 Entri",
      monitored: "11 Produk",
      activity: "Sangat Aktif"
    },
    {
      name: "Shopee",
      type: "MARKETPLACE",
      catKey: "marketplace",
      url: "https://shopee.co.id",
      displayUrl: "shopee.co.id",
      badge: "3x Best Deal Aktif",
      winRate: "WIN RATE 33%",
      priceLogs: "28 Entri",
      monitored: "9 Produk",
      activity: "Aktif"
    },
    {
      name: "Blibli",
      type: "E-COMMERCE",
      catKey: "marketplace",
      url: "https://blibli.com",
      displayUrl: "blibli.com",
      badge: "1x Best Deal Aktif",
      winRate: "WIN RATE 18%",
      priceLogs: "14 Entri",
      monitored: "6 Produk",
      activity: "Moderat"
    },
    {
      name: "Klik Indomaret / Alfa",
      type: "GROCERY & TOKO",
      catKey: "grocery",
      url: "https://klikindomaret.com",
      displayUrl: "klikindomaret.com",
      badge: "Kategori Groceries",
      winRate: "SEMBAKO & FMCG",
      priceLogs: "5 Entri",
      monitored: "3 Produk",
      activity: "Berkala"
    },
    {
      name: "iBox / Digimap",
      type: "OFFLINE & ONLINE",
      catKey: "offline",
      url: "https://ibox.co.id",
      displayUrl: "ibox.co.id",
      badge: "Apple Authorized",
      winRate: "SRP REFERENCE",
      priceLogs: "3 Entri",
      monitored: "2 Gadget",
      activity: "Stabil (SRP)"
    },
    {
      name: "Harco / Mangga Dua",
      type: "TOKO FISIK",
      catKey: "offline",
      url: "#",
      displayUrl: "Survey Langsung (Offline Store)",
      badge: "Perlu Update Segera",
      winRate: "8 HARI LALU",
      priceLogs: "2 Entri",
      monitored: "GPU / RAM Retail",
      activity: "Kadaluarsa",
      isStale: true
    }
  ];

  const rawList = sources.length > 0 ? sources : defaultPlatforms;
  const displayList = rawList.filter(item => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'marketplace') return item.catKey === 'marketplace' || item.type === 'MARKETPLACE' || item.type === 'E-COMMERCE';
    if (filterCategory === 'offline') return item.catKey === 'offline' || item.type === 'TOKO FISIK' || item.type === 'OFFLINE & ONLINE';
    if (filterCategory === 'grocery') return item.catKey === 'grocery' || item.type === 'GROCERY & TOKO';
    return true;
  });

  return (
    <div className="prs-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1300,
          backgroundColor: 'var(--gray-900)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="prs-header">
        <div className="prs-title-group">
          <div className="prs-meta-tag">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-500)', display: 'inline-block' }}></span>
            <span>Platform Index v1.0</span>
          </div>
          <h1 className="prs-page-title">
            <Store size={26} color="var(--primary-600)" />
            <span>Direktori Sumber & Platform Harga</span>
          </h1>
          <p className="prs-page-subtitle">
            Kelola marketplace, toko online, dan gerai fisik untuk pengorganisasian log harga dan visualisasi grafik perbandingan.
          </p>
        </div>

        <div className="prs-actions-group">
          <div className="prs-view-switcher">
            <button
              onClick={() => setViewMode('grid')}
              className={`prs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={15} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`prs-view-btn ${viewMode === 'compact' ? 'active' : ''}`}
            >
              <List size={15} />
              <span>Dense</span>
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="prs-btn-primary"
          >
            <PlusCircle size={18} />
            <span>Tambah Sumber Baru</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="prs-kpi-grid">
        <div className="prs-kpi-card">
          <div className="prs-kpi-header">
            <span className="prs-kpi-label">Total Platform</span>
            <div className="prs-kpi-icon-box">
              <Store size={20} />
            </div>
          </div>
          <div>
            <div className="prs-kpi-value">6 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Sumber</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>4 Online / 2 Offline</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>100% Aktif</span>
          </div>
        </div>

        <div className="prs-kpi-card">
          <div className="prs-kpi-header">
            <span className="prs-kpi-label">Total Price Logs</span>
            <div className="prs-kpi-icon-box" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Database size={20} />
            </div>
          </div>
          <div>
            <div className="prs-kpi-value" style={{ color: 'var(--primary-600)' }}>84 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Entri</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>+14 Entri Pekan Ini</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>↑ 18.2%</span>
          </div>
        </div>

        <div className="prs-kpi-card">
          <div className="prs-kpi-header">
            <span className="prs-kpi-label">Top Deal Winner</span>
            <div className="prs-kpi-icon-box" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <Award size={20} />
            </div>
          </div>
          <div>
            <div className="prs-kpi-value" style={{ color: 'var(--success-600)' }}>Tokopedia <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success-700)' }}>(42%)</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>5x Best Deal Aktif</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>Dominan Tech</span>
          </div>
        </div>

        <div className="prs-kpi-card" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}>
          <div className="prs-kpi-header">
            <span className="prs-kpi-label" style={{ color: 'var(--danger-700)' }}>Status Data Stale</span>
            <div className="prs-kpi-icon-box" style={{ backgroundColor: '#FEE2E2', color: 'var(--danger-600)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="prs-kpi-value" style={{ color: 'var(--danger-600)' }}>1 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--danger-500)' }}>Perlu Update</span></div>
          </div>
          <div className="prs-kpi-footer" style={{ borderTopColor: '#FCA5A5' }}>
            <span style={{ color: 'var(--gray-600)' }}>Harco Komputer</span>
            <button style={{ color: 'var(--danger-700)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => showToast("Fokus ke Harco Mangga Dua")}>Cek Sekarang</button>
          </div>
        </div>
      </div>

      {/* Catalog Filter & Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="prs-catalog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Katalog Platform Terhubung</h2>
            <span style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{displayList.length} TOTAL</span>
          </div>

          <div className="prs-filter-pills">
            {[
              { id: "all", label: "Semua" },
              { id: "marketplace", label: "Marketplace (3)" },
              { id: "offline", label: "Retail Offline (2)" },
              { id: "grocery", label: "Groceries (1)" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`prs-filter-pill ${filterCategory === f.id ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className={viewMode === "compact" ? "" : "prs-cards-grid"} style={viewMode === "compact" ? { display: 'flex', flexDirection: 'column', gap: '12px' } : {}}>
          {displayList.map((p, idx) => (
            <div
              key={idx}
              className={`prs-card ${p.isStale ? 'prs-card-stale' : ''}`}
            >
              <div>
                <div className="prs-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div className="prs-store-icon" style={p.isStale ? { backgroundColor: '#FEE2E2', color: 'var(--danger-600)', borderColor: '#FCA5A5' } : {}}>
                      {p.isStale ? <Building size={24} /> : <ShoppingBag size={24} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div className="prs-store-title">
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                        {!p.isStale && <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0 }} />}
                      </div>
                      <span className="prs-store-url">{p.displayUrl || p.url}</span>
                    </div>
                  </div>
                  <span className="prs-badge-type" style={p.isStale ? { backgroundColor: '#FEE2E2', color: 'var(--danger-700)', borderColor: '#FCA5A5' } : {}}>
                    {p.type}
                  </span>
                </div>

                <div className="prs-badge-box" style={{ marginTop: '14px', backgroundColor: p.isStale ? '#FEF2F2' : 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: p.isStale ? 'var(--danger-700)' : 'var(--gray-800)' }}>
                    {p.isStale ? <AlertTriangle size={16} color="var(--danger-600)" /> : <Award size={16} color="var(--primary-600)" />}
                    <span>{p.badge || 'Official Store'}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gray-900)', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
                    {p.winRate || 'WIN RATE 20%'}
                  </span>
                </div>

                <div className="prs-stats-row" style={{ marginTop: '12px' }}>
                  <div className="prs-stat-box">
                    <span className="prs-stat-box-label">PRICE LOGS</span>
                    <span className="prs-stat-box-value">{p.priceLogs || '12 Entri'}</span>
                  </div>
                  <div className="prs-stat-box">
                    <span className="prs-stat-box-label">STATUS</span>
                    <span className="prs-stat-box-value" style={{ color: 'var(--primary-600)' }}>{p.monitored || 'Aktif'}</span>
                  </div>
                </div>
              </div>

              <div className="prs-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => showToast(`Edit ${p.name}`)} className="prs-btn-secondary">
                    <Edit size={14} color="var(--gray-500)" /> Edit
                  </button>
                  <button onClick={() => showToast(`Log riwayat ${p.name}`)} className="prs-btn-secondary">
                    <History size={14} color="var(--primary-600)" /> Log
                  </button>
                </div>

                <a className="prs-btn-primary" style={{ padding: '7px 14px', fontSize: '0.75rem', textDecoration: 'none' }} href={p.url || '#'} target="_blank" rel="noopener noreferrer">
                  <span>Buka Toko</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Intelligence Tips Panel */}
      <div className="prs-tips-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-700)' }}>
            <Sparkles size={22} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)' }}>Tips Efektif Price Tracking</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.5 }}>
            Maksimalkan sensitivitas radar Anda. Mengatur konsistensi input sumber memastikan formula Deal Score menghasilkan keputusan beli yang akurat dan mencegah pembelian impulsif semu.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '4px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE', display: 'flex', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                01
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>Catat Harga Nett Setelah Voucher Toko</strong>
                <span style={{ fontSize: '0.775rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  Selalu prioritaskan harga akhir setelah potongan voucher diskon merchant untuk kalkulasi Deal Score yang presisi.
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0', display: 'flex', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-100)', color: 'var(--success-700)', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                02
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>Lampirkan Tautan Langsung Produk</strong>
                <span style={{ fontSize: '0.775rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  Manfaatkan kolom Base URL dan URL SKU per produk agar ketika Target Hit terpicu, Anda dapat langsung mengeksekusi pembelian.
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', display: 'flex', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', color: 'var(--danger-700)', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                03
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>Siklus Kalibrasi Minimal 1x Sepekan</strong>
                <span style={{ fontSize: '0.775rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  Sistem menandai sumber yang tidak diperbarui selama &gt;7 hari sebagai <strong style={{ color: 'var(--danger-600)' }}>STALE</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddPlatformModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(msg) => { showToast(msg); fetchSources(); }}
      />
    </div>
  );
}
