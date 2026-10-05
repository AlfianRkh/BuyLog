import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShoppingCart,
  Utensils,
  RefreshCw,
  Skull,
  ShieldCheck
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import './StockPantryPages.css';

const StockPantryExpiryPage = () => {
  const { pantryItems, consumeItem, discardItem } = useStockPantry();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const expiredItems = pantryItems.filter(i => i.expiryDays < 0 || i.status === 'expired');
  const criticalItems = pantryItems.filter(i => i.expiryDays >= 0 && i.expiryDays <= 3 && i.status !== 'expired');
  const weekItems = pantryItems.filter(i => i.expiryDays >= 4 && i.expiryDays <= 7);
  const safeItems = pantryItems.filter(i => i.expiryDays > 7);

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
            <span className="sp-badge-live">Zero Food Waste Radar</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>🟢 Audit Masa Simpan</span>
          </div>
          <h1 className="sp-page-title">
            <Clock className="sp-text-primary" size={28} />
            Pelacak Kedaluwarsa & Freshness Timeline
          </h1>
          <p className="sp-page-subtitle">
            Visualisasi tingkat urgensi kedaluwarsa bahan makanan untuk mencegah pemborosan dapur.
          </p>
        </div>

        <div className="sp-actions-group">
          <button onClick={() => showToast('Disinkronkan dengan 3 resep masak cepat!')} className="sp-btn-secondary">
            <RefreshCw size={18} color="#10b981" />
            <span>Sinkronkan Resep Masak</span>
          </button>
          <button onClick={() => showToast('Audit Food Waste Selesai!')} className="sp-btn-secondary" style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
            <Trash2 size={18} />
            <span>Audit Waste</span>
          </button>
        </div>
      </div>

      {/* 4 Urgency Counter Cards */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card" style={{ borderColor: expiredItems.length > 0 ? '#fecaca' : 'var(--gray-200)' }}>
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#b91c1c' }}>1. Sudah Kedaluwarsa</span>
              <div className="sp-kpi-value" style={{ color: '#b91c1c' }}>{expiredItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <Skull size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Perlu Segera Dibuang</span>
            <strong style={{ color: '#b91c1c' }}>Risk High</strong>
          </div>
        </div>

        <div className="sp-kpi-card" style={{ borderColor: criticalItems.length > 0 ? '#ffedd5' : 'var(--gray-200)' }}>
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#c2410c' }}>2. Kritis (&le; 3 Hari)</span>
              <div className="sp-kpi-value" style={{ color: '#c2410c' }}>{criticalItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Prioritas Masak</span>
            <strong style={{ color: '#c2410c' }}>Olahan Cepat</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#b45309' }}>3. Minggu Ini (4-7 Hari)</span>
              <div className="sp-kpi-value" style={{ color: '#b45309' }}>{weekItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Rencanakan Menu</span>
            <strong style={{ color: '#b45309' }}>Weekly Plan</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#047857' }}>4. Stok Aman (&gt; 7 Hari)</span>
              <div className="sp-kpi-value" style={{ color: '#047857' }}>{safeItems.length} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Stok Terjaga</span>
            <strong style={{ color: '#047857' }}>Stabil</strong>
          </div>
        </div>
      </div>

      {/* Expiry Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Expired */}
        {expiredItems.length > 0 && (
          <div className="sp-card" style={{ borderLeft: '4px solid #b91c1c' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Skull size={20} />
              1. Sudah Kedaluwarsa ({expiredItems.length} Item)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiredItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                    <img src={item.img} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>{item.name}</div>
                      <span style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 600 }}>{item.expiryStatus} ({item.expiry}) • Sisa: {item.qty} {item.unit}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        discardItem(item.id, 'Kedaluwarsa');
                        showToast(`"${item.name}" dicatat ke log waste & dibuang.`);
                      }}
                      style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Trash2 size={14} />
                      <span>Buang (Catat Waste)</span>
                    </button>
                    <Link
                      to="/stockpantry/shopping-list"
                      className="sp-btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                    >
                      <ShoppingCart size={14} color="#d97706" />
                      <span>Beli Pengganti</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Critical */}
        <div className="sp-card" style={{ borderLeft: '4px solid #c2410c' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} />
            2. Kritis: Hari Ini s/d 3 Hari ({criticalItems.length} Item)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criticalItems.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.875rem' }}>Tidak ada barang dalam masa kritis &le; 3 hari!</p>
            ) : (
              criticalItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                    <img src={item.img} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>{item.name}</div>
                      <span style={{ fontSize: '0.8125rem', color: '#c2410c', fontWeight: 600 }}>{item.zoneIcon} {item.zone} • Exp: {item.expiry} ({item.expiryStatus})</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        consumeItem(item.id, 1, 'Memakai bahan kritis');
                        showToast(`Konsumsi "${item.name}" berhasil dicatat!`);
                      }}
                      className="sp-btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                    >
                      <Utensils size={14} />
                      <span>Pakai Sekarang</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Safe Stock */}
        <div className="sp-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck color="#10b981" size={20} />
            3. Stok Masa Simpan Aman ({safeItems.length} Item)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {safeItems.slice(0, 6).map(item => (
              <div key={item.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={item.img} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Exp: {item.expiry} ({item.expiryDays} hari lagi)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPantryExpiryPage;
