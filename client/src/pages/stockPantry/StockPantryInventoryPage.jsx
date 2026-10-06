import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  QrCode
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import AddPantryItemModal from './AddPantryItemModal';
import './StockPantryPages.css';

const StockPantryInventoryPage = () => {
  const { pantryItems, changeQty, deletePantryItem, addShoppingItem } = useStockPantry();
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.ean.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'all' || item.zoneId === selectedZone;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleAddToShoppingList = (item) => {
    addShoppingItem({
      name: item.name,
      sub: `1 ${item.unit}`,
      reason: 'Dari Katalogue Dapur',
      price: item.price,
      zone: `${item.zoneIcon} ${item.zone}`
    });
    showToast(`"${item.name}" ditambahkan ke Smart Shopping List!`);
  };

  return (
    <div className="sp-container">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={20} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="sp-header">
        <div className="sp-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sp-badge-live">StockPantry Master</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{pantryItems.length} SKU Terindeks</span>
          </div>
          <h1 className="sp-page-title">
            <Package className="sp-text-primary" size={28} />
            Inventaris &amp; Katalog Dapur
          </h1>
          <p className="sp-page-subtitle">
            Katalog lengkap bahan makanan, bumbu, minuman, dan perlengkapan rumah tangga.
          </p>
        </div>

        <div className="sp-actions-group">
          <button onClick={() => showToast('Barcode Scanner Siap Memindai EAN-13/UPC')} className="sp-btn-secondary">
            <QrCode size={18} color="#10b981" />
            <span>Scan Barcode</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="sp-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Bahan Baru</span>
          </button>
        </div>
      </div>

      {/* Zone Tabs Filter */}
      <div className="sp-tabs">
        {[
          { id: 'all', label: 'Semua Zona', count: pantryItems.length },
          { id: 'chiller', label: '❄️ Kulkas Chiller', count: pantryItems.filter(i => i.zoneId === 'chiller').length },
          { id: 'freezer', label: '🧊 Freezer Beku', count: pantryItems.filter(i => i.zoneId === 'freezer').length },
          { id: 'lemari', label: '🥫 Lemari Dapur', count: pantryItems.filter(i => i.zoneId === 'lemari').length },
          { id: 'bumbu', label: '🧂 Rak Bumbu', count: pantryItems.filter(i => i.zoneId === 'bumbu').length },
          { id: 'p3k', label: '💊 Kotak Obat', count: pantryItems.filter(i => i.zoneId === 'p3k').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedZone(tab.id)}
            className={`sp-tab-btn ${selectedZone === tab.id ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="sp-filter-bar">
        <div className="sp-search-input">
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            placeholder="Cari bahan, merk, atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'safe', label: '🟢 Cukup' },
            { id: 'low', label: '🟡 Menipis' },
            { id: 'empty', label: '🔴 Habis' },
            { id: 'expiring', label: '⏰ Segera Expired' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--gray-200)',
                backgroundColor: selectedStatus === s.id ? 'var(--gray-900)' : '#ffffff',
                color: selectedStatus === s.id ? '#ffffff' : 'var(--gray-700)',
                cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Pantry Cards */}
      <div className="sp-grid-cards">
        {filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
            📦 Belum ada bahan makanan terdaftar di inventaris. Klik "+ Tambah Bahan Baru" untuk menambahkan.
          </div>
        ) : (
          filteredItems.map(item => {
          const pct = Math.min(100, item.maxQty > 0 ? (item.qty / item.maxQty) * 100 : 0);
          return (
            <div key={item.id} className="sp-pantry-card">
              <div>
                <div className="sp-card-media">
                  <img src={item.img} alt={item.name} />
                  <span
                    className={`sp-status-badge ${
                      item.status === 'safe' ? 'sp-status-safe' :
                      item.status === 'low' ? 'sp-status-low' :
                      item.status === 'empty' ? 'sp-status-empty' : 'sp-status-expiring'
                    }`}
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    {item.status === 'safe' && '🟢 Aman'}
                    {item.status === 'low' && '🟡 Menipis'}
                    {item.status === 'empty' && '🔴 Habis'}
                    {item.status === 'expiring' && '⏰ Exp Segera'}
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    {item.brand} • <span style={{ color: '#10b981' }}>{item.ean}</span>
                  </div>
                  <h3 style={{ margin: '2px 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{item.zoneIcon} {item.zone}</span>
                  </div>
                </div>

                {/* Progress & Quantity */}
                <div style={{ margin: '12px 0', padding: '10px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--gray-600)' }}>Kuantitas Stok:</span>
                    <strong style={{ color: item.qty === 0 ? '#b91c1c' : item.qty <= item.maxQty * 0.3 ? '#b45309' : '#047857' }}>
                      {item.qty} / {item.maxQty} {item.unit}
                    </strong>
                  </div>
                  <div className="sp-progress-bar">
                    <div
                      className="sp-progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.qty === 0 ? '#ef4444' : item.qty <= item.maxQty * 0.3 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    <span>Exp: {item.expiry}</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{item.expiryStatus}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                  <button
                    onClick={() => {
                      changeQty(item.id, -1);
                      showToast(`Stok "${item.name}" dikurangi 1 ${item.unit}`);
                    }}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-700)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{item.qty}</span>
                  <button
                    onClick={() => {
                      changeQty(item.id, 1);
                      showToast(`Stok "${item.name}" ditambah 1 ${item.unit}`);
                    }}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-700)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => handleAddToShoppingList(item)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ShoppingCart size={14} />
                  <span>+ Belanja</span>
                </button>

                <button
                  onClick={() => {
                    deletePantryItem(item.id);
                    showToast(`"${item.name}" dihapus dari inventaris.`);
                  }}
                  style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                  title="Hapus Barang"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      <AddPantryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => showToast('Item inventaris baru berhasil didaftarkan!')}
      />
    </div>
  );
};

export default StockPantryInventoryPage;
