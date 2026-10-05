import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  Copy, 
  Send, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './HutangPiutangDashboardPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const HutangPiutangKontakPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // State for Add Contact Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.debtTracker.getContacts(search);
      setContacts(res.contacts || []);
      if (res.contacts && res.contacts.length > 0 && !selectedContact) {
        fetchSummaryText(res.contacts[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryText = async (contactId) => {
    try {
      const data = await api.debtTracker.getContactWASummary(contactId);
      setSelectedContact(data.contact);
      setSummaryText(data.text);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContactName.trim()) {
      alert('Nama kontak wajib diisi.');
      return;
    }

    try {
      const res = await api.debtTracker.createContact({
        name: newContactName.trim(),
        phone: newContactPhone.trim() || null,
        notes: newContactNotes.trim() || null
      });

      showToast(res.message || 'Kontak baru berhasil ditambahkan!');
      setNewContactName('');
      setNewContactPhone('');
      setNewContactNotes('');
      setIsAddModalOpen(false);
      fetchContacts();
    } catch (err) {
      alert(err.message || 'Gagal menambahkan kontak.');
    }
  };

  const copyStudioText = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    showToast('Teks rekap WhatsApp berhasil disalin!');
  };

  const openWhatsApp = () => {
    if (!selectedContact) return;
    const phone = selectedContact.phone ? selectedContact.phone.replace(/[^0-9]/g, '') : '';
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`, '_blank');
  };

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
            <h1 className="hp-page-title">Direktori Kontak & Rekap WhatsApp</h1>
            <span className="hp-badge-live">{contacts.length} Kontak Aktif</span>
          </div>
          <div className="hp-page-subtitle">
            Kelola riwayat relasi kas dan buat pesan tagihan instan WhatsApp secara otomatis.
          </div>
        </div>

        <div className="hp-header-actions">
          <button onClick={() => setIsAddModalOpen(true)} className="btn-header-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Kontak</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div className="ledger-search-box" style={{ maxWidth: '360px', width: '100%' }}>
          <Search size={16} className="ledger-search-icon" />
          <input
            type="text"
            placeholder="Cari nama / nomor HP kontak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid: Contacts List vs WA Rekap Studio */}
      <div className="hp-main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--gray-500)', fontWeight: 600 }}>
              Memuat daftar kontak...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>
              Belum ada kontak terdaftar. Silakan tambah kontak baru.
            </div>
          ) : contacts.map(c => {
            const isSelected = selectedContact && selectedContact.id === c.id;
            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-900)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {c.phone || 'Tanpa Kontak HP'} • {c.notes || 'Relasi General'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge-status ${c.net_balance >= 0 ? 'active' : 'overdue'}`}>
                    Net: {c.net_balance >= 0 ? '+' : ''}{formatRupiah(c.net_balance)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                  <span>Piutang: <strong style={{ color: 'var(--success-600)' }}>{formatRupiah(c.total_piutang)}</strong></span>
                  <span>Hutang: <strong style={{ color: 'var(--danger-600)' }}>{formatRupiah(c.total_hutang)}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <button
                    onClick={() => fetchSummaryText(c.id)}
                    className="btn-header-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--primary-600)', borderColor: 'var(--primary-200)' }}
                  >
                    <MessageSquare size={14} /> Preview Rekap WA
                  </button>

                  <Link
                    to={`/hutang-piutang/catatan?search=${encodeURIComponent(c.name)}`}
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Lihat Transaksi <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* WA Studio Panel */}
        <div className="hp-card-panel" style={{ position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="var(--success-600)" />
              <h2 className="hp-panel-title">WhatsApp Rekap Studio</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              {selectedContact?.name || 'Live Preview'}
            </span>
          </div>

          <div style={{
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '0.825rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            maxHeight: '380px',
            overflowY: 'auto'
          }}>
            {summaryText || 'Pilih kontak dari daftar di sebelah kiri untuk melihat preview pesan WhatsApp.'}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={copyStudioText}
              className="btn-header-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Copy size={16} /> Salin Clipboard
            </button>
            <button
              onClick={openWhatsApp}
              className="btn-header-primary"
              style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            >
              <Send size={16} /> Buka di WA
            </button>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-title-icon">
                  <Users size={20} />
                </div>
                <div className="modal-title-text">Tambah Kontak Baru</div>
              </div>
            </div>

            <form onSubmit={handleCreateContact} className="modal-body">
              <div className="form-group-custom">
                <label className="form-label-custom">Nama Kontak</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="input-custom"
                  required
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="Misal: 081234567890"
                  className="input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  placeholder="Misal: Teman kantor / supplier"
                  className="input-custom"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-custom" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-custom">
                  <span>Simpan Kontak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HutangPiutangKontakPage;
