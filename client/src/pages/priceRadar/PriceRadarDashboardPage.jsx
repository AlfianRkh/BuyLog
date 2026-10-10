import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Radar, 
  Eye, 
  Target, 
  Flame, 
  Wallet, 
  PlusCircle, 
  ExternalLink, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Filter, 
  Store, 
  Zap,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import QuickLogModal from '../../components/priceRadar/QuickLogModal';
import AddWatchlistModal from '../../components/priceRadar/AddWatchlistModal';
import './PriceRadarPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function PriceRadarDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);
  const [addWatchlistModalOpen, setAddWatchlistModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Quick log inline state
  const [quickProduct, setQuickProduct] = useState('');
  const [quickPlatform, setQuickPlatform] = useState('Tokopedia');
  const [quickPrice, setQuickPrice] = useState('2.850.000');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getDashboard();
      setData(res);
      if (res && res.topDeals && res.topDeals.length > 0) {
        setQuickProduct(res.topDeals[0].title);
      }
    } catch (err) {
      console.error('Failed fetching PriceRadar dashboard from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanPrice = parseFloat(quickPrice.replace(/[^0-9]/g, ''));
      await api.priceRadar.recordLog({
        platform_name: quickPlatform,
        price: cleanPrice,
        notes: `Quick Log: ${quickProduct}`
      });
      showToast(`Data harga Rp ${quickPrice} berhasil direkam ke riwayat telemetri di Database!`);
      fetchDashboard();
    } catch (err) {
      showToast('Gagal mencatat log harga ke Database.');
    }
  };

  const kpis = data?.kpis || {
    totalWatching: 0,
    targetHits: 0,
    avgDealScore: '0.0',
    potentialSavings: 0
  };

  const hitProducts = (data?.targetHitProducts && data.targetHitProducts.length > 0) 
    ? data.targetHitProducts 
    : (data?.topDeals || []);

  const filteredHitProducts = selectedCategory === 'all' 
    ? hitProducts 
    : hitProducts.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="pr-container">
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
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} color="var(--success-500)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="pr-header">
        <div className="pr-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pr-badge-live">
              <Zap size={13} />
              <span>Live Database Feed · PriceRadar</span>
            </span>
          </div>
          <h1 className="pr-page-title">
            <Radar size={28} className="pr-[#2563eb]" />
            <span>Dashboard PriceRadar</span>
          </h1>
          <p className="pr-page-subtitle">
            Pantau fluktuasi harga marketplace, deteksi deal terbaik, dan raih target belanja hemat secara presisi dari Database.
          </p>
        </div>

        <div className="pr-actions-group">
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#ffffff', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'pr-btn-primary' : 'pr-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Filter size={14} />
              <span>Semua</span>
            </button>
            <button
              onClick={() => setSelectedCategory('elektronik')}
              className={selectedCategory === 'elektronik' ? 'pr-btn-primary' : 'pr-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Elektronik
            </button>
            <button
              onClick={() => setSelectedCategory('groceries')}
              className={selectedCategory === 'groceries' ? 'pr-btn-primary' : 'pr-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Groceries
            </button>
          </div>
          <button onClick={() => setAddWatchlistModalOpen(true)} className="pr-btn-primary">
            <PlusCircle size={18} />
            <span>Tambah Target Beli</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="pr-kpi-grid">
        <Link to="/priceradar/watchlist" className="pr-kpi-card" style={{ textDecoration: 'none' }}>
          <div className="pr-kpi-header">
            <div>
              <div className="pr-kpi-label">Total Watching</div>
              <div className="pr-kpi-value">{kpis.totalWatching} <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Produk</span></div>
            </div>
            <div className="pr-kpi-icon-box">
              <Eye size={22} />
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>Database Active</span>
            <span>100% Real Time</span>
          </div>
        </Link>

        <Link to="/priceradar/watchlist" className="pr-kpi-card" style={{ textDecoration: 'none', borderLeft: '4px solid var(--success-500)' }}>
          <div className="pr-kpi-header">
            <div>
              <div className="pr-kpi-label" style={{ color: 'var(--success-600)' }}>Target Hits</div>
              <div className="pr-kpi-value" style={{ color: 'var(--success-600)' }}>{kpis.targetHits} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Item</span></div>
            </div>
            <div className="pr-kpi-icon-box" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <Target size={22} />
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>SIAP DIBELI!</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>Action Req.</span>
          </div>
        </Link>

        <div className="pr-kpi-card">
          <div className="pr-kpi-header">
            <div>
              <div className="pr-kpi-label">Avg Deal Score</div>
              <div className="pr-kpi-value">{kpis.avgDealScore} <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>/ 10</span></div>
            </div>
            <div className="pr-kpi-icon-box" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)' }}>
              <Flame size={22} />
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span style={{ color: 'var(--warning-600)', fontWeight: 700 }}>GREAT VALUE</span>
            <span style={{ color: 'var(--gray-500)' }}>Real DB Score</span>
          </div>
        </div>

        <Link to="/priceradar/statistik" className="pr-kpi-card" style={{ textDecoration: 'none' }}>
          <div className="pr-kpi-header">
            <div>
              <div className="pr-kpi-label">Potensi Hemat</div>
              <div className="pr-kpi-value" style={{ color: 'var(--primary-600)', fontSize: '1.4rem' }}>{formatRupiah(kpis.potentialSavings)}</div>
            </div>
            <div className="pr-kpi-icon-box">
              <Wallet size={22} />
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>AKUMULASI DISKON</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Database Calculated</span>
          </div>
        </Link>
      </div>

      {/* Target Hit Alert Banner */}
      <div className="pr-alert-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-500)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyCenter: 'center', shrink: 0 }}>
            <Target size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Saatnya Beli! Target Hit Alert</h3>
              <span className="pr-tag-hit">{kpis.targetHits} READY</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>Harga pasar saat ini berada tepat atau di bawah target beli yang Anda tentukan di Database.</p>
          </div>
        </div>
        <Link to="/priceradar/watchlist" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', textDecoration: 'none' }}>
          <span>Lihat Target Hit</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Target Hit Cards Grid */}
      <div className="pr-grid-3">
        {filteredHitProducts.length === 0 ? (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '30px', color: 'var(--gray-500)', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            Belum ada produk target hit di database. Silakan tambah target beli baru.
          </div>
        ) : (
          filteredHitProducts.slice(0, 3).map((item) => {
            const savings = Math.max(0, (parseFloat(item.target_price) || 0) - (parseFloat(item.current_price) || 0));
            return (
              <div key={item.id} className="pr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="pr-tag-hit">
                      {item.is_atl ? <><Flame size={12} /> ALL-TIME LOW</> : 'GREAT DEAL'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: 'var(--success-50)', padding: '2px 8px', borderRadius: '4px' }}>
                      SCORE {item.deal_score || '8.5'}
                    </span>
                  </div>
                  <Link to={`/priceradar/produk/${item.slug || item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '12px' }}>
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>{item.store_name || 'Tokopedia'}</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Target: {formatRupiah(item.target_price)}</span>
                    </div>
                  </Link>
                  <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gray-200)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Harga Sekarang</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-600)' }}>{formatRupiah(item.current_price)}</div>
                    </div>
                    {savings > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                        Hemat {formatRupiah(savings)}
                      </span>
                    )}
                  </div>
                </div>
                <a href={item.url || 'https://tokopedia.com'} target="_blank" rel="noopener noreferrer" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', justifyContent: 'center', textDecoration: 'none' }}>
                  <span>Beli di {item.store_name || 'Marketplace'}</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            );
          })
        )}
      </div>

      {/* Mid Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Quick Log Form Ingestion */}
        <div style={{ gridColumn: 'span 12 / span 12' }} className="pr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Quick Log Harga Manual</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>DATABASE TELEMETRY INGESTION</span>
          </div>

          <form onSubmit={handleQuickSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)' }}>PILIH PRODUK</label>
              <select
                value={quickProduct}
                onChange={(e) => setQuickProduct(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.875rem', color: 'var(--gray-800)', outline: 'none' }}
              >
                {(data?.topDeals || data?.targetHitProducts || []).map(p => (
                  <option key={p.id} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)' }}>SUMBER PASAR</label>
              <select
                value={quickPlatform}
                onChange={(e) => setQuickPlatform(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.875rem', color: 'var(--gray-800)', outline: 'none' }}
              >
                <option value="Tokopedia">Tokopedia</option>
                <option value="Shopee">Shopee</option>
                <option value="Blibli">Blibli</option>
                <option value="Indomaret">Toko Offline / Fisik</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)' }}>HARGA DITEMUKAN</label>
              <input
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.875rem', color: 'var(--gray-800)', outline: 'none' }}
                placeholder="2.850.000"
                type="text"
              />
            </div>

            <button type="submit" className="pr-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <PlusCircle size={16} />
              <span>Simpan Log di DB</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => setQuickLogModalOpen(false)}
        onSuccess={(msg) => { showToast(msg); fetchDashboard(); }}
      />
      <AddWatchlistModal
        isOpen={addWatchlistModalOpen}
        onClose={() => setAddWatchlistModalOpen(false)}
        onSuccess={(msg) => { showToast(msg); fetchDashboard(); }}
      />
    </div>
  );
}
