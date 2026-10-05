import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './HutangPiutangDashboardPage.css';
import '../../components/hutangPiutang/NewDebtModal.css';

const HutangPiutangPengaturanPage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bankInfo, setBankInfo] = useState(user?.bank_account_info || 'BCA: 5410-2391-09 a/n Alfian S.');
  const [waTemplate, setWaTemplate] = useState(user?.wa_summary_template || '');
  const [dueDays, setDueDays] = useState(user?.reminder_days_before || 3);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBankInfo(user.bank_account_info || 'BCA: 5410-2391-09 a/n Alfian S.');
      setWaTemplate(user.wa_summary_template || `Halo {contact_name}, berikut catatan rekap pinjaman kita per {date}:\n\n📌 Catatan pinjaman ke saya:\n{piutang_list}\n\n📌 Catatan pinjaman saya ke kamu:\n{hutang_list}\n\n💵 Posisi Saldo Bersih:\n{net_summary}\n\nNomor Rekening Pembayaran:\n{bank_account}\n\nTerima kasih banyak ya! Semoga lancar rezekinya.`);
      setDueDays(user.reminder_days_before || 3);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.debtTracker.updateSettings({
        name,
        bank_account_info: bankInfo,
        wa_summary_template: waTemplate,
        reminder_days_before: dueDays
      });

      if (res.user && updateUser) {
        updateUser(res.user);
      }
      showToast(res.message || 'Pengaturan berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="hp-page-title">Pengaturan Template & Rekening</h1>
            <span className="hp-badge-live">Personal Settings</span>
          </div>
          <div className="hp-page-subtitle">
            Kustomisasi template teks WhatsApp, nomor rekening tujuan pembayaran, dan pengingat.
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-header-primary">
          <Save size={18} />
          <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile & Rekening */}
        <div className="hp-card-panel">
          <h2 className="hp-panel-title">Profil Pengguna & Rekening Pembayaran</h2>

          <div className="grid-2col">
            <div className="form-group-custom">
              <label className="form-label-custom">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-custom"
                required
              />
            </div>
            <div className="form-group-custom">
              <label className="form-label-custom">Informasi Rekening Pembayaran</label>
              <input
                type="text"
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="Misal: BCA 5410-2391-09 a/n Alfian S."
                className="input-custom"
                required
              />
            </div>
          </div>
        </div>

        {/* Template WA */}
        <div className="hp-card-panel">
          <h2 className="hp-panel-title">Template Teks Rekap WhatsApp</h2>
          <div className="hp-panel-subtitle">
            Gunakan variabel: {'{contact_name}'}, {'{date}'}, {'{piutang_list}'}, {'{hutang_list}'}, {'{net_summary}'}, {'{bank_account}'}
          </div>

          <textarea
            rows={10}
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            className="input-custom"
            style={{
              height: 'auto',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 1.6
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default HutangPiutangPengaturanPage;
