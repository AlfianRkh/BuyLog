import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Activity, 
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import './HutangPiutangDashboardPage.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const HutangPiutangLaporanPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.debtTracker.getDebtMonthlyReport();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-500)', fontWeight: 600 }}>
        Memuat Laporan Keuangan Hutang Piutang...
      </div>
    );
  }

  const { summary, contacts_risk } = report;

  return (
    <div className="hp-dashboard-container">
      {/* Header */}
      <div className="hp-page-header">
        <div>
          <div className="hp-title-badge">
            <h1 className="hp-page-title">Laporan Keuangan Hutang Piutang</h1>
            <span className="hp-badge-live">Financial Analytics</span>
          </div>
          <div className="hp-page-subtitle">
            Ringkasan arus kas pelunasan, efektivitas settlement, dan profil risiko kontak.
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="hp-stats-grid">
        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Total Arus Masuk (Cash In)</span>
            <div className="hp-stat-icon-box piutang">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount piutang">{formatRupiah(summary.cash_in)}</div>
            <div className="hp-stat-subtext">{summary.cash_in_count} kali pembayaran piutang</div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Total Arus Keluar (Cash Out)</span>
            <div className="hp-stat-icon-box hutang">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount hutang">{formatRupiah(summary.cash_out)}</div>
            <div className="hp-stat-subtext">{summary.cash_out_count} kali pembayaran hutang</div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Net Cash Movement</span>
            <div className="hp-stat-icon-box balance">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className={`hp-stat-amount ${summary.net_movement >= 0 ? 'positive' : 'negative'}`}>
              {summary.net_movement >= 0 ? '+' : ''}{formatRupiah(summary.net_movement)}
            </div>
            <div className="hp-stat-subtext">Arus kas bersih dari pelunasan</div>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-top">
            <span className="hp-stat-label">Efektivitas Pelunasan</span>
            <div className="hp-stat-icon-box balance">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className="hp-stat-amount">{summary.settlement_rate}% Lunas</div>
            <div className="hp-stat-subtext">{summary.settled_count} dari {summary.total_count} transaksi lunas</div>
          </div>
        </div>
      </div>

      {/* Table Analisis Kinerja & Profil Risiko */}
      <div className="hp-card-panel">
        <h2 className="hp-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="var(--primary-600)" />
          <span>Analisis Kinerja Kontak & Profil Risiko</span>
        </h2>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)', color: 'var(--gray-600)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: '12px 16px' }}>Kontak</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Pinjaman</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Terbayar</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Sisa Piutang</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status Risiko</th>
              </tr>
            </thead>
            <tbody>
              {(!contacts_risk || contacts_risk.length === 0) ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-500)' }}>
                    Belum ada data analisis risiko kontak.
                  </td>
                </tr>
              ) : contacts_risk.map((c, idx) => (
                <tr key={c.id || idx} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--gray-900)' }}>{c.name}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatRupiah(c.total_loaned)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--success-600)', fontWeight: 600 }}>{formatRupiah(c.total_repaid)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800 }}>{formatRupiah(c.remaining_piutang)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`badge-status ${c.riskStatus === 'Lancar' ? 'settled' : c.riskStatus === 'Perlu Perhatian' ? 'overdue' : 'active'}`}>
                      {c.riskStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HutangPiutangLaporanPage;
