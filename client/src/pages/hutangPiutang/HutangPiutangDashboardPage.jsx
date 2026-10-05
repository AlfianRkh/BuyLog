import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  AlertTriangle, 
  PlusCircle, 
  Share2, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import NewDebtModal from '../../components/hutangPiutang/NewDebtModal';
import PaymentModal from '../../components/hutangPiutang/PaymentModal';
import './HutangPiutangDashboardPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const HutangPiutangDashboardPage = () => {
  const [data, setData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const summaryRes = await api.debtTracker.getDebtSummary();
      setData(summaryRes);
      const contactsRes = await api.debtTracker.getContacts();
      setContacts(contactsRes.contacts || []);
    } catch (err) {
      console.error('Error loading debt summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading || !data) {
    return (
      <div className="hp-dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Memuat Dashboard Hutang & Piutang...</div>
      </div>
    );
  }

  const { summary, breakdownHutang, breakdownPiutang, overdueList, recentActivity } = data;

  return (
    <div className="hp-dashboard-container">
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

      {/* Header */}
      <div className="hp-page-header">
        <div>
          <div className="hp-title-badge">
            <h1 className="hp-page-title">
              <Wallet className="hp-text-primary" size={28} />
              Ringkasan Hutang & Piutang
            </h1>
            <span className="hp-badge-live">Personal Ledger</span>
          </div>
          <p className="hp-page-subtitle">
            Kelola posisi piutang lancar, hutang kewajiban, dan histori transaksi personal Anda.
          </p>
        </div>

        <div className="hp-header-actions">
          <Link to="/hutang-piutang/kontak" className="btn-header-secondary">
            <Share2 size={18} color="#10b981" />
            <span>WA Rekap Studio</span>
          </Link>
          <button onClick={() => setIsNewModalOpen(true)} className="btn-header-primary">
            <PlusCircle size={18} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="hp-stats-grid">
        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Total Piutang Saya</span>
            <div className="hp-stat-icon-box piutang">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount piutang">{formatRupiah(summary.total_piutang)}</div>
            <div className="hp-stat-subtext">Piutang belum tertagih</div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Total Hutang Saya</span>
            <div className="hp-stat-icon-box hutang">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount hutang">{formatRupiah(summary.total_hutang)}</div>
            <div className="hp-stat-subtext">Kewajiban berjalan</div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Posisi Saldo Bersih</span>
            <div className="hp-stat-icon-box balance">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className={`hp-stat-amount ${summary.net_balance >= 0 ? 'positive' : 'negative'}`}>
              {summary.net_balance >= 0 ? '+' : ''}{formatRupiah(summary.net_balance)}
            </div>
            <div className="hp-stat-subtext">
              {summary.net_balance >= 0 ? 'Surplus Piutang' : 'Defisit Hutang'}
            </div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Status Overdue</span>
            <div className="hp-stat-icon-box warning">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount hutang">{summary.overdue_count} Entri</div>
            <div className="hp-stat-subtext">Melewati jatuh tempo</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown & Overdue List */}
      <div className="hp-main-grid">
        <div className="hp-card-panel">
          <div>
            <h2 className="hp-panel-title">Distribusi Portofolio Kontak</h2>
            <div className="hp-panel-subtitle">Rincian piutang dan hutang berjalan berdasarkan relasi kontak</div>
          </div>

          <div className="hp-breakdown-grid">
            <div className="hp-breakdown-box">
              <div className="hp-breakdown-header" style={{ color: 'var(--success-600)' }}>
                <span>Piutang per Kontak</span>
                <span>{formatRupiah(summary.total_piutang)}</span>
              </div>
              <div className="hp-breakdown-list">
                {breakdownPiutang.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Tidak ada piutang aktif</span>
                ) : breakdownPiutang.map((item, idx) => (
                  <div key={idx} className="hp-breakdown-item">
                    <span>{item.name}</span>
                    <strong>{formatRupiah(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-breakdown-box">
              <div className="hp-breakdown-header" style={{ color: 'var(--danger-600)' }}>
                <span>Hutang per Kontak</span>
                <span>{formatRupiah(summary.total_hutang)}</span>
              </div>
              <div className="hp-breakdown-list">
                {breakdownHutang.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Tidak ada hutang aktif</span>
                ) : breakdownHutang.map((item, idx) => (
                  <div key={idx} className="hp-breakdown-item">
                    <span>{item.name}</span>
                    <strong>{formatRupiah(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <Link to="/hutang-piutang/catatan" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              Lihat Semua Buku Catatan <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Panel Right: Overdue & Quick Actions */}
        <div className="hp-card-panel">
          <div>
            <h2 className="hp-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-600)' }}>
              <AlertTriangle size={20} />
              <span>Perlu Perhatian (Overdue)</span>
            </h2>
            <div className="hp-panel-subtitle">Transaksi yang telah melewati batas tanggal jatuh tempo</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overdueList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                ✅ Tidak ada transaksi yang melebih jatuh tempo saat ini.
              </div>
            ) : overdueList.map(item => (
              <div key={item.id} className="hp-overdue-item">
                <div className="hp-overdue-info">
                  <span className="hp-overdue-name">{item.contact_name || 'Umum'}</span>
                  <span className="hp-overdue-desc">{item.description} ({item.due_date})</span>
                </div>
                <div className="hp-overdue-amount">
                  {formatRupiah(item.remaining)}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Histori Log Aktivitas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {recentActivity.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Belum ada histori aktivitas</span>
              ) : recentActivity.map(log => (
                <div key={log.id} style={{ fontSize: '0.775rem', color: 'var(--gray-600)', display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gray-50)' }}>
                  <span>{log.description}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{new Date(log.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewDebtModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        contacts={contacts}
        refreshContacts={fetchDashboard}
        onSave={(msg) => {
          showToast(msg);
          fetchDashboard();
        }}
      />

      <PaymentModal
        isOpen={!!selectedDebtForPayment}
        debt={selectedDebtForPayment}
        onClose={() => setSelectedDebtForPayment(null)}
        onSaved={(msg) => {
          showToast(msg);
          fetchDashboard();
        }}
      />
    </div>
  );
};

export default HutangPiutangDashboardPage;
