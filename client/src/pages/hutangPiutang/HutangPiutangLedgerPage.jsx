import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  CheckCircle, 
  ArrowRight, 
  FolderOpen,
  CheckCircle2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import NewDebtModal from '../../components/hutangPiutang/NewDebtModal';
import PaymentModal from '../../components/hutangPiutang/PaymentModal';
import './HutangPiutangLedgerPage.css';
import './HutangPiutangDashboardPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const HutangPiutangLedgerPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [debts, setDebts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const query = {};
      if (search) query.search = search;
      if (activeTab === 'overdue' || activeTab === 'settled') {
        query.status = activeTab;
      } else if (activeTab === 'hutang' || activeTab === 'piutang') {
        query.type = activeTab;
      }

      const res = await api.debtTracker.getDebts(query);
      setDebts(res.debts || []);

      const contactsRes = await api.debtTracker.getContacts();
      setContacts(contactsRes.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [activeTab, search]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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

      {/* Header */}
      <div className="hp-page-header">
        <div>
          <div className="hp-title-badge">
            <h1 className="hp-page-title">Buku Catatan Hutang & Piutang</h1>
            <span className="hp-badge-live">{debts.length} Transaksi</span>
          </div>
          <div className="hp-page-subtitle">
            Pusat kendali arus piutang lancar, penagihan terjadwal, dan pelunasan.
          </div>
        </div>

        <button onClick={() => setIsNewModalOpen(true)} className="btn-header-primary">
          <PlusCircle size={18} />
          <span>+ Catat Transaksi Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="ledger-filter-row">
        <div className="ledger-tabs">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'piutang', label: 'Piutang', dot: 'piutang' },
            { id: 'hutang', label: 'Hutang', dot: 'hutang' },
            { id: 'overdue', label: 'Overdue', dot: 'overdue' },
            { id: 'settled', label: 'Lunas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ledger-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.dot && <span className={`dot-indicator ${tab.dot}`} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="ledger-search-box">
          <Search size={16} className="ledger-search-icon" />
          <input
            type="text"
            placeholder="Cari deskripsi / kontak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-500)', fontWeight: 600 }}>
          Memuat data dari database...
        </div>
      ) : debts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--gray-500)'
        }}>
          <FolderOpen size={40} color="var(--gray-400)" />
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>Belum ada catatan transaksi untuk kategori ini</div>
          <button onClick={() => setIsNewModalOpen(true)} className="btn-header-primary" style={{ marginTop: '8px' }}>
            <PlusCircle size={16} />
            <span>Tambah Catatan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="ledger-cards-grid">
          {debts.map(d => {
            const isPiutang = d.type === 'piutang';
            const percent = d.amount > 0 ? Math.round(((d.amount - d.remaining) / d.amount) * 100) : 0;
            return (
              <div key={d.id} className={`ledger-card ${isPiutang ? 'piutang' : 'hutang'}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="ledger-card-top">
                    <div className="ledger-card-contact">
                      <div className={`contact-avatar-circle ${isPiutang ? 'piutang' : 'hutang'}`}>
                        {(d.contact_name || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge-type ${isPiutang ? 'piutang' : 'hutang'}`}>
                            {d.type.toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.95rem' }}>
                            {d.contact_name || 'Tanpa Nama'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                          #DBT-{d.id} • {new Date(d.debt_date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <span className={`badge-status ${d.status}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="ledger-desc-box">
                    {d.description}
                  </div>

                  <div className="ledger-values-grid">
                    <div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Pokok
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)', marginTop: '2px' }}>
                        {formatRupiah(d.amount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: isPiutang ? 'var(--success-600)' : 'var(--danger-600)' }}>
                        Sisa Tagihan
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isPiutang ? 'var(--success-600)' : 'var(--danger-600)', marginTop: '2px' }}>
                        {formatRupiah(d.remaining)}
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--gray-600)', marginBottom: '2px' }}>
                      <span>Kemajuan Pelunasan ({percent}%)</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-600)' }}>
                        {formatRupiah(d.amount - d.remaining)} terbayar
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ledger-card-footer">
                  {d.status !== 'settled' ? (
                    <button
                      onClick={() => setSelectedDebtForPayment(d)}
                      className="btn-header-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.775rem', color: 'var(--success-600)', borderColor: 'var(--success-500)', backgroundColor: 'var(--success-50)' }}
                    >
                      + Catat Pembayaran
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={16} /> LUNAS
                    </span>
                  )}
                  <Link
                    to={`/hutang-piutang/detail?id=${d.id}`}
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Lihat Detail <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NewDebtModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        contacts={contacts}
        refreshContacts={fetchDebts}
        onSave={(msg) => {
          showToast(msg);
          fetchDebts();
        }}
      />

      <PaymentModal
        isOpen={!!selectedDebtForPayment}
        debt={selectedDebtForPayment}
        onClose={() => setSelectedDebtForPayment(null)}
        onSaved={(msg) => {
          showToast(msg);
          fetchDebts();
        }}
      />
    </div>
  );
};

export default HutangPiutangLedgerPage;
