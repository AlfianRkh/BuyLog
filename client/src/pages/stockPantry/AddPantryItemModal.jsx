import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';

const AddPantryItemModal = ({ isOpen, onClose, onItemAdded }) => {
  const { zones, addPantryItem } = useStockPantry();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    ean: '',
    zoneId: zones[0]?.id || 'chiller',
    category: 'Makanan Segar',
    qty: 1,
    maxQty: 5,
    unit: 'Pcs',
    price: 15000,
    expiry: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    img: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const selectedZone = zones.find(z => z.id === formData.zoneId) || zones[0];

    addPantryItem({
      ...formData,
      qty: parseFloat(formData.qty) || 0,
      maxQty: parseFloat(formData.maxQty) || 1,
      price: parseFloat(formData.price) || 0,
      zone: selectedZone.name,
      zoneIcon: selectedZone.id === 'chiller' ? '❄️' : selectedZone.id === 'freezer' ? '🧊' : selectedZone.id === 'bumbu' ? '🧂' : selectedZone.id === 'p3k' ? '💊' : '🥫'
    });

    if (onItemAdded) onItemAdded();
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: '4px'
  };

  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={22} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Tambah Bahan / Stok Baru</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nama Barang *</label>
            <input
              type="text"
              required
              placeholder="mis. Telur Ayam Negeri, Susu UHT 1L"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Merk / Brand</label>
              <input
                type="text"
                placeholder="mis. Ultra Milk, Bimoli"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Barcode / EAN</label>
              <input
                type="text"
                placeholder="mis. EAN-8991204"
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Zona Penyimpanan</label>
              <select
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{z.name} ({z.temp})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="Makanan Segar" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Makanan Segar</option>
                <option value="Minuman & Dairy" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Minuman & Dairy</option>
                <option value="Bahan Pokok" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Bahan Pokok</option>
                <option value="Bumbu Masak" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Bumbu Masak</option>
                <option value="Daging & Seafood" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Daging & Seafood</option>
                <option value="Obat & Kesehatan" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Obat & Kesehatan</option>
                <option value="Perlengkapan Rumah" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Perlengkapan Rumah</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Stok Awal</label>
              <input
                type="number"
                step="any"
                required
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Max Kapasitas</label>
              <input
                type="number"
                step="any"
                value={formData.maxQty}
                onChange={(e) => setFormData({ ...formData, maxQty: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Satuan Ukuran</label>
              <input
                type="text"
                placeholder="Pcs, kg, Butir..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Estimasi Harga Beli (Rp)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Kedaluwarsa</label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--gray-200)' }}>
            <button
              type="button"
              onClick={onClose}
              className="sp-btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="sp-btn-primary"
            >
              Simpan Stok Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPantryItemModal;
