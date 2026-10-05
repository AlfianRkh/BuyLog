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

  const realizedSavings = stats?.realizedSavings || 2850000;
  const targetHitCount = stats?.targetHitCount || 8;
  const totalCount = stats?.totalCount || 12;
  const avgDealScore = stats?.avgDealScore || '8.4';

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
          <button onClick={() => showToast("Filter rentang: 2026 Aktif")} className="prst-btn-secondary">
            <Calendar size={15} color="var(--primary-600)" />
            <span>Tahun 2026</span>
          </button>
          <button onClick={() => showToast("Mengunduh laporan PDF telemetri belanja...")} className="prst-btn-secondary">
            <Download size={15} color="var(--success-600)" />
            <span>Unduh PDF</span>
          </button>
          <button onClick={() => showToast("Mengekspor file CSV audit harga...")} className="prst-btn-primary">
            <FileSpreadsheet size={16} />
            <span>Ekspor CSV</span>
          </button>
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
              Rp 356k <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>/ Bln</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Kecepatan penghematan rata-rata per bulan</div>
          </div>
          <div className="prst-kpi-footer">
            <span>Estimasi Tahunan:</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>Rp 4.270.000</span>
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
            <div className="prst-progress-row">
              <div className="prst-progress-info">
                <span className="prst-progress-label">Elektronik & Gadget</span>
                <span className="prst-progress-value">Rp 1.850.000 (65%)</span>
              </div>
              <div className="prst-progress-track">
                <div className="prst-progress-fill" style={{ width: '65%', backgroundColor: 'var(--primary-600)' }}></div>
              </div>
            </div>

            <div className="prst-progress-row">
              <div className="prst-progress-info">
                <span className="prst-progress-label">Fashion & Apparel</span>
                <span className="prst-progress-value" style={{ color: 'var(--success-600)' }}>Rp 520.000 (18%)</span>
              </div>
              <div className="prst-progress-track">
                <div className="prst-progress-fill" style={{ width: '18%', backgroundColor: 'var(--success-500)' }}></div>
              </div>
            </div>

            <div className="prst-progress-row">
              <div className="prst-progress-info">
                <span className="prst-progress-label">Groceries & FMCG</span>
                <span className="prst-progress-value" style={{ color: 'var(--danger-600)' }}>Rp 310.000 (11%)</span>
              </div>
              <div className="prst-progress-track">
                <div className="prst-progress-fill" style={{ width: '11%', backgroundColor: 'var(--danger-500)' }}></div>
              </div>
            </div>

            <div className="prst-progress-row">
              <div className="prst-progress-info">
                <span className="prst-progress-label">Rumah Tangga</span>
                <span className="prst-progress-value" style={{ color: 'var(--gray-600)' }}>Rp 170.000 (6%)</span>
              </div>
              <div className="prst-progress-track">
                <div className="prst-progress-fill" style={{ width: '6%', backgroundColor: 'var(--gray-400)' }}></div>
              </div>
            </div>
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
            Berdasarkan riwayat transaksi, Anda berhasil menahan <strong style={{ color: 'var(--gray-900)' }}>87%</strong> pembelian impulsif sebelum harga menyentuh zona target beli ideal.
          </p>

          <div style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 700 }}>HUNTER RANK:</span>
              <span style={{ color: 'var(--success-700)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={16} color="var(--success-600)" />
                PRO HUNTER LEVEL 4
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 700 }}>DISCIPLINE SCORE:</span>
              <span style={{ color: 'var(--gray-900)', fontWeight: 800 }}>94 / 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
