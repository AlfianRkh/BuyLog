import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Trash2,
  Calendar,
  User,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import PaymentModal from '../../components/hutangPiutang/PaymentModal';
import './HutangPiutangLedgerPage.css';
import './HutangPiutangDashboardPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const HutangPiutangDetailPage = () => {
  const [searchParams] = useSearchParams();
  const debtId = searchParams.get('id');
  const navigate = useNavigate();

  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDetail = async () => {
    if (!debtId) return;
    setLoading(true);
    try {
      const res = await api.debtTracker.getDebtDetail(debtId);
      setDebt(res.debt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [debtId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCancel = async () => {
    const reason = prompt('Masukkan alasan pembatalan transaksi:');
    if (reason === null) return;
    try {
      const res = await api.debtTracker.cancelDebt(debtId, reason);
      showToast(res.message);
      fetchDetail();
    } catch (err) {
      alert(err.message || 'Gagal membatalkan transaksi.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen?')) return;
    try {
      await api.debtTracker.deleteDebt(debtId);
      alert('Transaksi berhasil dihapus.');
      navigate('/hutang-piutang/catatan');
    } catch (err) {
      alert(err.message || 'Gagal menghapus transaksi.');
    }
  };

  if (loading || !debt) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-500)', fontWeight: 600 }}>
        Memuat detail transaksi...
      </div>
    );
  }

  const isPiutang = debt.type === 'piutang';
  const percent = debt.amount > 0 ? Math.round(((debt.amount - debt.remaining) / debt.amount) * 100) : 0;

  return (
    <div className="ledger-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1300,
          backgroundColor: 'var(--gray-900)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link to="/hutang-piutang/catatan" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Kembali ke Buku Catatan
        </Link>
      </div>

      {/* Header */}
      <div className="hp-page-header">
        <div>
          <div className="hp-title-badge">
            <h1 className="hp-page-title">Detail Transaksi #DBT-{debt.id}</h1>
            <span className={`badge-type ${isPiutang ? 'piutang' : 'hutang'}`}>
              {debt.type.toUpperCase()}
            </span>
            <span className={`badge-status ${debt.status}`}>
              {debt.status.toUpperCase()}
            </span>
          </div>
          <div className="hp-page-subtitle">
            Dibuat pada {new Date(debt.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="hp-header-actions">
          {debt.status !== 'settled' && debt.status !== 'cancelled' && (
            <button onClick={() => setIsPaymentModalOpen(true)} className="btn-header-primary">
              <CreditCard size={18} />
              <span>+ Catat Pembayaran</span>
            </button>
          )}
          {debt.status !== 'cancelled' && (
            <button onClick={handleCancel} className="btn-header-secondary" style={{ color: 'var(--warning-600)' }}>
              <XCircle size={18} />
              <span>Batalkan</span>
            </button>
          )}
          <button onClick={handleDelete} className="btn-header-secondary" style={{ color: 'var(--danger-600)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="hp-main-grid">
        <div className="hp-card-panel">
          <h2 className="hp-panel-title">Informasi Ringkas</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="hp-breakdown-box">
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>NAMA KONTAK</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <User size={18} />
                <span>{debt.contact_name || 'Umum / Tanpa Nama'}</span>
              </div>
            </div>

            <div className="hp-breakdown-box">
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>TANGGAL JATUH TEMPO</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: debt.status === 'overdue' ? 'var(--danger-600)' : 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Calendar size={18} />
                <span>{debt.due_date || 'Tidak ditentukan'}</span>
              </div>
            </div>

            <div className="hp-breakdown-box">
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>TOTAL POKOK</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '4px' }}>
                {formatRupiah(debt.amount)}
              </div>
            </div>

            <div className="hp-breakdown-box">
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>SISA TAGIHAN</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isPiutang ? 'var(--success-600)' : 'var(--danger-600)', marginTop: '4px' }}>
                {formatRupiah(debt.remaining)}
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Deskripsi Transaksi</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-800)', marginTop: '4px' }}>
              {debt.description}
            </div>
            {debt.notes && (
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '8px', fontStyle: 'italic' }}>
                Catatan: {debt.notes}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
              <span>Kemajuan Pelunasan ({percent}%)</span>
              <span style={{ fontWeight: 700, color: 'var(--success-600)' }}>{formatRupiah(debt.amount - debt.remaining)} Terbayar</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '10px' }}>
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* Riwayat Pembayaran */}
        <div className="hp-card-panel">
          <h2 className="hp-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--primary-600)" />
            <span>Riwayat Cicilan & Pembayaran</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(!debt.payments || debt.payments.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                Belum ada cicilan atau pembayaran yang dicatat untuk transaksi ini.
              </div>
            ) : debt.payments.map((p, idx) => (
              <div key={p.id || idx} style={{ padding: '12px 16px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success-600)' }}>
                    +{formatRupiah(p.amount)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {p.payment_method} • {new Date(p.payment_date).toLocaleDateString('id-ID')}
                  </span>
                  {p.notes && <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '2px' }}>{p.notes}</span>}
                </div>
                <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'right' }}>
                  Sisa: {formatRupiah(p.remaining_after)}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', marginTop: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Log Aktivitas Transaksi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {(!debt.logs || debt.logs.length === 0) ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Belum ada log aktivitas</span>
              ) : debt.logs.map((log, idx) => (
                <div key={log.id || idx} style={{ fontSize: '0.775rem', color: 'var(--gray-600)', display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gray-50)' }}>
                  <span>{log.description}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{new Date(log.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        debt={debt}
        onClose={() => setIsPaymentModalOpen(false)}
        onSaved={(msg) => {
          showToast(msg);
          fetchDetail();
        }}
      />
    </div>
  );
};

export default HutangPiutangDetailPage;
