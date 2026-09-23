import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import LocationPicker from '../../components/maps/LocationPicker';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatRupiah } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Store,
  Calendar,
  Layers,
  FileText,
  X
} from 'lucide-react';
import './PembelianCreatePage.css';

const PembelianCreatePage = () => {
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);

  // Form State
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  
  // Store & Location State
  const [storeType, setStoreType] = useState('fisik'); // 'fisik', 'online', 'marketplace'
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [city, setCity] = useState('Surabaya');
  const [latitude, setLatitude] = useState(-7.2575);
  const [longitude, setLongitude] = useState(112.7521);

  // Additional
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Auto-check product state (Requirement #3)
  const [checkingProduct, setCheckingProduct] = useState(false);
  const [productStatus, setProductStatus] = useState(null); // { exists: boolean, product: obj }

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debounced check product existence by Name + Brand
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productName.trim().length >= 2) {
        checkProduct();
      } else {
        setProductStatus(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [productName, brandName]);

  const fetchInitialData = async () => {
    try {
      const [catRes, brandRes, storeRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/stores')
      ]);
      if (catRes.success && catRes.data.length > 0) {
        setCategories(catRes.data);
        setCategoryId(catRes.data[0].id);
      }
      if (brandRes.success) setBrands(brandRes.data);
      if (storeRes.success) setStores(storeRes.data);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const checkProduct = async () => {
    setCheckingProduct(true);
    try {
      const res = await api.get('/products/check-existence', {
        name: productName.trim(),
        brand_name: brandName.trim()
      });
      if (res.success) {
        setProductStatus(res.data);
        if (res.data.exists && res.data.product) {
          // Auto-fill category or model if available and currently empty
          if (!model && res.data.product.model) setModel(res.data.product.model);
          if (res.data.product.category_id) setCategoryId(res.data.product.category_id);
          if (!photoUrl && res.data.product.photo_url) {
            setPhotoUrl(res.data.product.photo_url);
            setPhotoPreview(res.data.product.photo_url);
          }
        }
      }
    } catch (err) {
      console.error('Error checking product:', err);
    } finally {
      setCheckingProduct(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.upload('/upload/photo', formData);
      if (res.success && res.data) {
        setPhotoUrl(res.data.url);
        success('Foto produk berhasil diunggah');
      }
    } catch (err) {
      error(err.message || 'Gagal mengunggah foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      error('Nama barang harus diisi.');
      return;
    }
    if (!unitPrice || Number(unitPrice) <= 0) {
      error('Harga satuan harus lebih dari 0.');
      return;
    }
    if (!storeName.trim()) {
      error('Nama toko harus diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        purchase_date: purchaseDate,
        category_id: categoryId ? Number(categoryId) : null,
        product_name: productName.trim(),
        brand_name: brandName.trim(),
        model: model.trim() || null,
        quantity: Number(quantity) || 1,
        unit_price: Number(unitPrice),
        store_type: storeType,
        store_name: storeName.trim(),
        store_address: storeAddress.trim() || null,
        city: city.trim() || 'Surabaya',
        latitude,
        longitude,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        photo_url: photoUrl || null
      };

      const res = await api.post('/purchases', payload);
      if (res.success) {
        const isNew = res.data.items?.[0]?.is_new_product;
        success(isNew ? 'Pembelian dicatat & produk baru berhasil didaftarkan!' : 'Pembelian berhasil dicatat!');
        navigate(`/pembelian/${res.data.purchase.id}`);
      }
    } catch (err) {
      error(err.message || 'Gagal menyimpan pembelian');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const q = Number(quantity) || 0;
    const p = Number(unitPrice) || 0;
    return q * p;
  };

  return (
    <div>
      <Header
        title="Tambah Pembelian"
        subtitle="Catat barang yang Anda beli"
        onToggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        <form onSubmit={handleSubmit} className="create-purchase-form">
          <div className="form-sections-grid">
            {/* Left Column: Product & Purchase Info */}
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title flex-align">
                  <Layers size={20} color="#3B82F6" />
                  <span>Informasi Produk</span>
                </h2>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Tanggal Pembelian *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Barang with real-time auto-registration check */}
              <div className="form-group">
                <div className="label-with-badge">
                  <label className="form-label">Nama Barang *</label>
                  {checkingProduct && <span className="check-text">Memeriksa database...</span>}
                  {!checkingProduct && productStatus && (
                    productStatus.exists ? (
                      <span className="badge badge-success">
                        <CheckCircle size={12} /> Barang Terdaftar
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <Sparkles size={12} /> Otomatis Didaftarkan
                      </span>
                    )
                  )}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Mouse Wireless"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Merk *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Logitech"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    list="brand-suggestions"
                    required
                  />
                  <datalist id="brand-suggestions">
                    {brands.map((b) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label">Model (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: M331"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Jumlah *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Contoh: 250000"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="total-preview-box">
                <span className="total-preview-label">Total Pembelian:</span>
                <span className="total-preview-amount">{formatRupiah(calculateTotal())}</span>
              </div>
            </div>

            {/* Right Column: Tempat Pembelian & Lokasi Maps */}
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title flex-align">
                  <Store size={20} color="#3B82F6" />
                  <span>Tempat Pembelian & Lokasi</span>
                </h2>
              </div>

              {/* Jenis Lokasi */}
              <div className="form-group">
                <label className="form-label">Jenis Toko</label>
                <div className="radio-pills-group">
                  <label className={`radio-pill ${storeType === 'fisik' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="storeType"
                      value="fisik"
                      checked={storeType === 'fisik'}
                      onChange={() => setStoreType('fisik')}
                    />
                    <span>Toko Fisik</span>
                  </label>
                  <label className={`radio-pill ${storeType === 'online' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="storeType"
                      value="online"
                      checked={storeType === 'online'}
                      onChange={() => setStoreType('online')}
                    />
                    <span>Online</span>
                  </label>
                  <label className={`radio-pill ${storeType === 'marketplace' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="storeType"
                      value="marketplace"
                      checked={storeType === 'marketplace'}
                      onChange={() => setStoreType('marketplace')}
                    />
                    <span>Marketplace</span>
                  </label>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Nama Toko *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Toko Komputer ABC / Tokopedia"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    list="store-suggestions"
                    required
                  />
                  <datalist id="store-suggestions">
                    {stores.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label">Kota</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Surabaya"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Toko</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Jl. Ahmad Yani No. 123"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>

              {/* Map Location Picker */}
              <div className="form-group">
                <label className="form-label">Titik Lokasi Pembelian (Maps)</label>
                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  onChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  height="180px"
                />
              </div>
            </div>
          </div>

          {/* Bottom Full-width Row: Payment, Notes, Photo */}
          <div className="card form-card mt-4">
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Metode Pembayaran</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Catatan (Opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Mouse untuk laptop kantor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="form-group mt-2">
              <label className="form-label">Foto Produk / Nota (Opsional)</label>
              <div className="photo-upload-container">
                {photoPreview ? (
                  <div className="photo-preview-box">
                    <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={() => { setPhotoPreview(''); setPhotoUrl(''); }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="photo-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={28} color="#3B82F6" />
                    <span className="upload-text">
                      {uploadingPhoto ? 'Mengunggah...' : 'Klik untuk menambah foto produk atau nota'}
                    </span>
                    <span className="upload-subtext">JPG, PNG, WebP (Maks. 5MB)</span>
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-action-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/pembelian')}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || uploadingPhoto}
              >
                {loading ? 'Menyimpan...' : 'Simpan Pembelian'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PembelianCreatePage;
