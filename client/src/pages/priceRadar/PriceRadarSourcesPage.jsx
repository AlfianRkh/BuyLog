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
import QuickLogModal from '../../components/priceRadar/QuickLogModal';
import './PriceRadarSourcesPage.css';

export default function PriceRadarSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logSource, setLogSource] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getSources({});
      setSources(res.sources || []);
    } catch (err) {
      console.error('Failed fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const getCategoryKey = (item) => {
    const t = (item.type || '').toUpperCase();
    if (item.catKey) return item.catKey;
    if (t.includes('MARKET') || t.includes('ECOMMERCE') || t.includes('E-COMMERCE') || t.includes('ONLINE') || t.includes('OFFICIAL_BRAND')) return 'marketplace';
    if (t.includes('FISIK') || t.includes('OFFLINE') || t.includes('RETAIL') || t.includes('OFFLINE_RETAIL')) return 'offline';
    if (t.includes('GROCERY') || t.includes('FMCG') || t.includes('TOKO')) return 'grocery';
    return 'marketplace';
  };

  const marketplaceCount = sources.filter(s => getCategoryKey(s) === 'marketplace').length;
  const offlineCount = sources.filter(s => getCategoryKey(s) === 'offline').length;
  const groceryCount = sources.filter(s => getCategoryKey(s) === 'grocery').length;

  const displayList = sources.filter(item => {
    if (filterCategory === 'all') return true;
    return getCategoryKey(item) === filterCategory;
  });

  const totalLogsCount = sources.reduce((sum, s) => sum + (parseInt(s.price_logs_count) || 0), 0);
  const staleCount = sources.filter(s => s.is_stale || s.isStale).length;
  const topWinner = sources.length > 0 ? sources[0].name : '-';
  const topWinnerRate = sources.length > 0 ? (sources[0].win_rate !== undefined ? `${sources[0].win_rate}%` : (sources[0].winRate || '0%')) : '0%';

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
            <span>Platform Database Index</span>
          </div>
          <h1 className="prs-page-title">
            <Store size={26} color="var(--primary-600)" />
            <span>Direktori Sumber &amp; Platform Harga</span>
          </h1>
          <p className="prs-page-subtitle">
            Kelola marketplace, toko online, dan gerai fisik secara riil dari database PostgreSQL.
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
            onClick={() => {
              setEditSource(null);
              setAddModalOpen(true);
            }}
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
            <div className="prs-kpi-value">{sources.length} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Sumber</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>Database Registered</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>100% Active</span>
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
            <div className="prs-kpi-value" style={{ color: 'var(--primary-600)' }}>{totalLogsCount} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Entri</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>Database Records</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>Active Logs</span>
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
            <div className="prs-kpi-value" style={{ color: 'var(--success-600)' }}>{topWinner} <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success-700)' }}>({topWinnerRate})</span></div>
          </div>
          <div className="prs-kpi-footer">
            <span>Best Win Rate</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>Database Ranking</span>
          </div>
        </div>

        <div className="prs-kpi-card" style={{ borderColor: staleCount > 0 ? '#FCA5A5' : 'var(--gray-200)', backgroundColor: staleCount > 0 ? '#FEF2F2' : '#ffffff' }}>
          <div className="prs-kpi-header">
            <span className="prs-kpi-label" style={{ color: staleCount > 0 ? 'var(--danger-700)' : 'var(--gray-600)' }}>Status Data Stale</span>
            <div className="prs-kpi-icon-box" style={{ backgroundColor: staleCount > 0 ? '#FEE2E2' : 'var(--gray-100)', color: staleCount > 0 ? 'var(--danger-600)' : 'var(--gray-600)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="prs-kpi-value" style={{ color: staleCount > 0 ? 'var(--danger-600)' : 'var(--gray-800)' }}>{staleCount} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Perlu Update</span></div>
          </div>
          <div className="prs-kpi-footer" style={{ borderTopColor: staleCount > 0 ? '#FCA5A5' : 'var(--gray-100)' }}>
            <span style={{ color: 'var(--gray-600)' }}>{staleCount > 0 ? 'Harco Komputer' : 'Data Terkini'}</span>
            {staleCount > 0 && (
              <button style={{ color: 'var(--danger-700)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => showToast("Fokus update data stale")}>Cek Sekarang</button>
            )}
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
              { id: "marketplace", label: `Marketplace (${marketplaceCount})` },
              { id: "offline", label: `Retail Offline (${offlineCount})` },
              { id: "grocery", label: `Groceries (${groceryCount})` }
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
          {displayList.map((p, idx) => {
            const isItemStale = p.is_stale || p.isStale;
            const badgeLabel = p.badge || p.notes || (p.type === 'OFFICIAL_BRAND' || p.type === 'MARKETPLACE' ? 'Official Store' : 'Verified Store');
            const winRateText = p.win_rate !== undefined && p.win_rate !== null ? (String(p.win_rate).includes('%') ? `WIN RATE ${p.win_rate}` : `WIN RATE ${p.win_rate}%`) : (p.winRate || 'WIN RATE 20%');
            const priceLogsText = p.price_logs_count !== undefined && p.price_logs_count !== null ? `${p.price_logs_count} Entri` : (p.priceLogs || '0 Entri');
            const statusText = p.activity_status || p.monitored || (isItemStale ? 'Stale' : 'Aktif');

            return (
              <div
                key={idx}
                className={`prs-card ${isItemStale ? 'prs-card-stale' : ''}`}
              >
                <div>
                  <div className="prs-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div className="prs-store-icon" style={isItemStale ? { backgroundColor: '#FEE2E2', color: 'var(--danger-600)', borderColor: '#FCA5A5' } : {}}>
                        {isItemStale ? <Building size={24} /> : <ShoppingBag size={24} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div className="prs-store-title">
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                          {!isItemStale && <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0 }} />}
                        </div>
                        <span className="prs-store-url">{p.displayUrl || p.url || '-'}</span>
                      </div>
                    </div>
                    <span className="prs-badge-type" style={isItemStale ? { backgroundColor: '#FEE2E2', color: 'var(--danger-700)', borderColor: '#FCA5A5' } : {}}>
                      {p.type}
                    </span>
                  </div>

                  <div className="prs-badge-box" style={{ marginTop: '14px', backgroundColor: isItemStale ? '#FEF2F2' : 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: isItemStale ? 'var(--danger-700)' : 'var(--gray-800)' }}>
                      {isItemStale ? <AlertTriangle size={16} color="var(--danger-600)" /> : <Award size={16} color="var(--primary-600)" />}
                      <span>{badgeLabel}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--gray-900)', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
                      {winRateText}
                    </span>
                  </div>

                  <div className="prs-stats-row" style={{ marginTop: '12px' }}>
                    <div className="prs-stat-box">
                      <span className="prs-stat-box-label">PRICE LOGS</span>
                      <span className="prs-stat-box-value">{priceLogsText}</span>
                    </div>
                    <div className="prs-stat-box">
                      <span className="prs-stat-box-label">STATUS</span>
                      <span className="prs-stat-box-value" style={{ color: 'var(--primary-600)' }}>{statusText}</span>
                    </div>
                  </div>
                </div>

                <div className="prs-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditSource(p);
                        setAddModalOpen(true);
                      }}
                      className="prs-btn-secondary"
                    >
                      <Edit size={14} color="var(--gray-500)" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setLogSource(p);
                        setLogModalOpen(true);
                      }}
                      className="prs-btn-secondary"
                    >
                      <History size={14} color="var(--primary-600)" /> Log
                    </button>
                  </div>

                  <a className="prs-btn-primary" style={{ padding: '7px 14px', fontSize: '0.75rem', textDecoration: 'none' }} href={p.url || '#'} target="_blank" rel="noopener noreferrer">
                    <span>Buka Toko</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
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
        onClose={() => {
          setAddModalOpen(false);
          setEditSource(null);
        }}
        initialData={editSource}
        onSuccess={(msg) => { showToast(msg); fetchSources(); }}
      />

      <QuickLogModal
        isOpen={logModalOpen}
        onClose={() => {
          setLogModalOpen(false);
          setLogSource(null);
        }}
        initialPlatform={logSource?.name || ''}
        onSuccess={(msg) => { showToast(msg); fetchSources(); }}
      />
    </div>
  );
}
