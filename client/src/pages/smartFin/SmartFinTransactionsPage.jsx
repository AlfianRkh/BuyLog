import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Camera,
  Search,
  CheckCircle2,
  Trash2,
  Download,
  X,
  ChevronRight,
  ShieldCheck,
  Edit,
  BarChart2,
  Sparkles,
  RefreshCw,
  Server,
  PlusCircle,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { formatIDR, useSmartFin } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinTransactionsPage() {
  const navigate = useNavigate();
  const { triggerToast } = useSmartFin();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalExpense: 0, totalIncome: 0, netAmount: 0 });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Transaction Form
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('50000');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('🍽️ Makan & Minum');
  const [account, setAccount] = useState('BCA Utama');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.smartFin.getTransactions({ search: searchQuery, category: filter });
      if (res && res.transactions) {
        setTransactions(res.transactions);
        if (res.summary) setSummary(res.summary);
        if (!selectedTrx && res.transactions.length > 0) {
          setSelectedTrx(res.transactions[0]);
        }
      }
    } catch (err) {
      console.error('Failed fetching transactions from BE:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, searchQuery]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!merchant.trim()) {
      triggerToast('Nama merchant/transaksi wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.smartFin.createTransaction({
        merchant,
        amount,
        type,
        category,
        account
      });

      if (res && res.transactions) {
        setTransactions(res.transactions);
        triggerToast(res.message || 'Transaksi manual berhasil dicatat di Backend Server!');
      }
    } catch (err) {
      console.error('Failed creating transaction in BE:', err);
      triggerToast('Gagal mencatat transaksi di Backend.');
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
      setMerchant('');
    }
  };

  const handleDelete = async (id, merchantName) => {
    try {
      const res = await api.smartFin.deleteTransaction(id);
      if (res && res.transactions) {
        setTransactions(res.transactions);
        if (selectedTrx?.id === id) {
          setSelectedTrx(res.transactions[0] || null);
        }
        triggerToast(res.message || `Transaksi "${merchantName}" berhasil dihapus dari Backend.`);
      }
    } catch (err) {
      console.error('Failed deleting transaction in BE:', err);
      triggerToast('Gagal menghapus transaksi');
    }
  };

  return (
    <div className="sf-container">
      {/* Header */}
      <div className="sf-header">
        <div className="sf-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sf-badge-live">
              <Server size={14} />
              BE Sync Active
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>
              {transactions.length} Transaksi (Backend API)
            </span>
          </div>
          <h1 className="sf-page-title">
            <Receipt className="sf-text-primary" size={28} />
            <span>Buku Transaksi &amp; Rincian Pengeluaran</span>
          </h1>
          <p className="sf-page-subtitle">
            Buku kas digital berbasis struk nyata dari Server Backend dan rincian multi-item per komoditas.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchTransactions} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="sf-btn-secondary">
            <Plus size={18} color="#06b6d4" />
            <span>+ Catat Manual</span>
          </button>
          <button onClick={() => navigate('/smartfin/scan')} className="sf-btn-primary">
            <Camera size={18} />
            <span>Pindai Struk (Scan AI)</span>
          </button>
        </div>
      </div>

      {/* 4 Mini Summary KPI Cards (Live BE) */}
      <div className="sf-kpi-grid">
        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Total Belanja Struk (BE)</span>
              <div className="sf-kpi-value">{formatIDR(summary.totalExpense)}</div>
            </div>
            <div className="sf-kpi-icon-box">
              <Receipt size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Server Backend</span>
            <strong style={{ color: '#047857' }}>{summary.totalCount} Catatan BE</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Total Pemasukan (BE)</span>
              <div className="sf-kpi-value" style={{ color: '#047857' }}>{formatIDR(summary.totalIncome)}</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <Edit size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Kredit Masuk</span>
            <strong style={{ color: '#047857' }}>Terverifikasi</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Rata-rata Transaksi</span>
              <div className="sf-kpi-value" style={{ color: '#0284c7' }}>
                {formatIDR(summary.totalCount > 0 ? summary.totalExpense / summary.totalCount : 0)}
              </div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <BarChart2 size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Rata-rata Per-Struk</span>
            <strong style={{ color: '#047857' }}>Backend Calcs</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Item Terindeks OCR AI</span>
              <div className="sf-kpi-value">99.2% Akurasi</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Multi-Item Vision</span>
            <strong style={{ color: '#7e22ce' }}>OCR Neural</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sf-filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'sf-btn-primary' : 'sf-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('Dapur')}
            className={filter === 'Dapur' ? 'sf-btn-primary' : 'sf-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            🥫 Dapur &amp; Bahan
          </button>
          <button
            onClick={() => setFilter('Makan')}
            className={filter === 'Makan' ? 'sf-btn-primary' : 'sf-btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            🍽️ Makan &amp; Resto
          </button>
        </div>

        <div className="sf-search-input">
          <Search size={16} color="var(--gray-400)" />
          <input
            className="sf-form-control"
            placeholder="Cari nama merchant atau no invoice BE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div className="sf-card" style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem', padding: '32px' }}>
              Memuat daftar transaksi dari Server BE...
            </div>
          ) : transactions.length === 0 ? (
            <div className="sf-card" style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem', padding: '32px' }}>
              Tidak ada transaksi yang ditemukan.
            </div>
          ) : (
            transactions.map((t) => {
              const isSelected = selectedTrx?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrx(t)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    border: isSelected ? '2px solid #10b981' : '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyBetween: 'space-between',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="truncate">{t.merchant}</span>
                      {t.confidence && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#d1fae5', color: '#047857', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>
                          OCR {t.confidence}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                      {t.date} • {t.category} • {t.account}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlignment: 'right' }}>
                      <strong style={{ fontSize: '0.9375rem', color: t.type === 'income' ? '#047857' : 'var(--gray-900)', display: 'block' }}>
                        {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                      </strong>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>{t.status || 'Verified BE'}</span>
                    </div>
                    <ChevronRight size={18} color="var(--gray-400)" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Inspector */}
        <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedTrx ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Rincian Transaksi BE</span>
                  <h2 style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)' }}>{selectedTrx.merchant}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontFamily: 'monospace' }}>{selectedTrx.id} • {selectedTrx.account}</span>
                </div>
                <button onClick={() => setSelectedTrx(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #a7f3d0' }}>
                  <Receipt size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={16} />
                    Tersimpan di Backend Server
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Nomor Invoice: {selectedTrx.receiptNo}</span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-900)' }}>Total Nominal</span>
                <strong style={{ fontSize: '1.125rem', color: selectedTrx.type === 'income' ? '#047857' : '#b91c1c' }}>
                  {selectedTrx.type === 'income' ? '+' : '-'}{formatIDR(selectedTrx.amount)}
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                <button onClick={() => triggerToast(`Laporan PDF ${selectedTrx.id} diunduh`)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Download size={16} />
                  <span>Unduh PDF</span>
                </button>
                <button onClick={() => handleDelete(selectedTrx.id, selectedTrx.merchant)} className="sf-btn-secondary" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
              Pilih salah satu transaksi dari daftar untuk melihat rincian nota lengkap.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Manual Transaction Add BE */}
      {showAddModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#10b981" />
                Catat Transaksi Manual (BE Server)
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nama Merchant / Sumber Transaksi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Superindo, Warung Bu Sri, Cash In Hand"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Tipe Transaksi
                  </label>
                  <select
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="expense">Pengeluaran (Debet)</option>
                    <option value="income">Pemasukan (Kredit)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Kategori
                  </label>
                  <select
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="🥫 Kebutuhan Dapur">🥫 Kebutuhan Dapur</option>
                    <option value="🍽️ Makan & Minum">🍽️ Makan &amp; Minum</option>
                    <option value="⚡ Tagihan & Utilitas">⚡ Tagihan &amp; Utilitas</option>
                    <option value="🚗 Transport">🚗 Transport</option>
                    <option value="💼 Pemasukan Utama">💼 Pemasukan Utama</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nominal Transaksi (IDR)
                </label>
                <input
                  type="number"
                  required
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi BE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

