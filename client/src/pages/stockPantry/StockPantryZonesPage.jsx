import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  CheckCircle2,
  Thermometer,
  Boxes,
  PieChart,
  Edit,
  ArrowRight,
  ShieldAlert,
  Snowflake,
  Refrigerator,
  Sparkles,
  UtensilsCrossed,
  Cross
} from 'lucide-react';
import { useStockPantry } from '../../contexts/StockPantryContext';
import './StockPantryPages.css';

const StockPantryZonesPage = () => {
  const { zones, pantryItems = [], addZone } = useStockPantry();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('Chiller');
  const [newZoneTemp, setNewZoneTemp] = useState('2°C - 4°C');
  const [toastMessage, setToastMessage] = useState('');

  const totalSKU = pantryItems.length;
  const totalValuation = pantryItems.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.qty) || 0)), 0);

  const getZoneMetrics = (zone) => {
    const itemsInZone = pantryItems.filter(i =>
      i.zoneId === zone.id ||
      (i.zone && i.zone.toLowerCase().includes(zone.name.toLowerCase())) ||
      (zone.name && zone.name.toLowerCase().includes((i.zone || '').toLowerCase()))
    );
    const count = itemsInZone.length;
    const valuation = itemsInZone.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.qty) || 0)), 0);
    const capacityPct = Math.min(100, count * 15);
    const previews = itemsInZone.map(i => i.name).slice(0, 4);
    return { count, valuation, capacityPct, previews };
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveZone = (e) => {
    e.preventDefault();
    if (!newZoneName) return;

    addZone({
      name: newZoneName,
      type: newZoneType,
      temp: newZoneTemp,
      desc: 'Area penyimpanan fisik kustom keluarga',
      color: '#10b981',
      icon: 'Boxes'
    });

    setIsModalOpen(false);
    setNewZoneName('');
    showToast('Zona penyimpanan baru berhasil didaftarkan!');
  };

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
            <span className="sp-badge-live">Spatial Topology</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>🟢 Live Data Sync</span>
          </div>
          <h1 className="sp-page-title">
            <MapPin className="sp-text-primary" size={28} />
            Manajemen Zona Penyimpanan
          </h1>
          <p className="sp-page-subtitle">
            Pemetaan lokasi fisik di rumah untuk pemisahan temperatur, pencarian cepat, dan kontrol kapasitas wadah.
          </p>
        </div>

        <div className="sp-actions-group">
          <button onClick={() => showToast('Denah lokasi diekspor ke PDF!')} className="sp-btn-secondary">
            <MapPin size={18} color="#10b981" />
            <span>Ekspor Denah Lokasi</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="sp-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Zona Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Topologi Aktif</span>
              <div className="sp-kpi-value">{zones.length} Zona</div>
            </div>
            <div className="sp-kpi-icon-box">
              <Boxes size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Kapasitas Terhubung</span>
            <strong style={{ color: '#10b981' }}>100% Active</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">SKU Terindeks</span>
              <div className="sp-kpi-value">{totalSKU} Item</div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
              <Boxes size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Total Valuasi Fisik</span>
            <strong style={{ color: '#b45309' }}>Rp {totalValuation.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Beban Volume</span>
              <div className="sp-kpi-value" style={{ color: '#047857' }}>
                {totalSKU > 0 ? `${Math.min(100, Math.round(totalSKU * 5))}%` : '0%'}
              </div>
            </div>
            <div className="sp-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <PieChart size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Status Pengisian</span>
            <strong style={{ color: '#047857' }}>{totalSKU > 0 ? 'Optimal' : 'Kosong'}</strong>
          </div>
        </div>

        <div className="sp-kpi-card">
          <div className="sp-kpi-header">
            <div>
              <span className="sp-kpi-label">Regulasi Suhu</span>
              <div className="sp-kpi-value">3 Kategori</div>
            </div>
            <div className="sp-kpi-icon-box">
              <Thermometer size={22} />
            </div>
          </div>
          <div className="sp-kpi-footer">
            <span>Chiller &amp; Freezer</span>
            <strong style={{ color: '#10b981' }}>Terkontrol</strong>
          </div>
        </div>
      </div>

      {/* Grid of Storage Zones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
          Katalog Lokasi &amp; Kapasitas Wadah
        </h3>

        <div className="sp-grid-cards">
          {zones.map(zone => {
            const metrics = getZoneMetrics(zone);
            return (
              <div key={zone.id} className="sp-pantry-card" style={{ borderTop: `4px solid ${zone.color}` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${zone.color}15`,
                        color: zone.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        <Boxes size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{zone.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: zone.color, fontWeight: 600 }}>{zone.type}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: 'var(--radius-md)', backgroundColor: `${zone.color}15`, color: zone.color }}>
                      {zone.temp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', margin: '0 0 12px' }}>
                    {zone.desc}
                  </p>

                  <div style={{ padding: '10px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', margin: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--gray-600)' }}>Kapasitas Wadah</span>
                      <strong style={{ color: zone.color }}>{metrics.count} Item ({metrics.capacityPct}%)</strong>
                    </div>
                    <div className="sp-progress-bar">
                      <div className="sp-progress-fill" style={{ width: `${metrics.capacityPct}%`, backgroundColor: zone.color }} />
                    </div>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Barang Terdaftar ({metrics.count}):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {metrics.previews.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', italic: 'true' }}>
                          Belum ada bahan terdaftar
                        </span>
                      ) : (
                        metrics.previews.map((p, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                    <Link
                      to="/stockpantry/inventaris"
                      className="sp-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                    >
                      <span>Lihat Isi Zona</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      onClick={() => showToast(`Edit zona "${zone.name}" dibuka`)}
                      style={{ padding: '8px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', cursor: 'pointer', color: 'var(--gray-600)' }}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Card */}
      <div className="sp-card" style={{ backgroundColor: 'var(--gray-50)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles color="#10b981" size={20} />
          Panduan Manajemen Suhu & Tata Letak Dapur Ideal
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Rekomendasi penempatan strata vertikal di kulkas dan pantry untuk menjaga nutrisi dan mencegah kontaminasi silang.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--gray-200)' }}>
            <strong style={{ color: '#0284c7', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>1. Rak Atas (~4°C)</strong>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Makanan siap santap, leftover tertutup rapat, yogurt, minuman dingin.</span>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--gray-200)' }}>
            <strong style={{ color: '#10b981', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>2. Rak Tengah (2°C - 3°C)</strong>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Produk olahan susu, keju, mentega, telur ayam (hindari taruh di pintu).</span>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--gray-200)' }}>
            <strong style={{ color: '#d97706', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>3. Crisper Box Bawah</strong>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Sayuran hijau berkadar air, wortel, buah dengan kelembapan 65-80%.</span>
          </div>
        </div>
      </div>

      {/* Modal Add Zone */}
      {isModalOpen && (
        <div className="sp-modal-overlay">
          <div className="sp-modal-container">
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Registrasi Zona Baru</h3>
            <form onSubmit={handleSaveZone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Zona</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Lemari Makanan Kering Lantai 2"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Tipe Suhu</label>
                <select
                  value={newZoneType}
                  onChange={(e) => setNewZoneType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Chiller" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Chiller Dingin (2°C - 4°C)</option>
                  <option value="Freezer" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Freezer Beku (-18°C)</option>
                  <option value="Ruang Kering" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Suhu Ruang Kering (25°C)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="sp-btn-secondary">Batal</button>
                <button type="submit" className="sp-btn-primary">Simpan Zona</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPantryZonesPage;
