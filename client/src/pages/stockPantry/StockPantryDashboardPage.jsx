import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Refrigerator,
  Package,
  AlertTriangle,
  Clock,
  ShoppingCart,
  PlusCircle,
  Utensils,
  ChevronRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Boxes,
  PieChart
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import AddPantryItemModal from './AddPantryItemModal';
import './StockPantryPages.css';

const StockPantryDashboardPage = () => {
  const { pantryItems, shoppingList, consumeItem } = useStockPantry();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuickItem, setSelectedQuickItem] = useState('');
  const [quickQty, setQuickQty] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const totalItems = pantryItems.length;
  const lowItems = pantryItems.filter(i => i.status === 'low' || i.qty === 0);
  const expiringItems = pantryItems.filter(i => i.expiryDays <= 3 && i.qty > 0);
  const totalValuation = pantryItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalNeededShopping = shoppingList.length;

  const handleQuickConsume = () => {
    if (!selectedQuickItem) return;
    const item = pantryItems.find(i => i.id === selectedQuickItem);
    if (!item) return;

    consumeItem(item.id, parseFloat(quickQty) || 1, 'Quick consume via dashboard');
    showToast(`Berhasil mencatat pemakaian ${quickQty} ${item.unit} ${item.name}!`);
    setSelectedQuickItem('');
  };

  return (
    <div className="sp-container">
      {/* Toast Notification */}
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
            <span className="sp-badge-live">StockPantry Engine</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>🟢 Sinkronisasi Realtime</span>
          </div>
          <h1 className="sp-page-title">
            <Refrigerator className="sp-text-primary" size={28} />
            Dashboard Inventaris Dapur & Kulkas
          </h1>
          <p className="sp-page-subtitle">
            Pantau stok bahan pangan, mitigasi food waste, dan sinkronkan daftar belanja secara otomatis.
          </p>
        </div>

        <div className="sp-actions-group">
          <Link to="/stockpantry/shopping-list" className="sp-btn-secondary">
            <ShoppingCart size={18} color="#f59e0b" />
            <span>Shopping List ({totalNeededShopping})</span>
          </Link>
          <button onClick={() => setIsAddModalOpen(true)} className="sp-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Total Stok Tersimpan</span>
              <div className="sp-kpi-value">{totalItems} Item</div>
            </div>
            <div className="sp-kpi-icon-box">
              <Boxes size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Valuasi Stok Rumah</span>
            <strong style={{ color: '#047857' }}>Rp {totalValuation.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div className="sp-kpi-card" style={{ borderColor: lowItems.length > 0 ? '#fde68a' : 'var(--gray-200)' }}>
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#b45309' }}>Stok Menipis / Habis</span>
              <div className="sp-kpi-value" style={{ color: '#b45309' }}>{lowItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Perlu Segera Restock</span>
            <strong style={{ color: '#b45309' }}>{lowItems.filter(i => i.qty === 0).length} Habis Total</strong>
          </div>
        </div>

        <div className="sp-kpi-card" style={{ borderColor: expiringItems.length > 0 ? '#ffedd5' : 'var(--gray-200)' }}>
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#c2410c' }}>Kedaluwarsa Kritis</span>
              <div className="sp-kpi-value" style={{ color: '#c2410c' }}>{expiringItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Batas Masa Simpan</span>
            <strong style={{ color: '#c2410c' }}>&le; 3 Hari Lagi</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Smart Shopping List</span>
              <div className="sp-kpi-value">{totalNeededShopping} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <ShoppingCart size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Estimasi Kebutuhan</span>
            <strong style={{ color: '#d97706' }}>Rp {shoppingList.reduce((s, i) => s + i.price, 0).toLocaleString('id-ID')}</strong>
          </div>
        </div>
      </div>

      {/* Priority Zero Waste Section */}
      <div className="sp-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock color="#ef4444" size={20} />
              Prioritas Habiskan Segera! (Zero Food Waste)
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
              Bahan yang harus dikonsumsi sebelum melewati tanggal kedaluwarsa
            </span>
          </div>
          <Link to="/stockpantry/expiry" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <span>Lihat Timeline</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {expiringItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', color: '#047857', fontWeight: 600 }}>
              🎉 Tidak ada bahan makanan kritis! Semua stok dalam batas waktu aman.
            </div>
          ) : (
            expiringItems.slice(0, 3).map(item => (
              <div key={item.id} style={{ border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: '#fff5f5', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>{item.expiryStatus}</span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{item.zoneIcon} {item.zone} · Sisa: <strong>{item.qty} {item.unit}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      consumeItem(item.id, 1, 'Habiskan karena mendekati expired');
                      showToast(`Konsumsi 1 ${item.unit} ${item.name} tercatat!`);
                    }}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#10b981', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Utensils size={14} />
                    <span>Pakai Sekarang</span>
                  </button>
                  <Link
                    to="/stockpantry/shopping-list"
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--gray-300)', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Tambah Pengganti ke Shopping List"
                  >
                    <ShoppingCart size={16} color="#d97706" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Operations Row: Quick Consume & Critical Restock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Quick Consume Widget */}
        <div className="sp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap color="#10b981" size={18} />
              Quick Consume Widget
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>1-Klik Catat</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Pilih Bahan Dipakai</label>
              <select
                value={selectedQuickItem}
                onChange={(e) => setSelectedQuickItem(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
              >
                <option value="">-- Pilih Bahan Makanan --</option>
                {pantryItems.filter(i => i.qty > 0).map(i => (
                  <option key={i.id} value={i.id}>{i.name} (Tersedia: {i.qty} {i.unit})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Jumlah</label>
                <input
                  type="number"
                  step="any"
                  value={quickQty}
                  onChange={(e) => setQuickQty(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={handleQuickConsume}
                  className="sp-btn-primary"
                  disabled={!selectedQuickItem}
                  style={{ height: '42px', opacity: selectedQuickItem ? 1 : 0.6 }}
                >
                  <Utensils size={16} />
                  <span>Catat Pemakaian</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Restock List */}
        <div className="sp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle color="#b45309" size={18} />
              Stok Kritis & Perlu Restock
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)' }}>{lowItems.length} Item Menipis</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lowItems.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.875rem' }}>Semua stok bahan dalam kondisi aman!</p>
            ) : (
              lowItems.slice(0, 4).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-900)' }}>{item.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.zoneIcon} {item.zone} · Sisa: <strong style={{ color: item.qty === 0 ? '#b91c1c' : '#b45309' }}>{item.qty} {item.unit}</strong></span>
                  </div>
                  <Link to="/stockpantry/shopping-list" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textDecoration: 'none', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                    + Ke Shopping List
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddPantryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => showToast('Bahan makanan baru berhasil disimpan!')}
      />
    </div>
  );
};

export default StockPantryDashboardPage;
