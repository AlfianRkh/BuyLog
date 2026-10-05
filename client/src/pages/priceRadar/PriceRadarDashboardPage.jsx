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
  const [quickProduct, setQuickProduct] = useState('logitech');
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
    } catch (err) {
      console.error('Failed fetching PriceRadar dashboard:', err);
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
      showToast(`Data harga Rp ${quickPrice} berhasil direkam ke riwayat telemetri!`);
      fetchDashboard();
    } catch (err) {
      showToast('Gagal mencatat log harga.');
    }
  };

  const kpis = data?.kpis || {
    totalWatching: 14,
    targetHits: 3,
    avgDealScore: '7.2',
    potentialSavings: 2450000
  };

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
              <span>Live Radar Feed · Oktober 2026</span>
            </span>
          </div>
          <h1 className="pr-page-title">
            <Radar size={28} className="pr-[#2563eb]" />
            <span>Dashboard PriceRadar</span>
          </h1>
          <p className="pr-page-subtitle">
            Pantau fluktuasi harga marketplace, deteksi deal terbaik, dan raih target belanja hemat secara presisi.
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
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>+2 Pekan Ini</span>
            <span>100% Active Scans</span>
          </div>
        </Link>

        <Link to="/priceradar/watchlist" className="pr-kpi-card" style={{ textDecoration: 'none', borderLeft: '4px solid var(--success-500)' }}>
          <div className="pr-kpi-header">
            <div>
              <div className="pr-kpi-label" style={{ color: 'var(--success-600)' }}>Target Hits</div>
              <div className="pr-kpi-value" style={{ color: 'var(--success-600)' }}>0{kpis.targetHits} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Item</span></div>
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
            <span style={{ color: 'var(--gray-500)' }}>Top 10% Market</span>
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
            <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Across 3 stores</span>
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
              <span className="pr-tag-hit">3 READY</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>Harga pasar saat ini berada tepat atau di bawah target beli yang Anda tentukan.</p>
          </div>
        </div>
        <Link to="/priceradar/watchlist" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', textDecoration: 'none' }}>
          <span>Lihat Target Hit</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Target Hit 3 Cards Grid */}
      <div className="pr-grid-3">
        {/* Item 1 */}
        <div className="pr-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <span className="pr-tag-hit"><Flame size={12} /> ALL-TIME LOW</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: 'var(--success-50)', padding: '2px 8px', borderRadius: '4px' }}>SCORE 9.6</span>
            </div>
            <Link to="/priceradar/produk/logitech-g-pro-x-2" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '12px' }}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXhF515NNFsn78IP3MarYdbMrAeGDReHdeRSnAxuyeP1vXsIUjPHgxFZpPOWADh93rPxOvewK69KWc0BaVoNLGnYwMZmowgwXO1JtDAu4N4CZo4s1-XPe3_r9437acEcjzP8w0Qpl_GWCDMeLacyqtpa_IduUHRmVF8kuvSABl3aMbQorwet6lkzHU3e0rV-ggsGzpg-_Y-HGaXcXIFBVG9yjihhblPVP_Xne6_aYeUQflRUQjqblR0w" alt="Logitech" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>Tokopedia Official</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>Logitech G Pro X 2 Lightspeed</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Target: {formatRupiah(3000000)}</span>
              </div>
            </Link>
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gray-200)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Harga Sekarang</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-600)' }}>{formatRupiah(2890000)}</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>Hemat 110k</span>
            </div>
          </div>
          <a href="https://tokopedia.com" target="_blank" rel="noopener noreferrer" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', justifyContent: 'center', textDecoration: 'none' }}>
            <span>Beli di Tokopedia</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Item 2 */}
        <div className="pr-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <span className="pr-tag-hit">GREAT DEAL</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: 'var(--success-50)', padding: '2px 8px', borderRadius: '4px' }}>SCORE 8.8</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrO-ZCTKVipEML4BkI5usUzOZjfB6jvWeKJA_aStbq1S_nOfZnC11xrewp_m_VBmd0RqNHnNVx3J-QeBazwixSLUhbRLZN7aUJdiWZ95a4Jk6QrPMKVoL9FAB3WTCQa0VVIzCwa9y2SaYZr12Zzo1Pms_u1uKuhj8mVt7DsAe-UIokU8Ss7fEtdxGcvkpC1q6cbhgi5Y-yQfZjJYFAc_frdMp7Oddr4JqeWMG4NybaIin4gq3WI4s_jA" alt="Bimoli" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>Indomaret Klik</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>Bimoli Minyak Goreng 2L (Isi 2)</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Target: {formatRupiah(72000)}</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gray-200)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Harga Sekarang</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-600)' }}>{formatRupiah(68500)}</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>Hemat 3.5k</span>
            </div>
          </div>
          <a href="https://klikindomaret.com" target="_blank" rel="noopener noreferrer" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', justifyContent: 'center', textDecoration: 'none' }}>
            <span>Beli di Indomaret</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Item 3 */}
        <div className="pr-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <span className="pr-tag-hit">GREAT DEAL</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: 'var(--success-50)', padding: '2px 8px', borderRadius: '4px' }}>SCORE 9.2</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ4dRe2p7B2v-g_fz9CkX-amElEm5hrsUHlArwlVwmLOUGwKHDL2m4oGN-1XN4r4C24ffsXmu7jm75jvi942sqxaavQthFgqbsnIk3yslb2EZG_dQEHlZbxO-gRdvzhcxs8TXUHs9--lsPEl09S-PvvcKIY-g3qH-L_h4VvSyMAw7gegHVULQGfgClqQlXOlyQnHix6RdgopYzb2b1QvsclNZeqh7dhH2VlprYhN9LiWDE6dktEgwrQ" alt="Sony XM5" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>Shopee Mall</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>Sony WH-1000XM5 ANC</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Target: {formatRupiah(4600000)}</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gray-200)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Harga Sekarang</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-600)' }}>{formatRupiah(4599000)}</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>Hemat 1k</span>
            </div>
          </div>
          <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer" className="pr-btn-primary" style={{ backgroundColor: 'var(--success-600)', justifyContent: 'center', textDecoration: 'none' }}>
            <span>Beli di Shopee</span>
            <ExternalLink size={16} />
          </a>
        </div>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>FAST TELEMETRY INGESTION</span>
          </div>

          <form onSubmit={handleQuickSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', uppercase: 'true' }}>PILIH PRODUK</label>
              <select
                value={quickProduct}
                onChange={(e) => setQuickProduct(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.875rem', color: 'var(--gray-800)', outline: 'none' }}
              >
                <option value="logitech">Logitech G Pro X 2</option>
                <option value="bimoli">Bimoli Pouch 2L (Isi 2)</option>
                <option value="sony">Sony WH-1000XM5</option>
                <option value="s24">Samsung Galaxy S24 Ultra</option>
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
              <span>Simpan Log</span>
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
