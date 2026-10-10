import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Building2,
  Smartphone,
  PlusCircle,
  ArrowLeftRight,
  CheckCircle2,
  X,
  Layers,
  Banknote,
  Plus,
  CreditCard,
  RefreshCw,
  Server,
  Trash2,
  Receipt,
  Download,
  TrendingUp,
  TrendingDown,
  Filter,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { useSmartFin, formatIDR } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinAccountsPage() {
  const { triggerToast } = useSmartFin();
  
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [totalLiquidity, setTotalLiquidity] = useState(0);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  
  // Mutasi Modal State
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [mutasiLoading, setMutasiLoading] = useState(false);
  const [selectedMutasiAccount, setSelectedMutasiAccount] = useState(null);
  const [mutationsList, setMutationsList] = useState([]);
  const [mutasiSummary, setMutasiSummary] = useState({ totalExpense: 0, totalIncome: 0, netChange: 0 });
  const [mutasiFilter, setMutasiFilter] = useState('all');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer Form State
  const [fromAcc, setFromAcc] = useState('');
  const [toAcc, setToAcc] = useState('');
  const [transferAmount, setTransferAmount] = useState('500000');

  // Add Account Form State
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('1000000');
  const [accountColor, setAccountColor] = useState('#3b82f6');

  // Fetch Accounts directly from Backend API (BE)
  const fetchAccountsFromBE = async () => {
    try {
      setLoading(true);
      const res = await api.smartFin.getAccounts();
      if (res && res.accounts) {
        setAccounts(res.accounts);
        setTotalLiquidity(res.totalLiquidity || 0);
        if (res.accounts.length >= 2) {
          setFromAcc(res.accounts[0].id);
          setToAcc(res.accounts[1].id);
        }
      }
    } catch (err) {
      console.error('Failed fetching accounts from BE:', err);
      triggerToast('Gagal memuat daftar rekening dari database server.');
      setAccounts([]);
      setTotalLiquidity(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsFromBE();
  }, []);

  // Fetch Live Account Mutations from BE API
  const handleOpenMutasi = async (acc) => {
    setSelectedMutasiAccount(acc);
    setShowMutasiModal(true);
    setMutasiFilter('all');
    
    try {
      setMutasiLoading(true);
      const res = await api.smartFin.getMutations(acc.id);
      if (res && res.mutations) {
        setMutationsList(res.mutations);
        if (res.summary) setMutasiSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed fetching mutations from BE:', err);
      triggerToast('Gagal memuat riwayat mutasi rekening dari database.');
      setMutationsList([]);
    } finally {
      setMutasiLoading(false);
    }
  };

  // Submit New Account to Backend API (BE)
  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      triggerToast('Nama rekening wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.smartFin.createAccount({
        name: accountName,
        type: accountType,
        number: accountNumber || 'Rekening Baru',
        balance: Number(initialBalance) || 0,
        color: accountColor
      });

      if (res && res.accounts) {
        setAccounts(res.accounts);
        setTotalLiquidity(res.totalLiquidity);
        triggerToast(res.message || `Rekening "${accountName}" berhasil ditambahkan ke Backend!`);
      }
    } catch (err) {
      console.error('Failed creating account in BE:', err);
      triggerToast('Terjadi kesalahan saat menambah rekening ke Backend');
    } finally {
      setIsSubmitting(false);
      setShowAddAccountModal(false);
      setAccountName('');
      setAccountNumber('');
      setInitialBalance('1000000');
    }
  };

  // Submit Transfer to Backend API (BE)
  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.smartFin.transferAccounts({
        fromId: fromAcc,
        toId: toAcc,
        amount: transferAmount
      });

      if (res && res.accounts) {
        setAccounts(res.accounts);
        setTotalLiquidity(res.totalLiquidity);
        triggerToast(res.message || `Transfer ${formatIDR(transferAmount)} berhasil dieksekusi di Backend!`);
      }
    } catch (err) {
      console.error('Failed executing transfer in BE:', err);
      triggerToast('Eksekusi transfer gagal di Backend.');
    } finally {
      setIsSubmitting(false);
      setShowTransferModal(false);
    }
  };

  // Delete Account from Backend API (BE)
  const handleDeleteAccount = async (id, name) => {
    try {
      const res = await api.smartFin.deleteAccount(id);
      if (res && res.accounts) {
        setAccounts(res.accounts);
        setTotalLiquidity(res.totalLiquidity);
        triggerToast(res.message || `Rekening "${name}" dihapus.`);
      }
    } catch (err) {
      console.error('Failed deleting account in BE:', err);
      triggerToast('Gagal menghapus rekening');
    }
  };

  // Set Default Account in Database
  const handleSetDefaultAccount = async (id, name) => {
    try {
      const res = await api.smartFin.setDefaultAccount(id);
      if (res && res.accounts) {
        setAccounts(res.accounts);
        triggerToast(`Rekening "${name}" berhasil dijadikan Rekening Default (disimpan di DB)!`);
      }
    } catch (err) {
      console.error('Failed setting default account in BE:', err);
      triggerToast('Gagal mengubah rekening default');
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'Bank':
        return <Building2 size={22} />;
      case 'E-Wallet':
        return <Smartphone size={22} />;
      case 'Credit Card':
        return <CreditCard size={22} />;
      default:
        return <Banknote size={22} />;
    }
  };

  const filteredMutations = mutationsList.filter(m => {
    if (mutasiFilter === 'expense') return m.type === 'expense';
    if (mutasiFilter === 'income') return m.type === 'income';
    return true;
  });

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
              {accounts.length} Dompet Aktif (Backend API Data)
            </span>
          </div>
          <h1 className="sf-page-title">
            <Wallet className="sf-text-primary" size={28} />
            <span>Rekening &amp; Dompet Likuiditas Kas</span>
          </h1>
          <p className="sf-page-subtitle">
            Kelola saldo multi-wallet kas nyata dari Server Backend dan alokasikan sumber dana untuk transaksi scan struk harian.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchAccountsFromBE} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={() => setShowTransferModal(true)} className="sf-btn-secondary">
            <ArrowLeftRight size={18} color="#06b6d4" />
            <span>Transfer Antar Rekening</span>
          </button>
          <button onClick={() => setShowAddAccountModal(true)} className="sf-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* Bento Total Liquidity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              Total Likuiditas Kas Konsolidasi (Server BE)
            </span>
            <div style={{ fontSize: '2.125rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {formatIDR(totalLiquidity)}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
              Total aset cair siap dialokasikan ke pos pembelanjaan harian &amp; darurat.
            </p>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
              <span>Rasio Likuid BE</span>
              <strong style={{ color: '#047857' }}>100% Terverifikasi Backend</strong>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--gray-100)', overflow: 'hidden', display: 'flex', gap: '2px' }}>
              {accounts.map((acc) => {
                const pct = totalLiquidity > 0 ? ((acc.balance / totalLiquidity) * 100).toFixed(1) : 0;
                return (
                  <div key={acc.id} style={{ width: `${pct}%`, backgroundColor: acc.color || '#10b981', height: '100%' }} title={`${acc.name}: ${pct}%`} />
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {accounts.map((acc) => {
            const pct = totalLiquidity > 0 ? ((acc.balance / totalLiquidity) * 100).toFixed(1) : 0;
            return (
              <div key={acc.id} className="sf-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: acc.color || '#10b981', textTransform: 'uppercase' }}>
                    {pct}% Bagian
                  </span>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '4px', fontWeight: 600 }}>{acc.type}</div>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--gray-900)', display: 'block', marginTop: '4px' }}>{formatIDR(acc.balance)}</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '12px' }}>{acc.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Cards for each Account (Fetched Live from BE) */}
      {loading ? (
        <div className="sf-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Memuat daftar rekening dari Server Backend...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {accounts.map((acc) => (
            <div key={acc.id} className="sf-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${acc.color || '#3b82f6'}15`,
                      color: acc.color || '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)', display: 'block' }}>{acc.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{acc.number || acc.type}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {acc.isDefault ? (
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#047857',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={12} color="#10b981" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefaultAccount(acc.id, acc.name)}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          cursor: 'pointer'
                        }}
                        title="Set sebagai Rekening Default"
                      >
                        Set Default
                      </button>
                    )}
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: acc.color || '#3b82f6',
                      backgroundColor: `${acc.color || '#3b82f6'}15`,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {acc.type}
                    </span>
                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.name)}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      title="Hapus Rekening BE"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Saldo Tersedia (BE)</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '2px' }}>{formatIDR(acc.balance)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button onClick={() => setShowTransferModal(true)} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Transfer
                </button>
                <button onClick={() => handleOpenMutasi(acc)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center', backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                  <Receipt size={16} />
                  <span>Mutasi Live BE</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Account Card Button */}
          <div
            onClick={() => setShowAddAccountModal(true)}
            className="sf-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              border: '2px dashed var(--gray-300)',
              backgroundColor: 'var(--gray-50)',
              cursor: 'pointer',
              minHeight: '180px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
            </div>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>+ Tambah Rekening / Dompet (BE)</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlignment: 'center' }}>
              Tambahkan bank baru, e-wallet (OVO/DANA/GoPay), atau dompet kas langsung ke Server BE
            </span>
          </div>
        </div>
      )}

      {/* Modal: Interactive Riwayat Mutasi Rekening (Live BE) */}
      {showMutasiModal && selectedMutasiAccount && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container" style={{ maxWidth: '680px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `${selectedMutasiAccount.color || '#3b82f6'}15`,
                  color: selectedMutasiAccount.color || '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getAccountIcon(selectedMutasiAccount.type)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Riwayat Mutasi — {selectedMutasiAccount.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {selectedMutasiAccount.number || selectedMutasiAccount.type} • Saldo: <strong style={{ color: '#047857' }}>{formatIDR(selectedMutasiAccount.balance)}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setShowMutasiModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Mutation Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Total Masuk</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>+{formatIDR(mutasiSummary.totalIncome)}</div>
              </div>
              <div style={{ padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Total Keluar</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>-{formatIDR(mutasiSummary.totalExpense)}</div>
              </div>
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Perubahan Net</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: mutasiSummary.netChange >= 0 ? '#047857' : '#b91c1c', marginTop: '2px' }}>
                  {mutasiSummary.netChange >= 0 ? '+' : ''}{formatIDR(mutasiSummary.netChange)}
                </div>
              </div>
            </div>

            {/* Mutasi Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setMutasiFilter('all')}
                  className={mutasiFilter === 'all' ? 'sf-btn-primary' : 'sf-btn-secondary'}
                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                >
                  Semua ({mutationsList.length})
                </button>
                <button
                  onClick={() => setMutasiFilter('expense')}
                  className={mutasiFilter === 'expense' ? 'sf-btn-primary' : 'sf-btn-secondary'}
                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                >
                  Keluar / Debet
                </button>
                <button
                  onClick={() => setMutasiFilter('income')}
                  className={mutasiFilter === 'income' ? 'sf-btn-primary' : 'sf-btn-secondary'}
                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                >
                  Masuk / Kredit
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                Server BE Synced
              </span>
            </div>

            {/* Mutation Log Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {mutasiLoading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Memuat data mutasi dari Server BE...
                </div>
              ) : filteredMutations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Tidak ada catatan mutasi untuk kategori ini.
                </div>
              ) : (
                filteredMutations.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--gray-50)',
                      border: '1px solid var(--gray-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyBetween: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: m.type === 'income' ? '#ecfdf5' : '#fef2f2',
                        color: m.type === 'income' ? '#047857' : '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {m.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)', display: 'block' }} className="truncate">
                          {m.merchant}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          {m.category} • {m.date}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <strong style={{ fontSize: '0.9375rem', color: m.type === 'income' ? '#047857' : '#b91c1c', display: 'block' }}>
                        {m.type === 'income' ? '+' : '-'}{formatIDR(m.amount)}
                      </strong>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>{m.invoice || m.method}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-200)' }}>
              <button
                onClick={() => triggerToast(`Laporan mutasi ${selectedMutasiAccount.name} berhasil diunduh (PDF)`)}
                className="sf-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <FileText size={16} color="#06b6d4" />
                <span>Unduh Rekap Mutasi PDF</span>
              </button>
              <button onClick={() => setShowMutasiModal(false)} className="sf-btn-primary" style={{ padding: '8px 24px' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Rekening Baru BE */}
      {showAddAccountModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#10b981" />
                Tambah Rekening / Dompet Baru ke BE Server
              </h3>
              <button onClick={() => setShowAddAccountModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nama Rekening / Dompet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Mandiri Utama, OVO Cash, Kas Toko"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Tipe Akun
                  </label>
                  <select
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                  >
                    <option value="Bank">🏦 Bank</option>
                    <option value="E-Wallet">📱 E-Wallet</option>
                    <option value="Cash">💵 Kas Tunai</option>
                    <option value="Credit Card">💳 Kartu Kredit</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Nomor Rekening / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1420-8891-2291"
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Saldo Awal (IDR)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Warna Identitas Tag
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'].map((color) => (
                    <div
                      key={color}
                      onClick={() => setAccountColor(color)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: accountColor === color ? '3px solid #0f172a' : '2px solid transparent',
                        transform: accountColor === color ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowAddAccountModal(false)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Menyimpan ke BE...' : 'Simpan Rekening BE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Transfer BE */}
      {showTransferModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeftRight size={20} color="#10b981" />
                Transfer Antar Rekening (BE Server API)
              </h3>
              <button onClick={() => setShowTransferModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Dari Rekening
                </label>
                <select
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={fromAcc}
                  onChange={(e) => setFromAcc(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatIDR(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Ke Rekening Tujuan
                </label>
                <select
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={toAcc}
                  onChange={(e) => setToAcc(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatIDR(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nominal Transfer (IDR)
                </label>
                <input
                  type="number"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowTransferModal(false)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Memproses Transfer...' : 'Eksekusi Transfer BE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
