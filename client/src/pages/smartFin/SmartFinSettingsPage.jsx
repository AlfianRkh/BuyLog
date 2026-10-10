import React, { useState, useEffect } from 'react';
import {
  Settings,
  CheckCircle2,
  Camera,
  Building2,
  Tag,
  ShieldCheck,
  Trash2,
  Plus,
  RefreshCw,
  Server,
  X,
  User,
  Mail,
  CreditCard,
  Sliders
} from 'lucide-react';
import api from '../../services/api';
import { useSmartFin } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinSettingsPage() {
  const { triggerToast } = useSmartFin();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai-config');
  const [autoCrop, setAutoCrop] = useState(true);
  const [autoCat, setAutoCat] = useState(true);
  const [dupeGuard, setDupeGuard] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [defaultAccount, setDefaultAccount] = useState('BCA Utama');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live BE Data States
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: 'Alfian S.',
    email: 'alfian@smartfin.id',
    role: 'Administrator',
    securityLevel: 'AES-256 Cloud Sync'
  });

  // Modal State for Add Category
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🏷️');
  const [catType, setCatType] = useState('Pengeluaran');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, categoriesRes] = await Promise.all([
        api.smartFin.getSettings(),
        api.smartFin.getCategories()
      ]);

      if (settingsRes && settingsRes.success) {
        if (settingsRes.settings) {
          setThreshold(settingsRes.settings.confidenceThreshold || 85);
          setAutoCat(settingsRes.settings.autoCategorization !== false);
          setAutoCrop(settingsRes.settings.autoCrop !== false);
          setDupeGuard(settingsRes.settings.duplicateGuard !== false);
          if (settingsRes.settings.autoDebitAccount) setDefaultAccount(settingsRes.settings.autoDebitAccount);
        }
        if (settingsRes.accounts) setAccounts(settingsRes.accounts);
        if (settingsRes.profile) setUserProfile(settingsRes.profile);
      }

      if (categoriesRes && categoriesRes.categories) {
        setCategories(categoriesRes.categories);
      } else if (settingsRes && settingsRes.categories) {
        setCategories(settingsRes.categories);
      }
    } catch (err) {
      console.error('Failed fetching settings from Database:', err);
      triggerToast('Gagal memuat pengaturan & data kategori dari Database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.smartFin.updateSettings({
        settings: {
          confidenceThreshold: Number(threshold),
          autoCategorization: autoCat,
          autoCrop,
          duplicateGuard: dupeGuard,
          autoDebitAccount: defaultAccount
        },
        profile: userProfile
      });
      triggerToast(res.message || 'Semua preferensi & profil berhasil disimpan ke Backend Server!');
    } catch (err) {
      console.error('Failed updating settings in BE:', err);
      triggerToast('Gagal menyimpan pengaturan ke Backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      triggerToast('Nama kategori wajib diisi!');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.smartFin.createCategory({
        name: catName.trim(),
        icon: catIcon,
        type: catType
      });
      if (res.success && res.categories) {
        setCategories(res.categories);
        triggerToast(res.message || 'Kategori berhasil ditambahkan ke Backend!');
        setCatName('');
        setShowAddCatModal(false);
      }
    } catch (err) {
      console.error('Gagal membuat kategori BE:', err);
      triggerToast('Gagal menambah kategori ke Server Backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCat = async (id, name) => {
    if (!window.confirm(`Hapus kategori "${name}" dari Backend Server?`)) return;
    try {
      const res = await api.smartFin.deleteCategory(id);
      if (res.success && res.categories) {
        setCategories(res.categories);
        triggerToast(res.message || 'Kategori berhasil dihapus dari Backend.');
      }
    } catch (err) {
      console.error('Gagal menghapus kategori BE:', err);
      triggerToast('Gagal menghapus kategori dari Server Backend.');
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
              Live Backend Settings
            </span>
          </div>
          <h1 className="sf-page-title">
            <Settings className="sf-text-primary" size={28} />
            <span>Pengaturan Sistem &amp; Konfigurasi AI OCR</span>
          </h1>
          <p className="sf-page-subtitle">
            Kustomisasi pipeline multimodal vision, master kategori, rekening pembayaran bawaan, dan preferensi Server BE.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchSettings} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={handleSaveAll} disabled={isSubmitting} className="sf-btn-primary">
            <CheckCircle2 size={18} />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan BE ✓'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'ai-config', label: 'Konfigurasi AI OCR', icon: Camera },
          { id: 'categories', label: 'Master Kategori', icon: Tag },
          { id: 'accounts', label: 'Rekening Default', icon: Building2 },
          { id: 'profile', label: 'Profil & Keamanan', icon: ShieldCheck }
        ].map(t => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={isActive ? 'sf-btn-primary' : 'sf-btn-secondary'}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: isActive ? 700 : 500
              }}
            >
              <IconComp size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dynamic View Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* SECTION 1: AI OCR CONFIG & REKENING DEFAULT */}
        {(activeTab === 'ai-config' || activeTab === 'all') && (
          <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="#10b981" />
                Preferensi AI Vision Engine (Backend Server)
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>BE Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>Auto-Crop &amp; Dynamic Contrast</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Optimalkan kontras foto struk secara lokal memangkas bayangan.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCrop}
                  onChange={(e) => setAutoCrop(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </label>

              <label style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>AI Auto-Categorize Line Items</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Petakan pos belanja otomatis per masing-masing baris item struk.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCat}
                  onChange={(e) => setAutoCat(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </label>

              <label style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>Duplicate Receipt Guard</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Peringatkan jika invoice dan tanggal transaksi sudah pernah tercatat.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dupeGuard}
                  onChange={(e) => setDupeGuard(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </label>
            </div>

            {/* Confidence Slider */}
            <div style={{ padding: '14px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>Confidence Threshold (BE)</span>
                <strong style={{ color: '#10b981', fontSize: '1rem' }}>{threshold}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                style={{ accentColor: '#10b981', cursor: 'pointer', width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Peringatkan verifikasi manual jika tingkat keyakinan OCR di bawah {threshold}%.
              </span>
            </div>
          </div>
        )}

        {/* SECTION 2: MASTER KATEGORI */}
        {(activeTab === 'categories' || activeTab === 'all') && (
          <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="#10b981" />
                Master Kategori ({categories.length})
              </h3>
              <button
                onClick={() => setShowAddCatModal(true)}
                className="sf-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} color="#10b981" />
                <span>+ Tambah</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.875rem' }}>
                  Tidak ada kategori terdaftar di Backend.
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.875rem' }}>{cat.name}</strong>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>{cat.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCat(cat.id, cat.name)}
                      title="Hapus Kategori dari BE"
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: REKENING DEFAULT */}
        {(activeTab === 'accounts' || activeTab === 'all') && (
          <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#06b6d4" />
                Rekening Default Scan Struk (BE Data)
              </h3>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              Pilih rekening bawaan yang akan otomatis terpotong ketika Anda melakukan konfirmasi pindai struk AI.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {accounts.map(acc => {
                const isSel = acc.isDefault || defaultAccount === acc.name || defaultAccount === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={async () => {
                      setDefaultAccount(acc.name);
                      try {
                        const res = await api.smartFin.setDefaultAccount(acc.id);
                        if (res && res.success) {
                          triggerToast(`Rekening "${acc.name}" dijadikan Rekening Default (disimpan di DB)!`);
                          fetchSettings();
                        }
                      } catch (err) {
                        console.error('Failed setting default account:', err);
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSel ? '2px solid #10b981' : '1px solid var(--gray-200)',
                      backgroundColor: isSel ? '#ecfdf5' : 'var(--gray-50)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{acc.name}</strong>
                      {isSel && <CheckCircle2 size={16} color="#10b981" />}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{acc.number}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'block', marginTop: '4px' }}>
                      Rp {Number(acc.balance || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 4: PROFIL & KEAMANAN */}
        {(activeTab === 'profile' || activeTab === 'all') && (
          <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#10b981" />
                Profil &amp; Keamanan Server BE
              </h3>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>AES-256</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Nama Pengguna (Backend)
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                  <input
                    className="sf-form-control"
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: '#0f172a' }}
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Email Server
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                  <input
                    className="sf-form-control"
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: '#0f172a' }}
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, display: 'block' }}>
                  Enkripsi &amp; Keamanan Data
                </span>
                <span style={{ fontSize: '0.75rem', color: '#065f46' }}>
                  Semua kredensial dan API key diproteksi dengan enkripsi kelas bank AES-256 di Server Backend.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Category */}
      {showAddCatModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-content" style={{ maxWidth: '420px' }}>
            <div className="sf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Tambah Master Kategori BE</h3>
              </div>
              <button onClick={() => setShowAddCatModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="sf-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Bulanan"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="sf-form-control"
                  style={{ width: '100%', color: '#0f172a' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Icon Emoji
                  </label>
                  <select
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="sf-form-control"
                    style={{ width: '100%', color: '#0f172a' }}
                  >
                    <option value="🥫">🥫 Sembako</option>
                    <option value="☕">☕ Kafe / Minum</option>
                    <option value="🚗">🚗 Bensin / Transport</option>
                    <option value="🧼">🧼 Rumah / Kebersihan</option>
                    <option value="⚡">⚡ Tagihan / Listrik</option>
                    <option value="💼">💼 Gaji / Karir</option>
                    <option value="🛒">🛒 Belanja Umum</option>
                    <option value="🏥">🏥 Kesehatan</option>
                    <option value="🏷️">🏷️ Kategori Lain</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Tipe Kategori
                  </label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="sf-form-control"
                    style={{ width: '100%', color: '#0f172a' }}
                  >
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Pemasukan">Pemasukan</option>
                  </select>
                </div>
              </div>

              <div className="sf-modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddCatModal(false)} className="sf-btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="sf-btn-primary">
                  {isSubmitting ? 'Menyimpan...' : 'Tambah ke BE ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


