import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  Package,
  Search,
  Plus,
  SlidersHorizontal,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Store,
  Tag,
  ShoppingBag
} from 'lucide-react';
import './BarangListPage.css';

const BarangListPage = () => {
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        search,
        category_id: selectedCategory
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div>
      <Header
        title="Daftar Barang"
        subtitle="Lihat daftar barang terdaftar dan perbandingan harganya"
        onToggleSidebar={toggleSidebar}
        actions={
          <Link to="/pembelian/tambah" className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Pembelian</span>
          </Link>
        }
      />

      <div className="page-container">
        {/* Filter bar */}
        <div className="card toolbar-card">
          <form onSubmit={handleSearch} className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama barang, merk, atau model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </form>

          <div className="category-chips">
            <button
              className={`cat-chip ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`cat-chip ${selectedCategory === String(c.id) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(String(c.id))}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="text-center py-12">Memuat daftar barang...</div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="card product-card"
                onClick={() => navigate(`/barang/${product.id}`)}
              >
                <div className="product-image-box">
                  {product.photo_url ? (
                    <img src={product.photo_url} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <ShoppingBag size={32} color="#94A3B8" />
                    </div>
                  )}
                  {product.category_name && (
                    <span className="product-cat-badge">
                      {product.category_name}
                    </span>
                  )}
                </div>

                <div className="product-card-body">
                  <div className="product-brand-tag">
                    <Tag size={12} />
                    <span>{product.brand_name || 'Tanpa Merk'}</span>
                  </div>

                  <h3 className="product-title">{product.name}</h3>
                  {product.model && <span className="product-model-text">{product.model}</span>}

                  <div className="product-price-section">
                    <span className="price-label">Harga Terakhir:</span>
                    <span className="price-amount">{formatRupiah(product.latest_price)}</span>
                  </div>

                  <div className="product-meta-footer">
                    <span className="purchase-count-badge">
                      {product.purchase_count || 1}x Dibeli
                    </span>
                    <span className="view-reference-link">
                      <span>Bandingkan Harga</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card empty-products-card">
            <Package size={48} color="#CBD5E1" />
            <h3>Belum ada barang terdaftar</h3>
            <p>Barang akan otomatis terdaftar saat Anda mencatat transaksi pembelian baru.</p>
            <Link to="/pembelian/tambah" className="btn btn-primary mt-4">
              <Plus size={16} />
              <span>Tambah Pembelian Baru</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarangListPage;
