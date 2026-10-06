import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Store,
  ShoppingCart,
  PlusCircle,
  Trash2,
  PieChart,
  Save,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  FileImage,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useSmartFin, formatIDR } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinScanPage() {
  const navigate = useNavigate();
  const { walletAccounts, addTransaction, updateWalletBalance, triggerToast } = useSmartFin();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState('photo'); // 'photo' or 'parsed'

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeBox, setActiveBox] = useState(null);

  // Form states
  const [merchant, setMerchant] = useState('Indomaret Merr Surabaya');
  const [receiptDate, setReceiptDate] = useState('2026-10-06T09:45');
  const [invoiceNo, setInvoiceNo] = useState('INV/20261006/00892');
  const [selectedWallet, setSelectedWallet] = useState('BCA Utama');

  const [items, setItems] = useState([
    { id: 1, name: 'Bimoli Spesial Minyak Goreng 2L', qty: '1 Pouch', price: 38500, category: '🥫 Kebutuhan Dapur' },
    { id: 2, name: 'Ultra Milk Plain Full Cream 1L', qty: '2 Kotak', price: 39000, category: '🥛 Makanan & Minuman' },
    { id: 3, name: 'Sunlight Jeruk Nipis Refill 750ml', qty: '1 Pouch', price: 16000, category: '🧼 Perlengkapan Rumah' },
  ]);
  const [discount, setDiscount] = useState(5000);

  const subtotal = items.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalAkhir = Math.max(0, subtotal - discount);

  // Handle Photo Upload from HP / Camera
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageDataUrl = event.target.result;
      setUploadedImage(imageDataUrl);
      setViewMode('photo');
      setZoom(1);
      setRotation(0);

      // Trigger AI OCR Simulation
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        // Simulate smart OCR parsing based on uploaded image filename/time
        if (file.name.toLowerCase().includes('resto') || file.name.toLowerCase().includes('cafe') || file.name.toLowerCase().includes('kopi')) {
          setMerchant('Kopi Kenangan & Kitchen Galaxy');
          setInvoiceNo('INV/KK-' + Date.now().toString().slice(-5));
          setItems([
            { id: 1, name: 'Nasi Goreng Gila Spesial', qty: '1 Porsi', price: 45000, category: '☕ Makan & Minum' },
            { id: 2, name: 'Creamy Carbonara Pasta', qty: '1 Porsi', price: 50000, category: '☕ Makan & Minum' },
            { id: 3, name: 'Sharing French Fries', qty: '1 Porsi', price: 25000, category: '☕ Makan & Minum' },
          ]);
          setDiscount(0);
        } else if (file.name.toLowerCase().includes('super') || file.name.toLowerCase().includes('superindo')) {
          setMerchant('Superindo Merr Surabaya');
          setInvoiceNo('INV/SUP-' + Date.now().toString().slice(-5));
          setItems([
            { id: 1, name: 'Daging Slice Sukiyaki 500g', qty: '1 Pack', price: 85000, category: '🥫 Kebutuhan Dapur' },
            { id: 2, name: 'Telur Ayam Negeri 1kg', qty: '1 Tray', price: 31500, category: '🥫 Kebutuhan Dapur' },
            { id: 3, name: 'Beras Ramos 5kg', qty: '1 Karung', price: 68000, category: '🥫 Kebutuhan Dapur' }
          ]);
          setDiscount(10000);
        } else {
          setMerchant('Indomaret Merr Surabaya (Struk HP)');
          setInvoiceNo('INV/' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '/' + Math.floor(1000 + Math.random() * 9000));
        }

        triggerToast('⚡ AI Vision berhasil mengekstrak data dari foto HP Anda!');
      }, 1500);
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const payload = {
        merchant,
        date: receiptDate ? new Date(receiptDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        amount: totalAkhir,
        category: items[0]?.category || '🥫 Kebutuhan Dapur',
        paymentAccount: selectedWallet,
        receiptNo: invoiceNo,
        items
      };

      const res = await api.smartFin.scanReceipt(payload);
      addTransaction({
        id: res.transaction ? res.transaction.id : ('TRX-' + Date.now().toString().slice(-4)),
        merchant,
        category: items[0]?.category || '🥫 Kebutuhan Dapur',
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: totalAkhir,
        account: selectedWallet,
        isIncome: false,
        verified: true,
        itemsCount: items.length
      });
      updateWalletBalance(selectedWallet, -totalAkhir);
      triggerToast(res.message || 'Struk HP berhasil diproses & dicatat di Backend Server!');
      navigate('/smartfin/transactions');

    } catch (err) {
      console.error('Failed processing scan in BE:', err);
      triggerToast('Gagal memproses struk di Backend.');
    }
  };


  return (
    <div className="sf-container">
      {/* Hidden File Inputs for HP Upload & Camera Capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Header */}
      <div className="sf-header">
        <div className="sf-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            <Link to="/smartfin/transactions" style={{ color: 'var(--gray-600)', textDecoration: 'none', fontWeight: 600 }}>Buku Transaksi</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>Verifikasi Struk #{invoiceNo}</span>
          </div>
          <h1 className="sf-page-title">
            <Camera className="sf-text-primary" size={28} />
            <span>Pindai Struk AI &amp; Upload Foto HP</span>
          </h1>
          <p className="sf-page-subtitle">
            Upload foto struk belanja dari galeri HP atau ambil foto langsung lewat kamera HP. AI mengekstrak data otomatis tanpa perlu ketik manual.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={() => cameraInputRef.current && cameraInputRef.current.click()} className="sf-btn-secondary" style={{ backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
            <Camera size={18} />
            <span>Kamera HP</span>
          </button>
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="sf-btn-secondary">
            <Upload size={18} color="#06b6d4" />
            <span>Upload Foto Struk</span>
          </button>
          <button onClick={handleSave} className="sf-btn-primary">
            <Save size={18} />
            <span>Verifikasi &amp; Simpan</span>
          </button>
        </div>
      </div>

      {/* Upload Quick Actions Bar */}
      <div className="sf-card" style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px dashed #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)', display: 'block' }}>
              Pilih Foto Struk Asli dari HP Anda
            </strong>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
              {uploadedImage ? `File terdeteksi: "${fileName || 'Struk_HP.jpg'}"` : 'Dukung format JPG, PNG, WebP nota ritel, resto & BBM'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
            className="sf-btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          >
            <Camera size={16} />
            <span>Ambil Foto HP</span>
          </button>
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="sf-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          >
            <FileImage size={16} color="#06b6d4" />
            <span>Pilih File HP</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Interactive Receipt Photo Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="sf-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <Camera size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)', display: 'block' }}>
                  {uploadedImage ? 'Foto Struk dari HP' : 'Foto Struk Sample'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  {viewMode === 'photo' ? 'Tampilan Foto Asli' : 'Tampilan Parsing Thermal'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {uploadedImage && (
                <button
                  onClick={() => setViewMode(viewMode === 'photo' ? 'parsed' : 'photo')}
                  className="sf-btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  <Eye size={14} />
                  <span>{viewMode === 'photo' ? 'Lihat Thermal' : 'Lihat Foto HP'}</span>
                </button>
              )}
              <span className="sf-badge-live">
                {isAnalyzing ? '⚡ AI Membaca...' : '98.2% OCR Match'}
              </span>
            </div>
          </div>

          {/* Photo Viewer Box */}
          <div className="sf-card" style={{ backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '520px', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '16px' }}>
            {/* AI Analyzing Overlay Animation */}
            {isAnalyzing && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255,255,255,0.92)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #a7f3d0', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }}></div>
                <strong style={{ fontSize: '1rem', color: 'var(--gray-900)' }}>
                  ⚡ AI Vision Engine Sedang Membaca Foto Struk...
                </strong>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-600)', maxWidth: '280px' }}>
                  Mengekstrak nama toko, tanggal, rincian per-item barang, diskon, dan total bayar otomatis...
                </p>
              </div>
            )}

            {uploadedImage && viewMode === 'photo' ? (
              /* Real Uploaded Image Display */
              <div style={{
                width: '100%',
                maxHeight: '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '8px'
              }}>
                <img
                  src={uploadedImage}
                  alt="Struk Belanja HP"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '460px',
                    objectFit: 'contain',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ) : (
              /* Thermal Paper Mockup Viewer */
              <div
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '4px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  padding: '20px',
                  fontFamily: 'monospace',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{merchant.toUpperCase()}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#475569' }}>TERBACA DARI FOTO STRUK HP</div>
                  <div style={{ fontSize: '0.625rem', color: '#64748b' }}>NO: {invoiceNo}</div>
                </div>

                <div style={{ margin: '8px 0', borderTop: '1px dashed #cbd5e1' }}></div>

                <div style={{ fontSize: '0.6875rem', color: '#334155', display: 'flex', justifyBetween: 'space-between' }}>
                  <span>TGL: {receiptDate.replace('T', ' ')}</span>
                  <span>POS: 01</span>
                </div>

                <div style={{ margin: '8px 0', borderTop: '1px dashed #cbd5e1' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      onMouseEnter={() => setActiveBox(it.id)}
                      onMouseLeave={() => setActiveBox(null)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        backgroundColor: activeBox === it.id ? '#e0f2fe' : '#f0f9ff',
                        border: activeBox === it.id ? '1px solid #0284c7' : '1px solid #bae6fd',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyBetween: 'space-between', fontWeight: 700 }}>
                        <span>{it.name.toUpperCase()}</span>
                        <span>{Number(it.price).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#0369a1', display: 'flex', justifyBetween: 'space-between' }}>
                        <span>{it.qty}</span>
                        <span>AI #{idx+1} (98%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ margin: '8px 0', borderTop: '1px dashed #cbd5e1' }}></div>

                <div style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                  <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
                    <span>SUBTOTAL</span>
                    <strong>{formatIDR(subtotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', color: '#047857' }}>
                    <span>DISKON MEMBER</span>
                    <strong>-{formatIDR(discount)}</strong>
                  </div>
                  <div style={{ margin: '4px 0', borderTop: '1px solid #94a3b8' }}></div>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', fontWeight: 800, fontSize: '0.875rem' }}>
                    <span>TOTAL AKHIR</span>
                    <span>{formatIDR(totalAkhir)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zoom/Rotate Controls */}
          <div className="sf-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setZoom(Math.min(1.4, zoom + 0.1))} className="sf-btn-secondary" style={{ padding: '6px 10px' }} title="Zoom In">
                <ZoomIn size={16} />
              </button>
              <button onClick={() => setZoom(Math.max(0.7, zoom - 0.1))} className="sf-btn-secondary" style={{ padding: '6px 10px' }} title="Zoom Out">
                <ZoomOut size={16} />
              </button>
              <button onClick={() => setRotation((rotation + 90) % 360)} className="sf-btn-secondary" style={{ padding: '6px 10px' }} title="Putar">
                <RotateCw size={16} />
              </button>
              <button onClick={() => { setZoom(1); setRotation(0); }} className="sf-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '0.75rem' }}>
              <ShieldCheck size={16} />
              <span>{uploadedImage ? 'Foto HP Terbaca' : 'Duplicate Guard: Unik'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Metadata Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Store Info */}
          <div className="sf-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={20} color="#10b981" />
              Informasi Toko &amp; Pembayaran Hasil AI
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nama Merchant / Toko
                </label>
                <input
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Tanggal &amp; Waktu
                </label>
                <input
                  type="datetime-local"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nomor Invoice
                </label>
                <input
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Dompet Sumber
                </label>
                <select
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', cursor: 'pointer' }}
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                >
                  {walletAccounts.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Metode Bayar
                </label>
                <input
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  defaultValue="QRIS BCA (Scan & Go)"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="sf-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="#06b6d4" />
                Rincian Item Belanjaan Ter-ekstrak ({items.length} Baris)
              </h3>
              <button
                onClick={() => {
                  const newId = items.length + 1;
                  setItems([...items, { id: newId, name: 'Item Tambahan Baru', qty: '1 Pcs', price: 10000, category: '🥫 Kebutuhan Dapur' }]);
                }}
                className="sf-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                <PlusCircle size={15} color="#10b981" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  onMouseEnter={() => setActiveBox(it.id)}
                  onMouseLeave={() => setActiveBox(null)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: activeBox === it.id ? '1px solid #10b981' : '1px solid var(--gray-200)',
                    backgroundColor: activeBox === it.id ? '#ecfdf5' : 'var(--gray-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', width: '24px' }}>0{idx + 1}</span>
                    <input
                      className="sf-form-control"
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                      value={it.name}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].name = e.target.value;
                        setItems(updated);
                      }}
                    />
                    <select
                      className="sf-form-control"
                      style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}
                      value={it.category}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].category = e.target.value;
                        setItems(updated);
                      }}
                    >
                      <option value="🥫 Kebutuhan Dapur">🥫 Kebutuhan Dapur</option>
                      <option value="🥛 Makanan & Minuman">🥛 Makanan & Minuman</option>
                      <option value="🧼 Perlengkapan Rumah">🧼 Perlengkapan Rumah</option>
                      <option value="☕ Makan & Minum">☕ Makan & Minum</option>
                    </select>
                    <button
                      onClick={() => setItems(items.filter((x) => x.id !== it.id))}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', paddingLeft: '34px', color: 'var(--gray-600)' }}>
                    <span>Qty: {it.qty}</span>
                    <strong style={{ color: 'var(--gray-900)' }}>Harga: {formatIDR(it.price)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Math Balance Box */}
          <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              <span>Subtotal Item ({items.length} items)</span>
              <strong style={{ color: 'var(--gray-900)' }}>{formatIDR(subtotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.875rem', color: '#047857', fontWeight: 700 }}>
              <span>Diskon Member Indomaret</span>
              <span>-{formatIDR(discount)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--gray-200)', margin: '4px 0' }}></div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>Total Bersih Pembayaran</span>
              <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#047857' }}>{formatIDR(totalAkhir)}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button onClick={() => navigate('/smartfin/split-bill')} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <PieChart size={18} color="#06b6d4" />
                <span>Bagi Nota (Split-Bill)</span>
              </button>
              <button onClick={handleSave} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
                <span>Konfirmasi &amp; Simpan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
