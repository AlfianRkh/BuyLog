import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';

export default function AddWishItemModal({ isOpen, onClose }) {
  const { addItem } = useWishBoard();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Elektronik & Gadget');
  const [price, setPrice] = useState('');
  const [urgency, setUrgency] = useState(3);
  const [want, setWant] = useState(4);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [sku, setSku] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    addItem({
      name: name.trim(),
      brand: brand.trim() || 'Brand',
      category: category,
      categorySlug: category.toLowerCase().includes('fashion') ? 'fashion' : category.toLowerCase().includes('furnitur') ? 'furnitur' : 'elektronik',
      img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
      price: parseFloat(price) || 0,
      urgency: parseInt(urgency, 10),
      want: parseInt(want, 10),
      deadline: deadline || '2026-11-30',
      sku: sku || 'WB-ITEM-NEW'
    });

    onClose();
    setName('');
    setBrand('');
    setPrice('');
  };

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.02em'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="var(--primary-600)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Tambah Item Wishlist Baru</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>NAMA PRODUK / IMPIAN *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sony WH-1000XM5 Noise Cancelling"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>BRAND / MEREK</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Contoh: Sony"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>KATEGORI</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="Elektronik & Gadget" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Elektronik & Gadget</option>
                <option value="Fashion & Apparel" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Fashion & Apparel</option>
                <option value="Rumah Tangga & Setup" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Rumah Tangga & Setup</option>
                <option value="Hobi & Koleksi" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Hobi & Koleksi</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>ESTIMASI HARGA (RP) *</label>
              <input
                type="number"
                required
                min="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4999000"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>TARGET DEADLINE</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>URGENSI</span>
                <span style={{ color: 'var(--primary-600)' }}>{urgency} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>KEINGINAN</span>
                <span style={{ color: 'var(--primary-600)' }}>{want} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={want}
                onChange={(e) => setWant(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="wb-btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="wb-btn-primary"
            >
              Simpan Wishlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
