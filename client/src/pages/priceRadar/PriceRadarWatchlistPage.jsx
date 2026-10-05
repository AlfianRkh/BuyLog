import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Target, 
  PlusCircle, 
  RotateCw, 
  Search, 
  Filter, 
  Flame, 
  Store, 
  ExternalLink, 
  CheckCircle2, 
  TrendingDown, 
  Edit,
  BarChart2
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

export default function PriceRadarWatchlistPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);
  const [addWatchlistModalOpen, setAddWatchlistModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getWatchlist({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      });
      setProducts(res.items || []);
    } catch (err) {
      console.error('Failed fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      fetchWatchlist();
      showToast("Sinyal radar harga berhasil dikalibrasi!");
    }, 800);
  };

  return (
    <div className="pr-container">
      {/* Toast Alert */}
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

      {/* Header */}
      <div className="pr-header">
        <div className="pr-title-group">
          <h1 className="pr-page-title">
            <Eye size={28} className="pr-[#2563eb]" />
            <span>Katalog Watchlist Produk</span>
          </h1>
          <p className="pr-page-subtitle">
            Daftar produk yang sedang dipantau secara real-time antar platform e-commerce & retail offline.
          </p>
        </div>

        <div className="pr-actions-group">
          <button onClick={handleRefresh} className="pr-btn-secondary">
            <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh Sinyal</span>
          </button>
          <button onClick={() => setAddWatchlistModalOpen(true)} className="pr-btn-primary">
            <PlusCircle size={18} />
            <span>Tambah Produk Watchlist</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="pr-filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'pr-btn-primary' : 'pr-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            👀 Semua Dipantau
          </button>
          <button
            onClick={() => setStatusFilter('hit')}
            className={statusFilter === 'hit' ? 'pr-btn-primary' : 'pr-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: statusFilter === 'hit' ? 'var(--success-600)' : '#ffffff', color: statusFilter === 'hit' ? '#ffffff' : 'var(--success-600)', borderColor: 'var(--success-500)' }}
          >
            🎯 Target Hit ({products.filter(p => p.status === 'hit').length})
          </button>
          <button
            onClick={() => setStatusFilter('watching')}
            className={statusFilter === 'watching' ? 'pr-btn-primary' : 'pr-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Memburu Diskon
          </button>
        </div>

        <div className="pr-search-input">
          <Search size={16} color="var(--gray-400)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, brand, toko..."
            type="text"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="pr-grid-3">
        {products.map((p) => {
          const isHit = p.status === 'hit';

          return (
            <div key={p.id} className="pr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', borderLeft: isHit ? '4px solid var(--success-500)' : '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {isHit ? (
                    <span className="pr-tag-hit"><Target size={12} /> TARGET HIT</span>
                  ) : (
                    <span className="pr-tag-watching"><Eye size={12} /> DIPANTAU</span>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>
                    SCORE {p.deal_score || '7.5'}
                  </span>
                </div>

                <Link to={p.slug ? `/priceradar/produk/${p.slug}` : `/priceradar/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '14px' }}>
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80'} alt={p.title} style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{p.brand || 'Brand'} • {p.category}</span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: '1.3' }}>{p.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.store_name || 'Tokopedia'}</span>
                  </div>
                </Link>

                <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', border: '1px solid var(--gray-200)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Harga Terkini</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isHit ? 'var(--success-600)' : 'var(--gray-900)' }}>{formatRupiah(p.current_price)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Target Beli</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-600)' }}>{formatRupiah(p.target_price)}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' }}>
                {isHit ? (
                  <a href="https://tokopedia.com" target="_blank" rel="noopener noreferrer" className="pr-btn-primary" style={{ flex: 1, backgroundColor: 'var(--success-600)', justifyContent: 'center', textDecoration: 'none' }}>
                    <span>Beli Sekarang</span>
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <button onClick={() => { setSelectedProductId(p.id); setQuickLogModalOpen(true); }} className="pr-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Edit size={15} />
                    <span>Log Harga</span>
                  </button>
                )}
                <Link to={p.slug ? `/priceradar/produk/${p.slug}` : `/priceradar/produk/${p.id}`} className="pr-btn-secondary" style={{ padding: '8px 12px', textDecoration: 'none' }}>
                  <BarChart2 size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => setQuickLogModalOpen(false)}
        initialProductId={selectedProductId}
        onSuccess={(msg) => { showToast(msg); fetchWatchlist(); }}
      />
      <AddWatchlistModal
        isOpen={addWatchlistModalOpen}
        onClose={() => setAddWatchlistModalOpen(false)}
        onSuccess={(msg) => { showToast(msg); fetchWatchlist(); }}
      />
    </div>
  );
}
