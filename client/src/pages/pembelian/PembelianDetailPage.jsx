import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import LocationMap from '../../components/maps/LocationMap';
import { api } from '../../services/api';
import { formatRupiah, formatFullDate, formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';
import {
  ArrowLeft,
  Calendar,
  Store,
  MapPin,
  CreditCard,
  FileText,
  Trash2,
  Edit,
  Tag,
  Package,
  ShoppingBag
} from 'lucide-react';
import './PembelianDetailPage.css';

const PembelianDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSidebar } = useOutletContext();
  const { success, error } = useToast();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseDetail();
  }, [id]);

  const fetchPurchaseDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/purchases/${id}`);
      if (res.success) {
        setPurchase(res.data);
      }
    } catch (err) {
      error('Gagal memuat detail pembelian');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan pembelian ini?')) {
      try {
        await api.delete(`/purchases/${id}`);
        success('Catatan pembelian berhasil dihapus');
        navigate('/pembelian');
      } catch (err) {
        error(err.message || 'Gagal menghapus');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Detail Pembelian" onToggleSidebar={toggleSidebar} />
        <div className="page-container text-center py-12">
          Memuat detail pembelian...
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div>
        <Header title="Detail Pembelian" onToggleSidebar={toggleSidebar} />
        <div className="page-container text-center py-12">
          <p>Catatan pembelian tidak ditemukan.</p>
          <Link to="/pembelian" className="btn btn-primary mt-4">
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  const primaryItem = purchase.items?.[0] || {};

  return (
    <div>
      <Header
        title="Detail Pembelian"
        subtitle={`Invoice: ${purchase.invoice_number || '-'}`}
        onToggleSidebar={toggleSidebar}
        actions={
          <button onClick={() => navigate('/pembelian')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
        }
      />

      <div className="page-container">
        <div className="detail-layout-grid">
          {/* Left Column: Product Photo & Items Overview */}
          <div className="card detail-product-card">
            <div className="detail-photo-wrapper">
              {primaryItem.product_photo_url ? (
                <img
                  src={primaryItem.product_photo_url}
                  alt={primaryItem.product_name}
                  className="detail-main-photo"
                />
              ) : (
                <div className="detail-photo-placeholder">
                  <ShoppingBag size={48} color="#94A3B8" />
                </div>
              )}
            </div>

            <div className="detail-product-header">
              <h2 className="detail-product-title">{primaryItem.product_name || 'Produk'}</h2>
              {primaryItem.product_model && (
                <span className="detail-product-model">Model: {primaryItem.product_model}</span>
              )}
              {primaryItem.category_name && (
                <span className="badge badge-primary mt-2">
                  {primaryItem.category_name}
                </span>
              )}
            </div>

            <div className="detail-specs-grid">
              <div className="spec-item">
                <Tag size={16} color="#3B82F6" />
                <div>
                  <span className="spec-label">Merk</span>
                  <span className="spec-value">{primaryItem.brand_name || '-'}</span>
                </div>
              </div>

              <div className="spec-item">
                <Package size={16} color="#8B5CF6" />
                <div>
                  <span className="spec-label">Kategori</span>
                  <span className="spec-value">{primaryItem.category_name || '-'}</span>
                </div>
              </div>
            </div>

            {/* Price reference quick link button */}
            {primaryItem.product_id && (
              <Link
                to={`/barang/${primaryItem.product_id}`}
                className="btn btn-secondary btn-block mt-4"
              >
                Lihat Referensi & Riwayat Harga
              </Link>
            )}
          </div>

          {/* Right Column: Transaction & Store Details */}
          <div className="detail-right-column">
            {/* Purchase Info Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Rincian Transaksi</h3>
              </div>

              <div className="detail-info-list">
                <div className="info-row">
                  <span className="info-label">Tanggal Pembelian</span>
                  <span className="info-value">{formatFullDate(purchase.purchase_date)}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Jumlah Barang</span>
                  <span className="info-value">{primaryItem.quantity || 1} Pcs</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Harga Satuan</span>
                  <span className="info-value">{formatRupiah(primaryItem.unit_price)}</span>
                </div>

                <div className="info-row total-highlight">
                  <span className="info-label">Total Pembayaran</span>
                  <span className="info-value-large">{formatRupiah(purchase.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Store & Location Card */}
            <div className="card mt-4">
              <div className="card-header">
                <h3 className="card-title">Tempat Pembelian</h3>
              </div>

              <div className="detail-info-list">
                <div className="info-row">
                  <span className="info-label">Nama Toko</span>
                  <span className="info-value font-bold">{purchase.store_name || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Alamat / Lokasi</span>
                  <span className="info-value">
                    {purchase.store_address ? `${purchase.store_address}, ` : ''}{purchase.city || 'Surabaya'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Metode Pembayaran</span>
                  <span className="info-value">{purchase.payment_method || 'Tunai'}</span>
                </div>

                {purchase.notes && (
                  <div className="info-row">
                    <span className="info-label">Catatan</span>
                    <span className="info-value">{purchase.notes}</span>
                  </div>
                )}
              </div>

              {/* Map view for location */}
              {(purchase.latitude || purchase.store_latitude) && (
                <div className="detail-map-box mt-4">
                  <LocationMap
                    locations={[
                      {
                        latitude: purchase.latitude || purchase.store_latitude,
                        longitude: purchase.longitude || purchase.store_longitude,
                        store_name: purchase.store_name,
                        store_type: purchase.store_type,
                        total_amount: purchase.total_amount,
                        purchase_date: purchase.purchase_date,
                        sample_product_name: primaryItem.product_name
                      }
                    ]}
                    height="180px"
                  />
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="card mt-4 detail-actions-card">
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={16} />
                <span>Hapus Pembelian</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PembelianDetailPage;
