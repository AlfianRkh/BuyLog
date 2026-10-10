import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  CheckCircle2,
  Calendar,
  Download,
  FileSpreadsheet,
  PiggyBank,
  Target,
  Flame,
  Zap,
  Brain,
  Award,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import './PriceRadarStatsPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function PriceRadarStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('year');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getStats({ time: timeFilter });
      setStats(res);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const realizedSavings = stats?.realizedSavings || 0;
  const targetHitCount = stats?.targetHitCount || 0;
  const totalCount = stats?.totalCount || 0;
  const avgDealScore = stats?.avgDealScore || 0;
  const monthlyVelocity = stats?.savingsVelocity ?? Math.round(realizedSavings / 12);
  const yearlyEstimate = stats?.yearlyEstimate ?? (monthlyVelocity * 12);
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const impulseRestraintPercent = stats?.impulseRestraintPercent || 0;
  const disciplineScore = stats?.disciplineScore || 0;
  const hunterLevel = stats?.hunterLevel || 'BEGINNER HUNTER';

  const categoryColors = ['var(--primary-600)', 'var(--success-500)', 'var(--danger-500)', 'var(--warning-500)', 'var(--gray-400)'];

  const handleYearChange = (e) => {
    const yr = e.target.value;
    setSelectedYear(yr);
    setTimeFilter(yr);
    showToast(`Filter tahun ${yr === 'all' ? 'Semua Tahun' : yr} diterapkan`);
  };

  const handleDownloadPDF = () => {
    showToast("Menyiapkan dokumen PDF telemetri belanja...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleExportExcel = () => {
    showToast("Mengunduh file Excel telemetri belanja...");

    const headers = ['Kategori / Metric', 'Nilai', 'Keterangan'];
    const rows = [
      ['Realized Savings', `Rp ${realizedSavings.toLocaleString('id-ID')}`, 'Total Hemat Pembelian Riil'],
      ['Target Achieved', `${targetHitCount} dari ${totalCount} Item`, 'Sukses eksekusi target'],
      ['Avg Deal Score', `${avgDealScore} / 10.0`, 'Kedisiplinan harga beli'],
      ['Savings Velocity', `Rp ${monthlyVelocity.toLocaleString('id-ID')} / Bulan`, 'Rata-rata penghematan per bulan'],
      ['Estimasi Tahunan', `Rp ${yearlyEstimate.toLocaleString('id-ID')}`, 'Proyeksi hemat 1 tahun'],
      ['Impulse Restraint', `${impulseRestraintPercent}%`, 'Tingkat penahanan beli impulsif'],
      ['Discipline Score', `${disciplineScore} / 100`, 'Skor kedisiplinan deal hunter'],
      ['Hunter Level', hunterLevel, 'Peringkat hunter'],
      ['', '', ''],
      ['DISTRIBUSI KATEGORI', '', ''],
      ...categoryBreakdown.map(c => [c.category, `Rp ${Number(c.savings).toLocaleString('id-ID')}`, `${c.percentage}% dari total hemat`])
    ];

    let tsvContent = '\uFEFF' + headers.join('\t') + '\n';
    rows.forEach(row => {
      tsvContent += row.map(val => `"${val}"`).join('\t') + '\n';
    });

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Statistik_PriceRadar_${selectedYear}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="prst-container">
      {/* Toast Notification */}
      {toastMsg && (
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
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="prst-header">
        <div className="prst-title-group">
          <div className="prst-breadcrumb">
            <Link to="/priceradar/dashboard">SISTEM RADAR</Link>
            <span>/</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>STATISTIK & ANALISIS</span>
          </div>
          <div className="prst-title-row">
            <h1 className="prst-page-title">
              <BarChart2 size={26} color="var(--primary-600)" />
              <span>Statistik & Evaluasi Belanja Cerdas</span>
            </h1>
            <span className="prst-badge-telemetry">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-600)', display: 'inline-block' }}></span>
              TELEMETRI AKTIF
            </span>
          </div>
          <p className="prst-page-subtitle">
            Intelijen penghematan riil (<strong style={{ color: 'var(--success-600)' }}>realized savings</strong>), indeks volatilitas harga pasar, peringkat win-rate platform, dan evaluasi kedisiplinan deal hunters.
          </p>
        </div>

        <div className="prst-actions-group">
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Calendar size={15} color="var(--primary-600)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1 }} />
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="prst-btn-secondary"
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                appearance: 'auto',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--gray-800)',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
              <option value="all">Semua Tahun</option>
            </select>
          </div>

          {/* <button onClick={handleDownloadPDF} className="prst-btn-secondary">
            <Download size={15} color="var(--success-600)" />
            <span>Unduh PDF</span>
          </button>

          <button onClick={handleExportExcel} className="prst-btn-primary">
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button> */}
        </div>
      </div>

      {/* Filter Rail Bar */}
      <div className="prst-filter-bar">
        <div className="prst-filter-pills">
          {[
            { id: "all", label: "Semua Waktu" },
            { id: "year", label: "Tahun Ini (2026)", pulse: true },
            { id: "3m", label: "3 Bulan Terakhir" },
            { id: "1m", label: "Bulan Ini (Oktober)" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`prst-filter-pill ${timeFilter === f.id ? 'active' : ''}`}
            >
              {f.pulse && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399', display: 'inline-block' }}></span>}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          <span>Sinkronisasi Terakhir: <strong style={{ color: 'var(--gray-800)' }}>Hari ini, 18:42 WIB</strong></span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-500)', display: 'inline-block' }}></span>
        </div>
      </div>

      {/* 4 Topline KPI Cards */}
      <div className="prst-kpi-grid">
        <div className="prst-kpi-card" style={{ borderColor: 'var(--success-200)', backgroundColor: 'var(--success-50)' }}>
          <div className="prst-kpi-header">
            <span className="prst-kpi-label" style={{ color: 'var(--success-700)' }}>Realized Savings</span>
            <div className="prst-kpi-icon-box" style={{ backgroundColor: 'var(--success-100)', color: 'var(--success-700)' }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div>
            <div className="prst-kpi-value" style={{ color: 'var(--success-600)' }}>{formatRupiah(realizedSavings)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '4px' }}>Total Hemat Pembelian Riil</div>
          </div>
          <div className="prst-kpi-footer" style={{ borderTopColor: 'var(--success-200)' }}>
            <span>Formula: <code style={{ color: 'var(--primary-600)', fontWeight: 700 }}>SUM(ATH - buy)</code></span>
            <span style={{ color: 'var(--success-700)', fontWeight: 800 }}>↑ 18.2% vs Q3</span>
          </div>
        </div>

        <div className="prst-kpi-card">
          <div className="prst-kpi-header">
            <span className="prst-kpi-label">Target Achieved</span>
            <div className="prst-kpi-icon-box">
              <Target size={20} />
            </div>
          </div>
          <div>
            <div className="prst-kpi-value">
              {targetHitCount} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>dari {totalCount} Item</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Sukses eksekusi saat menyentuh trigger target</div>
          </div>
          <div className="prst-kpi-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${(targetHitCount / totalCount) * 100}%`, height: '100%', backgroundColor: 'var(--primary-600)', borderRadius: 'var(--radius-full)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>{targetHitCount} Selesai Ditebus</span>
              <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{totalCount - targetHitCount} Pending Target</span>
            </div>
          </div>
        </div>

        <div className="prst-kpi-card">
          <div className="prst-kpi-header">
            <span className="prst-kpi-label">Avg Deal Score</span>
            <div className="prst-kpi-icon-box" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <Flame size={20} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="prst-kpi-value">{avgDealScore}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-400)' }}>/ 10.0</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Kedisiplinan harga beli sangat tinggi</div>
          </div>
          <div className="prst-kpi-footer">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} color="var(--success-600)" />
              <strong style={{ color: 'var(--gray-800)' }}>92% transaksi</strong>
            </span>
            <span style={{ color: 'var(--success-600)', fontWeight: 800 }}>Skor &gt; 7.5</span>
          </div>
        </div>

        <div className="prst-kpi-card">
          <div className="prst-kpi-header">
            <span className="prst-kpi-label">Savings Velocity</span>
            <div className="prst-kpi-icon-box">
              <Zap size={20} />
            </div>
          </div>
          <div>
            <div className="prst-kpi-value" style={{ color: 'var(--primary-600)' }}>
              {formatRupiah(monthlyVelocity)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>/ Bln</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Kecepatan penghematan rata-rata per bulan</div>
          </div>
          <div className="prst-kpi-footer">
            <span>Estimasi Tahunan:</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>{formatRupiah(yearlyEstimate)}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Detailed Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <div className="prst-panel" style={{ gridColumn: 'span 2' }}>
          <div className="prst-panel-header">
            <h2 className="prst-panel-title">
              <BarChart2 size={20} color="var(--primary-600)" />
              <span>Distribusi Hemat Berdasarkan Kategori</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Tahun 2026</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
            {categoryBreakdown.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                Belum ada data distribusi penghematan kategori.
              </div>
            ) : (
              categoryBreakdown.map((item, idx) => {
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={item.category || idx} className="prst-progress-row">
                    <div className="prst-progress-info">
                      <span className="prst-progress-label">{item.category}</span>
                      <span className="prst-progress-value" style={{ color: color }}>
                        {formatRupiah(item.savings)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="prst-progress-track">
                      <div className="prst-progress-fill" style={{ width: `${item.percentage}%`, backgroundColor: color }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="prst-panel">
          <div className="prst-panel-header">
            <h2 className="prst-panel-title">
              <Brain size={20} color="var(--success-600)" />
              <span>Evaluasi Hunter Kedisiplinan</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.5 }}>
            Berdasarkan riwayat transaksi, Anda berhasil menahan <strong style={{ color: 'var(--gray-900)' }}>{impulseRestraintPercent}%</strong> pembelian impulsif sebelum harga menyentuh zona target beli ideal.
          </p>

          <div style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 700 }}>HUNTER RANK:</span>
              <span style={{ color: 'var(--success-700)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={16} color="var(--success-600)" />
                {hunterLevel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 700 }}>DISCIPLINE SCORE:</span>
              <span style={{ color: 'var(--gray-900)', fontWeight: 800 }}>{disciplineScore} / 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
