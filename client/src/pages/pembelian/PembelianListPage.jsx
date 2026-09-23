import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  SlidersHorizontal,
  X
} from 'lucide-react';
import './PembelianListPage.css';

const PembelianListPage = () => {
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [purchases, setPurchases] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all'); // 'all', 'month', 'year'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchMetaOptions();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, period, filterCategory, filterBrand, filterStore, minPrice, maxPrice]);

  const fetchMetaOptions = async () => {
    try {
      const [catRes, brandRes, storeRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/stores')
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (brandRes.success) setBrands(brandRes.data);
      if (storeRes.success) setStores(storeRes.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search,
        period,
        month: 9,
        year: 2026,
        category_id: filterCategory,
        brand_id: filterBrand,
        store_id: filterStore,
        min_price: minPrice,
        max_price: maxPrice
      };
      const res = await api.get('/purchases', params);
      if (res.success) {
        setPurchases(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.total_pages);
      }
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPurchases();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan pembelian ini?')) {
      try {
        await api.delete(`/purchases/${id}`);
        success('Catatan pembelian berhasil dihapus');
        fetchPurchases();
      } catch (err) {
        error(err.message || 'Gagal menghapus pembelian');
      }
    }
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterStore('');
    setMinPrice('');
    setMaxPrice('');
    setShowFilterModal(false);
  };

  return (
    <div>
      <Header
        title="Pembelian"
        subtitle="Kelola dan lihat semua riwayat pembelian Anda"
        onToggleSidebar={toggleSidebar}
        actions={
          <Link to="/pembelian/tambah" className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Pembelian</span>
          </Link>
        }
      />

      <div className="page-container">
        {/* Search & Filter Toolbar */}
        <div className="card toolbar-card">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari barang, merk, toko, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </form>

          <div className="filter-group">
            {/* Period Tabs */}
            <div className="period-tabs">
              <button
                className={`period-btn ${period === 'all' ? 'active' : ''}`}
                onClick={() => { setPeriod('all'); setCurrentPage(1); }}
              >
                Semua
              </button>
              <button
                className={`period-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => { setPeriod('month'); setCurrentPage(1); }}
              >
                Bulan Ini
              </button>
              <button
                className={`period-btn ${period === 'year' ? 'active' : ''}`}
                onClick={() => { setPeriod('year'); setCurrentPage(1); }}
              >
                Tahun Ini
              </button>
            </div>

            <button
              type="button"
              className={`btn btn-secondary btn-filter ${filterCategory || filterBrand || filterStore || minPrice ? 'active-filter' : ''}`}
              onClick={() => setShowFilterModal(true)}
            >
              <SlidersHorizontal size={16} />
              <span>Filter Lanjutan</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Merk</th>
                  <th>Toko</th>
                  <th>Lokasi</th>
                  <th>Tanggal</th>
                  <th>Harga</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      Memuat data pembelian...
                    </td>
                  </tr>
                ) : purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      onClick={() => navigate(`/pembelian/${purchase.id}`)}
                      className="table-row-clickable"
                    >
                      <td>
                        <div className="product-cell">
                          <div className="product-thumb">
                            {purchase.thumbnail_url ? (
                              <img src={purchase.thumbnail_url} alt={purchase.product_names} />
                            ) : (
                              <ShoppingBag size={18} color="#94A3B8" />
                            )}
                          </div>
                          <div>
                            <span className="product-cell-name">{purchase.product_names || 'Barang'}</span>
                            {purchase.primary_category && (
                              <span className="badge badge-primary" style={{ fontSize: '0.675rem', marginTop: '2px' }}>
                                {purchase.primary_category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{purchase.primary_brand || '-'}</td>
                      <td>
                        <span className="store-cell-name">{purchase.store_name || '-'}</span>
                      </td>
                      <td>
                        <span className="location-pill">
                          {purchase.city || (purchase.store_type === 'online' ? 'Online' : 'Surabaya')}
                        </span>
                      </td>
                      <td>{formatDate(purchase.purchase_date)}</td>
                      <td>
                        <span className="price-cell">{formatRupiah(purchase.total_amount)}</span>
                      </td>
                      <td>
                        <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/pembelian/${purchase.id}`}
                            className="action-btn"
                            title="Lihat Detail"
                          >
                            <Eye size={16} color="#3B82F6" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(purchase.id, e)}
                            className="action-btn delete"
                            title="Hapus Catatan"
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="empty-table-state">
                        <ShoppingBag size={36} color="#CBD5E1" />
                        <p>Tidak ada data pembelian yang cocok dengan filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-number ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="modal-backdrop" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cari & Filter</h3>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Merk</label>
                <select
                  className="form-select"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="">Semua Merk</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Toko</label>
                <select
                  className="form-select"
                  value={filterStore}
                  onChange={(e) => setFilterStore(e.target.value)}
                >
                  <option value="">Semua Toko</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Harga Min (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Max (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={resetFilters}>
                Reset
              </button>
              <button className="btn btn-primary" onClick={() => { setShowFilterModal(false); setCurrentPage(1); fetchPurchases(); }}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PembelianListPage;
