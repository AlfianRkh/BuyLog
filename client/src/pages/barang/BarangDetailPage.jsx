import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';
import { formatRupiah, formatDate, formatPercent } from '../../utils/formatters';
import {
  ArrowLeft,
  Store,
  MapPin,
  TrendingDown,
  TrendingUp,
  History,
  Scale,
  Award,
  Calendar,
  ShoppingBag,
  Plus,
  ArrowRight
} from 'lucide-react';
import './BarangDetailPage.css';

const BarangDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSidebar } = useOutletContext();

  const [activeTab, setActiveTab] = useState('reference'); // 'reference' or 'history'
  const [product, setProduct] = useState(null);
  const [priceRef, setPriceRef] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const [prodRes, refRes, histRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/price-reference`),
        api.get(`/products/${id}/price-history`)
      ]);

      if (prodRes.success) setProduct(prodRes.data);
      if (refRes.success) setPriceRef(refRes.data);
      if (histRes.success) setPriceHistory(refRes.data.price_history || histRes.data);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Detail Barang" onToggleSidebar={toggleSidebar} />
        <div className="page-container text-center py-12">
          Memuat data perbandingan harga...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header title="Detail Barang" onToggleSidebar={toggleSidebar} />
        <div className="page-container text-center py-12">
          <p>Produk tidak ditemukan.</p>
          <Link to="/barang" className="btn btn-primary mt-4">
            Kembali ke Daftar Barang
          </Link>
        </div>
      </div>
    );
  }

  const stores = priceRef?.stores || [];
  const minPrice = priceRef?.min_price || 0;
  const maxPrice = priceRef?.max_price || 0;
  const avgPrice = priceRef?.avg_price || 0;

  return (
    <div>
      <Header
        title={product.name}
        subtitle={`${product.brand_name || 'Tanpa Merk'} ${product.model ? `• Model: ${product.model}` : ''}`}
        onToggleSidebar={toggleSidebar}
        actions={
          <div className="flex-actions">
            <button onClick={() => navigate('/barang')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
            <Link to="/pembelian/tambah" className="btn btn-primary">
              <Plus size={16} />
              <span>Catat Pembelian</span>
            </Link>
          </div>
        }
      />

      <div className="page-container">
        {/* Product Overview Card */}
        <div className="card product-overview-card">
          <div className="overview-image-box">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} />
            ) : (
              <div className="overview-placeholder">
                <ShoppingBag size={40} color="#94A3B8" />
              </div>
            )}
          </div>

          <div className="overview-info">
            <div className="overview-category-badge">
              {product.category_name || 'Elektronik'}
            </div>
            <h1 className="overview-title">{product.name}</h1>
            <p className="overview-meta">
              <strong>Merk:</strong> {product.brand_name || '-'} {product.model && `| Model: ${product.model}`}
            </p>
            {product.description && (
              <p className="overview-description">{product.description}</p>
            )}
          </div>

          {/* Quick Price Badge */}
          <div className="overview-price-highlight">
            <span className="highlight-label">Harga Pembelian Terakhir</span>
            <span className="highlight-value">{formatRupiah(product.latest_price)}</span>
            <span className="highlight-sub">Total {product.total_purchased || 1} transaksi</span>
          </div>
        </div>

        {/* Comparison Summary Metric Cards */}
        <div className="metrics-grid mt-4">
          <div className="card metric-card border-green">
            <div className="metric-header">
              <span className="metric-title">Harga Terendah</span>
              <Award size={20} color="#10B981" />
            </div>
            <div className="metric-value text-green">{formatRupiah(minPrice)}</div>
            <div className="metric-sub">
              {stores.find(s => s.is_lowest)?.store_name || 'Semua toko'}
            </div>
          </div>

          <div className="card metric-card">
            <div className="metric-header">
              <span className="metric-title">Harga Rata-Rata</span>
              <Scale size={20} color="#3B82F6" />
            </div>
            <div className="metric-value text-blue">{formatRupiah(avgPrice)}</div>
            <div className="metric-sub">Dari {stores.length} toko/lokasi</div>
          </div>

          <div className="card metric-card border-orange">
            <div className="metric-header">
              <span className="metric-title">Harga Tertinggi</span>
              <TrendingUp size={20} color="#F59E0B" />
            </div>
            <div className="metric-value text-orange">{formatRupiah(maxPrice)}</div>
            <div className="metric-sub">
              {stores.find(s => s.is_highest)?.store_name || '-'}
            </div>
          </div>

          <div className="card metric-card">
            <div className="metric-header">
              <span className="metric-title">Potensi Penghematan</span>
              <TrendingDown size={20} color="#10B981" />
            </div>
            <div className="metric-value text-green">
              {formatRupiah(Math.max(0, maxPrice - minPrice))}
            </div>
            <div className="metric-sub">
              Selisih harga termahal vs termurah
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="detail-tabs-bar mt-6">
          <button
            className={`detail-tab-btn ${activeTab === 'reference' ? 'active' : ''}`}
            onClick={() => setActiveTab('reference')}
          >
            <Scale size={18} />
            <span>Referensi & Perbandingan Toko ({stores.length})</span>
          </button>

          <button
            className={`detail-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            <span>Riwayat Perubahan Harga ({priceHistory.length})</span>
          </button>
        </div>

        {/* Tab 1 Content: Price Reference across stores (Requirement #5) */}
        {activeTab === 'reference' && (
          <div className="card table-card mt-3">
            <div className="card-header">
              <h2 className="card-title">Perbandingan Harga di Berbagai Toko & Lokasi</h2>
              <p className="card-subtitle">
                Gunakan data ini sebagai referensi tempat pembelian paling hemat untuk barang ini.
              </p>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Toko</th>
                    <th>Jenis Toko</th>
                    <th>Kota / Lokasi</th>
                    <th>Harga Terakhir</th>
                    <th>Selisih dari Termurah</th>
                    <th>Terakhir Dibeli</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length > 0 ? (
                    stores.map((store, index) => {
                      const diff = store.latest_price - minPrice;
                      return (
                        <tr key={index} className={store.is_lowest ? 'lowest-price-row' : ''}>
                          <td>
                            <div className="flex-align">
                              <Store size={16} color="#3B82F6" />
                              <strong className="text-gray-800">{store.store_name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="store-type-badge">{store.store_type || 'fisik'}</span>
                          </td>
                          <td>
                            <div className="flex-align text-gray-600">
                              <MapPin size={14} color="#94A3B8" />
                              <span>{store.city || 'Surabaya'}</span>
                            </div>
                          </td>
                          <td>
                            <strong className="text-blue-700">{formatRupiah(store.latest_price)}</strong>
                          </td>
                          <td>
                            {diff === 0 ? (
                              <span className="text-green font-bold">Termurah</span>
                            ) : (
                              <span className="text-danger font-semibold">
                                +{formatRupiah(diff)}
                              </span>
                            )}
                          </td>
                          <td>{formatDate(store.latest_date)}</td>
                          <td>
                            {store.is_lowest ? (
                              <span className="badge badge-success">
                                <Award size={12} /> Rekomendasi
                              </span>
                            ) : store.is_highest ? (
                              <span className="badge badge-warning">
                                Tertinggi
                              </span>
                            ) : (
                              <span className="badge badge-primary">
                                Reguler
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-6">
                        Belum ada data referensi toko untuk barang ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Price Change History (Requirement #4) */}
        {activeTab === 'history' && (
          <div className="card mt-3">
            <div className="card-header">
              <h2 className="card-title">Histori Perubahan Harga Produk</h2>
              <p className="card-subtitle">
                Catatan riwayat setiap kali terjadi perubahan harga saat pembelian barang ini.
              </p>
            </div>

            {priceHistory.length > 0 ? (
              <div className="price-history-timeline">
                {priceHistory.map((item, idx) => {
                  const isUp = item.price_change > 0;
                  return (
                    <div key={idx} className="timeline-item">
                      <div className={`timeline-dot ${isUp ? 'dot-red' : 'dot-green'}`}>
                        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>

                      <div className="timeline-card">
                        <div className="timeline-header">
                          <div>
                            <span className="timeline-store">{item.store_name || 'Toko'} ({item.city || 'Surabaya'})</span>
                            <span className="timeline-date">{formatDate(item.recorded_at || item.purchase_date)}</span>
                          </div>
                          <span className={`price-change-pill ${isUp ? 'pill-danger' : 'pill-success'}`}>
                            {isUp ? '+' : ''}{formatRupiah(item.price_change)} ({formatPercent(item.price_change_pct)})
                          </span>
                        </div>

                        <div className="timeline-prices">
                          <div className="price-box">
                            <span className="price-label">Harga Sebelumnya:</span>
                            <span className="old-price">{formatRupiah(item.old_price)}</span>
                          </div>
                          <div className="price-arrow">→</div>
                          <div className="price-box">
                            <span className="price-label">Harga Baru:</span>
                            <span className="new-price">{formatRupiah(item.new_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-history-box">
                <History size={40} color="#CBD5E1" />
                <p>Belum ada riwayat kenaikan / penurunan harga untuk barang ini.</p>
                <span className="text-gray-400 text-sm">
                  Histori akan otomatis tercatat jika harga barang ini berubah pada pembelian berikutnya.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarangDetailPage;
