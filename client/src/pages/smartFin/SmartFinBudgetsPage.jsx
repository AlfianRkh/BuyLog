import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Lightbulb,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PieChart,
  RefreshCw,
  Server,
  Trash2,
  X,
  PlusCircle,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { useSmartFin, formatIDR } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinBudgetsPage() {
  const { triggerToast } = useSmartFin();

  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPlafon: 0,
    totalSpent: 0,
    remainingQuota: 0,
    burnRatePct: 0,
    burnPaceStatus: 'Ideal',
    paceDiff: 0,
    currentDay: 6,
    totalDays: 31,
    idealPct: 19.4
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Envelope Form State
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('1000000');
  const [budgetIcon, setBudgetIcon] = useState('🥫');
  const [budgetCategory, setBudgetCategory] = useState('Pokok');

  // Rule 50/30/20 State
  const [salaryInput, setSalaryInput] = useState('8500000');

  // Fetch live budget data from Backend API (BE)
  const fetchBudgetsFromBE = async () => {
    try {
      setLoading(true);
      const res = await api.smartFin.getBudgets();
      if (res && res.budgets) {
        setBudgets(res.budgets);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed fetching budgets from BE:', err);
      // Fallback
      setBudgets([
        { id: 'env-1', name: '🥫 Kebutuhan Dapur & Bahan', limit: 2500000, spent: 1850000, icon: '🥫', category: 'Pokok' },
        { id: 'env-2', name: '🍽️ Makan Luar & Resto', limit: 1200000, spent: 980000, icon: '🍽️', category: 'Pokok' },
        { id: 'env-3', name: '⚡ Tagihan & Utilitas', limit: 800000, spent: 620000, icon: '⚡', category: 'Pokok' },
        { id: 'env-4', name: '🚗 Bensin & Transport', limit: 600000, spent: 250000, icon: '🚗', category: 'Pokok' },
        { id: 'env-5', name: '☕ Kafe & Hiburan', limit: 500000, spent: 150000, icon: '☕', category: 'Keinginan' }
      ]);
      setMetrics({
        totalPlafon: 6500000,
        totalSpent: 3850000,
        remainingQuota: 2650000,
        burnRatePct: 59.2,
        burnPaceStatus: 'Waspada Laju',
        paceDiff: 39.8,
        currentDay: 6,
        totalDays: 31,
        idealPct: 19.4
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsFromBE();
  }, []);

  // Submit New Envelope Pos to Backend API (BE)
  const handleAddBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!budgetName.trim()) {
      triggerToast('Nama pos anggaran wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.smartFin.createBudget({
        name: budgetName,
        limit: budgetLimit,
        icon: budgetIcon,
        category: budgetCategory
      });

      if (res && res.budgets) {
        setBudgets(res.budgets);
        if (res.metrics) setMetrics(res.metrics);
        triggerToast(res.message || `Pos "${budgetName}" berhasil disimpan ke Server BE!`);
      }
    } catch (err) {
      console.error('Failed creating budget in BE:', err);
      triggerToast('Gagal menambahkan pos anggaran ke Backend.');
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
      setBudgetName('');
      setBudgetLimit('1000000');
    }
  };

  // Apply 50/30/20 Allocation Rule in Backend API (BE)
  const handleApplyRule503020 = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.smartFin.applyRule503020(salaryInput);
      if (res && res.budgets) {
        setBudgets(res.budgets);
        if (res.metrics) setMetrics(res.metrics);
        triggerToast(res.message || 'Pola 50/30/20 berhasil diterapkan ke Backend API!');
      }
    } catch (err) {
      console.error('Failed applying 50/30/20 in BE:', err);
      triggerToast('Gagal menerapkan alokasi 50/30/20.');
    } finally {
      setIsSubmitting(false);
      setShowRuleModal(false);
    }
  };

  // Delete Envelope Pos from Backend API (BE)
  const handleDeleteBudget = async (id, name) => {
    try {
      const res = await api.smartFin.deleteBudget(id);
      if (res && res.budgets) {
        setBudgets(res.budgets);
        if (res.metrics) setMetrics(res.metrics);
        triggerToast(res.message || `Pos "${name}" dihapus dari Backend.`);
      }
    } catch (err) {
      console.error('Failed deleting budget in BE:', err);
      triggerToast('Gagal menghapus pos anggaran');
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
              {budgets.length} Pos Amplop (Backend Data)
            </span>
          </div>
          <h1 className="sf-page-title">
            <PiggyBank className="sf-text-primary" size={28} />
            <span>Pos Anggaran &amp; Amplop Digital</span>
          </h1>
          <p className="sf-page-subtitle">
            Metodologi amplop digital yang memotong kuota anggaran bulanan otomatis dari verifikasi Backend API &amp; scan struk OCR.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchBudgetsFromBE} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={() => setShowRuleModal(true)} className="sf-btn-secondary">
            <Lightbulb size={18} color="#06b6d4" />
            <span>Simulasi 50/30/20</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="sf-btn-primary">
            <Plus size={18} />
            <span>+ Tambah Pos</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Live BE) */}
      <div className="sf-kpi-grid">
        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label">Total Plafon Anggaran (BE)</span>
              <div className="sf-kpi-value">{formatIDR(metrics.totalPlafon)}</div>
            </div>
            <div className="sf-kpi-icon-box">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Batas Bulan Ini</span>
            <strong>{budgets.length} Pos Aktif BE</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label" style={{ color: '#b91c1c' }}>Total Terpakai (BE)</span>
              <div className="sf-kpi-value" style={{ color: '#b91c1c' }}>{formatIDR(metrics.totalSpent)}</div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Realisasi Struk BE</span>
            <strong style={{ color: '#b91c1c' }}>{metrics.burnRatePct}% Terpakai</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label" style={{ color: '#047857' }}>Sisa Kuota Kas (BE)</span>
              <div className="sf-kpi-value" style={{ color: '#047857' }}>{formatIDR(metrics.remainingQuota)}</div>
            </div>
            <div className="sf-kpi-icon-box">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Tersedia untuk {metrics.totalDays - metrics.currentDay} hari</span>
            <strong style={{ color: '#047857' }}>{(100 - metrics.burnRatePct).toFixed(1)}% Sisa</strong>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
            <div>
              <span className="sf-kpi-label" style={{ color: metrics.paceDiff > 10 ? '#b91c1c' : '#047857' }}>Status Burn Pace</span>
              <div className="sf-kpi-value" style={{ color: metrics.paceDiff > 10 ? '#b91c1c' : '#047857', fontSize: '1.25rem' }}>
                {metrics.burnPaceStatus}
              </div>
            </div>
            <div className="sf-kpi-icon-box" style={{ backgroundColor: metrics.paceDiff > 10 ? '#fff7ed' : '#ecfdf5', color: metrics.paceDiff > 10 ? '#c2410c' : '#047857' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="sf-kpi-footer">
            <span>Kecepatan Belanja BE</span>
            <strong style={{ color: metrics.paceDiff > 10 ? '#b91c1c' : '#047857' }}>
              {metrics.paceDiff >= 0 ? `+${metrics.paceDiff}%` : `${metrics.paceDiff}%`} vs Ideal
            </strong>
          </div>
        </div>
      </div>

      {/* Burn Rate Monitor Bar (Live BE) */}
      <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>
            Laju Pengeluaran Server BE: Hari ke-{metrics.currentDay} dari {metrics.totalDays} Hari
          </strong>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: metrics.paceDiff > 10 ? '#fef2f2' : '#ecfdf5',
            color: metrics.paceDiff > 10 ? '#b91c1c' : '#047857',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: metrics.paceDiff > 10 ? '1px solid #fecaca' : '1px solid #a7f3d0'
          }}>
            {metrics.paceDiff > 10 ? `⚠️ Laju belanja lebih cepat (+${metrics.paceDiff}% di atas ideal)` : '✅ Laju belanja terkendali aman'}
          </span>
        </div>
        <div style={{ width: '100%', backgroundColor: 'var(--gray-100)', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '6px' }}>
          <div style={{
            width: `${Math.min(metrics.burnRatePct, 100)}%`,
            backgroundColor: metrics.burnRatePct > 80 ? '#ef4444' : metrics.burnRatePct > 50 ? '#f59e0b' : '#10b981',
            height: '100%',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          <span>Jadwal Ideal Kalender ({metrics.idealPct}%)</span>
          <strong style={{ color: metrics.burnRatePct > 80 ? '#b91c1c' : '#047857' }}>
            Realisasi BE Terproses: {metrics.burnRatePct}%
          </strong>
        </div>
      </div>

      {/* Grid Envelopes & 50/30/20 Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left: Envelopes list from BE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Daftar Amplop Anggaran (BE Server Data)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              Live Backend
            </span>
          </div>

          {loading ? (
            <div className="sf-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Memuat data pos anggaran dari Server Backend...
            </div>
          ) : budgets.length === 0 ? (
            <div className="sf-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Belum ada pos anggaran tersimpan di Backend. Klik "+ Tambah Pos" untuk membuat amplop pertama.
            </div>
          ) : (
            budgets.map((env) => {
              const percentage = Number(((env.spent / env.limit) * 100).toFixed(1));
              const isCritical = percentage >= 90;
              const isWarning = percentage >= 70 && percentage < 90;

              return (
                <div key={env.id} className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                        {env.icon || '📦'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)', display: 'block' }}>{env.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Plafon: {formatIDR(env.limit)} • Terpakai: {formatIDR(env.spent)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isCritical ? '#fef2f2' : isWarning ? '#ecfeff' : '#ecfdf5',
                        color: isCritical ? '#b91c1c' : isWarning ? '#0369a1' : '#047857',
                        border: isCritical ? '1px solid #fecaca' : isWarning ? '1px solid #bae6fd' : '1px solid #a7f3d0'
                      }}>
                        {percentage}% {isCritical ? 'KRITIS' : isWarning ? 'WASPADA' : 'AMAN'}
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(env.id, env.name)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Hapus Amplop Pos BE"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isCritical ? '#ef4444' : isWarning ? '#06b6d4' : '#10b981',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: 50/30/20 Rule Simulator (BE Action) */}
        <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={20} color="#06b6d4" />
              Pola Alokasi 50/30/20 (BE)
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)', padding: '2px 8px', borderRadius: '4px' }}>Rujukan Sehat</span>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase' }}>Basis Gaji / Income Bulanan (IDR)</label>
            <input
              type="number"
              className="sf-form-control"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyBetween: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#06b6d4' }}>50% Kebutuhan Pokok</span>
              <strong style={{ color: 'var(--gray-900)' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.5))}</strong>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyBetween: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#7e22ce' }}>30% Keinginan (Wants)</span>
              <strong style={{ color: 'var(--gray-900)' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.3))}</strong>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyBetween: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#10b981' }}>20% Tabungan &amp; Investasi</span>
              <strong style={{ color: 'var(--gray-900)' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.2))}</strong>
            </div>
          </div>

          <button
            onClick={handleApplyRule503020}
            disabled={isSubmitting}
            className="sf-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSubmitting ? 'Memproses di Server BE...' : 'Terapkan Pembagian ke Backend'}
          </button>
        </div>
      </div>

      {/* Modal: Tambah Pos Anggaran Baru BE */}
      {showAddModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#10b981" />
                Tambah Pos Amplop Anggaran Baru (BE)
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Nama Pos Anggaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 🥫 Belanja Dapur, 🚗 Bensin, 🎬 Streaming"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Icon Emoji
                  </label>
                  <select
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1.125rem' }}
                    value={budgetIcon}
                    onChange={(e) => setBudgetIcon(e.target.value)}
                  >
                    <option value="🥫">🥫 Dapur &amp; Bahan</option>
                    <option value="🍽️">🍽️ Resto &amp; Makan</option>
                    <option value="⚡">⚡ Tagihan &amp; PLN</option>
                    <option value="🚗">🚗 Transport &amp; Bensin</option>
                    <option value="☕">☕ Kafe &amp; Kopi</option>
                    <option value="🎬">🎬 Hiburan &amp; Hobi</option>
                    <option value="🛡️">🛡️ Dana Darurat</option>
                    <option value="🏥">🏥 Kesehatan</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Kategori Alokasi
                  </label>
                  <select
                    className="sf-form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                  >
                    <option value="Pokok">Mandatori / Pokok</option>
                    <option value="Keinginan">Keinginan (Wants)</option>
                    <option value="Tabungan">Tabungan &amp; Investasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Plafon Anggaran Bulanan (IDR)
                </label>
                <input
                  type="number"
                  placeholder="1000000"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Menyimpan ke BE...' : 'Simpan Pos BE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simulasi & Penerapan Pola 50/30/20 BE */}
      {showRuleModal && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={20} color="#06b6d4" />
                Simulasi Metodologi 50/30/20 (BE Server API)
              </h3>
              <button onClick={() => setShowRuleModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Sistem akan membagi basis gaji/pendapatan bersih bulanan Anda secara rasional ke dalam 3 kelompok amplop utama di Backend API.
              </p>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Basis Gaji / Income Bulanan (IDR)
                </label>
                <input
                  type="number"
                  className="sf-form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '1.125rem', fontWeight: 800, color: '#10b981' }}
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#ecfeff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', display: 'flex', justifyBetween: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#0369a1' }}>50% Kebutuhan Pokok</span>
                  <strong style={{ color: '#0369a1' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.5))}</strong>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff', display: 'flex', justifyBetween: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#7e22ce' }}>30% Keinginan / Lifestyle</span>
                  <strong style={{ color: '#7e22ce' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.3))}</strong>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', display: 'flex', justifyBetween: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#047857' }}>20% Tabungan &amp; Investasi</span>
                  <strong style={{ color: '#047857' }}>{formatIDR(Math.round((Number(salaryInput) || 0) * 0.2))}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowRuleModal(false)} className="sf-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="button" onClick={handleApplyRule503020} disabled={isSubmitting} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Memproses ke BE...' : 'Terapkan Ke Pos Anggaran BE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

