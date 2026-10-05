import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  FolderPlus, 
  Laptop, 
  Shirt, 
  Home, 
  Coffee, 
  Edit2,
  FunctionSquare
} from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';
import './WishBoardPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function WishBoardSettingsPage() {
  const { weights, updateWeights, items } = useWishBoard();

  const [urgencyW, setUrgencyW] = useState(weights.urgency || 35);
  const [wantW, setWantW] = useState(weights.want || 30);
  const [budgetW, setBudgetW] = useState(weights.budget || 35);
  const [calculating, setCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);

  const totalWeight = urgencyW + wantW + budgetW;
  const isValid = totalWeight === 100;

  // Sample simulation item (Logitech MX Keys S)
  const val1 = 1.0 * urgencyW;
  const val2 = 1.0 * wantW;
  const val3 = 0.85 * budgetW;
  const calculatedScore = Math.round(val1 + val2 + val3);

  const handleReset = () => {
    setUrgencyW(35);
    setWantW(30);
    setBudgetW(35);
    updateWeights({ urgency: 35, want: 30, budget: 35 });
  };

  const handleApply = () => {
    if (!isValid) {
      alert(`Perhatian: Total bobot saat ini ${totalWeight}%. Sesuaikan slider agar berjumlah tepat 100% sebelum menerapkan kalibrasi global.`);
      return;
    }
    setCalculating(true);
    setTimeout(() => {
      updateWeights({ urgency: urgencyW, want: wantW, budget: budgetW });
      setCalculating(false);
      setCalcSuccess(true);
      setTimeout(() => setCalcSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="wb-container">
      {/* Header Section */}
      <div className="wb-header">
        <div className="wb-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="wb-badge-live">
              <Zap size={13} />
              <span>Konfigurasi Personal v1.2 · Engine Active</span>
            </span>
          </div>
          <h1 className="wb-page-title">
            <Sliders size={28} color="var(--primary-600)" />
            <span>Pengaturan Sistem &amp; Formula Scoring</span>
          </h1>
          <p className="wb-page-subtitle">
            Kustomisasi bobot algoritma Priority Score, manajemen master kategori, profil pengguna, dan ekspor data analitik terstruktur.
          </p>
        </div>

        <div className="wb-actions-group">
          <div style={{ backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>
            Engine Status: <strong style={{ color: 'var(--success-600)' }}>ALGORITHMIC V2.4 RUNNING</strong>
          </div>
        </div>
      </div>

      {/* Section 1: Weight Sliders & Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px', alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 12 / span 12' }} className="xl:col-span-8 wb-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={20} color="var(--primary-600)" />
                  <span>Kustomisasi Formula Priority Score</span>
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                  Atur persentase pengaruh masing-masing parameter subjektif dan objektif terhadap kalkulasi Priority Score akhir.
                </p>
              </div>

              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
                P = (U/5·W₁) + (W/5·W₂) + (B%·W₃)
              </span>
            </div>

            {/* Slider 1: Urgency */}
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--gray-900)', display: 'block' }}>Urgensi Kebutuhan (Tingkat Mendesak)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Tingkat kedesakan fungsional barang untuk menunjang aktivitas.</span>
                </div>
                <span className="wb-tag-urgent">[ {urgencyW}% ]</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={urgencyW}
                onChange={(e) => setUrgencyW(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Want */}
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--gray-900)', display: 'block' }}>Tingkat Keinginan (Want Level)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Hasrat personal dan kepuasan emosional untuk memiliki barang.</span>
                </div>
                <span className="wb-tag-saving">[ {wantW}% ]</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={wantW}
                onChange={(e) => setWantW(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 3: Budget */}
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--gray-900)', display: 'block' }}>Kesiapan Budget (Tabungan Terkumpul)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Rasio dana tabungan riil yang telah dialokasikan terhadap harga barang.</span>
                </div>
                <span className="wb-tag-ready">[ {budgetW}% ]</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={budgetW}
                onChange={(e) => setBudgetW(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--gray-200)' }}>
              <button onClick={handleReset} className="wb-btn-secondary">
                <RotateCcw size={16} />
                <span>Kembalikan Default Sistem</span>
              </button>
              <button onClick={handleApply} className="wb-btn-primary">
                <CheckCircle2 size={18} />
                <span>{calculating ? 'Mengalkulasi...' : calcSuccess ? 'Formula Berhasil Diterapkan!' : 'Terapkan Formula'}</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 12 / span 12' }} className="xl:col-span-4 flex flex-col gap-4">
          <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Bobot</span>
              <span className={isValid ? 'wb-tag-ready' : 'wb-tag-urgent'}>
                {isValid ? 'Valid & Seimbang' : `Tidak Seimbang (${totalWeight}%)`}
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isValid ? 'var(--gray-900)' : 'var(--danger-600)' }}>
              {totalWeight}%
            </div>
            <div className="wb-progress-bar">
              <div className="wb-progress-fill" style={{ width: `${totalWeight}%`, backgroundColor: isValid ? 'var(--success-500)' : 'var(--danger-500)' }}></div>
            </div>
          </div>

          <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>Simulasi Dampak Realtime</span>
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>Logitech MX Keys S</span>
                <span style={{ color: 'var(--primary-600)' }}>Rp 1.500.000</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Urgensi ({urgencyW}%)</span><span>{val1.toFixed(1)} pts</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Keinginan ({wantW}%)</span><span>{val2.toFixed(1)} pts</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Budget ({budgetW}%)</span><span>{val3.toFixed(1)} pts</span></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 700, textTransform: 'uppercase' }}>Skor Baru</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>{calculatedScore} / 100</div>
              </div>
              <span className="wb-tag-urgent">{calculatedScore >= 80 ? 'CRITICAL URGENT' : 'HIGH PRIORITY'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Category Management Cards */}
      <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderPlus size={20} color="var(--primary-600)" />
              <span>Manajemen Kategori Wishlist</span>
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>Kelompokkan alokasi dan evaluasi belanja berdasarkan ranah kebutuhan hidup.</p>
          </div>
          <button className="wb-btn-secondary" style={{ fontSize: '0.8rem' }}>
            <FolderPlus size={16} />
            <span>+ Tambah Kategori</span>
          </button>
        </div>

        <div className="wb-grid-4">
          {[
            { title: 'Setup Kerja & Gadget', code: '#SETUP-01', items: '10 Produk', val: 'Rp 24.800.000', icon: Laptop, color: 'var(--primary-600)' },
            { title: 'Pakaian & Fashion', code: '#FASHION-02', items: '4 Produk', val: 'Rp 9.900.000', icon: Shirt, color: 'var(--danger-600)' },
            { title: 'Perlengkapan Rumah', code: '#HOME-03', items: '3 Produk', val: 'Rp 6.700.000', icon: Home, color: 'var(--success-600)' },
            { title: 'Hobi, Audio & Kopi', code: '#HOBBY-04', items: '1 Produk', val: 'Rp 3.600.000', icon: Coffee, color: 'var(--warning-600)' }
          ].map(cat => {
            const IconComp = cat.icon;
            return (
              <div key={cat.title} className="wb-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-100)', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={20} />
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)' }}>{cat.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>{cat.code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid var(--gray-100)' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{cat.items}</span>
                  <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{cat.val}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
