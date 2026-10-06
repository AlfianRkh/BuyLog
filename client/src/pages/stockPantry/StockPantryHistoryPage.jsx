import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Undo2,
  Trash2,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Utensils,
  ShoppingCart
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import './StockPantryPages.css';

const StockPantryHistoryPage = () => {
  const { logs, undoLog } = useStockPantry();
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchLog, setSearchLog] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredLogs = logs.filter(log => {
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = log.name.toLowerCase().includes(searchLog.toLowerCase()) ||
                          (log.note && log.note.toLowerCase().includes(searchLog.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUndo = (logId, name, change) => {
    undoLog(logId);
    showToast(`Undo Berhasil: Pemakaian "${name}" (${change}) dibatalkan.`);
  };

  const totalKonsumsi = logs.filter(l => l.category === 'konsumsi' && !l.undone).length;
  const wasteLogs = logs.filter(l => l.category === 'waste' && !l.undone);
  const totalWaste = wasteLogs.length;

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
            <span className="sp-badge-live">Audit Log Dapur</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>🟢 Undo Available 24h</span>
          </div>
          <h1 className="sp-page-title">
            <History className="sp-text-primary" size={28} />
            Riwayat Konsumsi &amp; Audit Log Dapur
          </h1>
          <p className="sp-page-subtitle">
            Lacak laju konsumsi harian, histori restock, pembuangan food waste, dan fitur Undo pencatatan.
          </p>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Total Transaksi Konsumsi</span>
              <div className="sp-kpi-value">{totalKonsumsi} Catatan</div>
            </div>
            <div className="sp-kpi-icon-box">
              <Utensils size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Aktivitas Masak</span>
            <strong style={{ color: '#10b981' }}>{logs.length} Total Log</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label" style={{ color: '#b91c1c' }}>Food Waste Terbuang</span>
              <div className="sp-kpi-value" style={{ color: '#b91c1c' }}>{totalWaste} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <Trash2 size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Status Mitigasi Waste</span>
            <strong style={{ color: totalWaste > 0 ? '#b91c1c' : '#10b981' }}>
              {totalWaste > 0 ? 'Perlu Perhatian' : 'Sangat Baik'}
            </strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Efisiensi Konsumsi</span>
              <div className="sp-kpi-value" style={{ color: '#047857' }}>
                {logs.length > 0 ? `${Math.round(((logs.length - totalWaste) / logs.length) * 100)}%` : '100%'}
              </div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Pemanfaatan Stok</span>
            <strong style={{ color: '#047857' }}>Zero Waste Target</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="sp-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Semua Aksi' },
            { id: 'konsumsi', label: '🍽️ Konsumsi Masak' },
            { id: 'waste', label: '🗑️ Dibuang / Expired' },
            { id: 'restock', label: '🛒 Restock Masuk' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--gray-200)',
                backgroundColor: filterCategory === f.id ? '#10b981' : '#ffffff',
                color: filterCategory === f.id ? '#ffffff' : 'var(--gray-700)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sp-search-input">
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            placeholder="Cari histori nama bahan atau menu..."
            value={searchLog}
            onChange={(e) => setSearchLog(e.target.value)}
          />
        </div>
      </div>

      {/* Log Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
            📜 Belum ada riwayat konsumsi atau audit log dapur yang tercatat.
          </div>
        ) : (
          filteredLogs.map(log => (
          <div
            key={log.id}
            className="sp-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              opacity: log.undone ? 0.5 : 1,
              backgroundColor: log.undone ? 'var(--gray-100)' : '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--gray-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {log.icon}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>{log.name}</strong>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: log.category === 'restock' ? '#ecfdf5' : '#fef2f2',
                    color: log.category === 'restock' ? '#047857' : '#b91c1c'
                  }}>
                    {log.change}
                  </span>
                  {log.undone ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>(DIBATALKAN)</span>
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>• Sisa: <strong>{log.stockRemaining}</strong></span>
                  )}
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>⏱️ {log.time}</span>
                  <span>📍 {log.location}</span>
                  {log.note && <span style={{ fontStyle: 'italic', color: 'var(--gray-700)' }}>"{log.note}"</span>}
                </div>
              </div>
            </div>

            {log.canUndo && !log.undone && (
              <button
                onClick={() => handleUndo(log.id, log.name, log.change)}
                className="sp-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                <Undo2 size={14} color="#10b981" />
                <span>Undo</span>
              </button>
            )}
          </div>
        )))}
      </div>
    </div>
  );
};

export default StockPantryHistoryPage;
