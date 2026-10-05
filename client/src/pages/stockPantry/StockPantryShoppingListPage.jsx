import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Copy,
  PlusCircle,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Store,
  DollarSign
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import './StockPantryPages.css';

const StockPantryShoppingListPage = () => {
  const { shoppingList, toggleShoppingCheck, commitRestock, addShoppingItem } = useStockPantry();
  const [newManualItem, setNewManualItem] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const checkedCount = shoppingList.filter(i => i.checked).length;
  const totalCost = shoppingList.reduce((sum, i) => sum + i.price, 0);
  const checkedCost = shoppingList.filter(i => i.checked).reduce((sum, i) => sum + i.price, 0);

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!newManualItem.trim()) return;

    addShoppingItem({
      name: newManualItem,
      sub: '1 Unit',
      reason: 'Manual Restock',
      price: 20000,
      zone: '🥫 Lemari Dapur'
    });
    setNewManualItem('');
    showToast('Item manual berhasil ditambahkan ke daftar belanja!');
  };

  const handleCommit = () => {
    const restockedCount = commitRestock();
    if (restockedCount > 0) {
      showToast(`🎉 Sukses! ${restockedCount} barang belanjaan berhasil di-restock ke inventaris dapur!`);
    } else {
      showToast('Centang terlebih dahulu barang yang sudah dibeli!');
    }
  };

  const copyWhatsApp = () => {
    const text = `🛒 *Daftar Belanja StockPantry*\n` +
      shoppingList.map(i => `• ${i.name} (${i.sub}) ~ Rp ${i.price.toLocaleString('id-ID')}`).join('\n') +
      `\n\n*Total Estimasi: Rp ${totalCost.toLocaleString('id-ID')}*`;

    navigator.clipboard?.writeText(text);
    showToast('Daftar belanja disalin ke clipboard untuk WhatsApp!');
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
            <span className="sp-badge-live">Restock Studio</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>🟢 Auto-Generated</span>
          </div>
          <h1 className="sp-page-title">
            <ShoppingCart className="sp-text-primary" size={28} />
            Smart Shopping List & Restock
          </h1>
          <p className="sp-page-subtitle">
            Daftar belanja otomatis dari stok yang menipis & habis + checklist interaktif saat belanja.
          </p>
        </div>

        <div className="sp-actions-group">
          <button onClick={copyWhatsApp} className="sp-btn-secondary">
            <Copy size={18} color="#10b981" />
            <span>Salin WA Format</span>
          </button>
          <button onClick={handleCommit} className="sp-btn-primary">
            <CheckCircle2 size={18} />
            <span>Selesaikan & Restock ({checkedCount})</span>
          </button>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Total Item Belanja</span>
              <div className="sp-kpi-value">{shoppingList.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box">
              <ShoppingCart size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Progress Checklist</span>
            <strong style={{ color: '#10b981' }}>{checkedCount} / {shoppingList.length} Selesai</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Estimasi Total Biaya</span>
              <div className="sp-kpi-value" style={{ color: '#047857' }}>Rp {totalCost.toLocaleString('id-ID')}</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Tercentang di Keranjang</span>
            <strong style={{ color: '#047857' }}>Rp {checkedCost.toLocaleString('id-ID')}</strong>
          </div>
        </div>
      </div>

      {/* Main Shopping Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* List Section */}
        <div className="sp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Checklist Belanja Aktif
          </h3>

          <form onSubmit={handleAddManual} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="+ Tambah belanjaan manual (mis. Biskuit Tamu)..."
              value={newManualItem}
              onChange={(e) => setNewManualItem(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '0.875rem' }}
            />
            <button type="submit" className="sp-btn-primary" style={{ padding: '10px 16px' }}>
              <PlusCircle size={16} />
              <span>Tambah</span>
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shoppingList.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Daftar belanjaan kosong! Semua stok dapur tercukupi.</p>
            ) : (
              shoppingList.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleShoppingCheck(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: item.checked ? 'var(--gray-100)' : '#ffffff',
                    border: '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    opacity: item.checked ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.checked ? (
                      <CheckSquare size={22} color="#10b981" />
                    ) : (
                      <Square size={22} color="var(--gray-400)" />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-900)', textDecoration: item.checked ? 'line-through' : 'none' }}>
                        {item.name} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--gray-500)' }}>({item.sub})</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={12} /> {item.store || 'Supermarket'} • <strong style={{ color: '#b45309' }}>{item.reason}</strong>
                      </span>
                    </div>
                  </div>

                  <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Restock Summary Studio Sidebar */}
        <div className="sp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#10b981" size={20} />
            Restock Checkout Studio
          </h3>

          <div style={{ padding: '16px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--gray-600)' }}>Di Keranjang:</span>
              <strong>{checkedCount} Item</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--gray-600)' }}>Belum Dibeli:</span>
              <span>{shoppingList.length - checkedCount} Item</span>
            </div>
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>
              <span>Total Diisi:</span>
              <span style={{ color: '#047857' }}>Rp {checkedCost.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            onClick={handleCommit}
            className="sp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <CheckCircle2 size={18} />
            <span>Update Stok Dapur Sekarang</span>
          </button>

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Preview Text Format WA
            </span>
            <pre style={{ margin: 0, padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-900)', color: '#34d399', fontSize: '0.75rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {`🛒 *Daftar Belanja StockPantry*\n` +
              shoppingList.map(i => `• ${i.name} (${i.sub})`).join('\n') +
              `\n*Total: Rp ${totalCost.toLocaleString('id-ID')}*`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPantryShoppingListPage;
