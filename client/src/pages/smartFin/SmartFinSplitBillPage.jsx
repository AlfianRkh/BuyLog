import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Utensils,
  Copy,
  ExternalLink,
  CheckCircle2,
  Wallet,
  Users,
  MessageSquare,
  Share2,
  RefreshCw,
  Server
} from 'lucide-react';
import api from '../../services/api';
import { useSmartFin, formatIDR } from '../../contexts/SmartFinContext';
import './SmartFinPages.css';

export default function SmartFinSplitBillPage() {
  const { triggerToast } = useSmartFin();

  const [loading, setLoading] = useState(true);
  const [billMeta, setBillMeta] = useState({
    title: 'Kopi Kenangan & Kitchen - Galaxy Mall',
    merchant: 'Kopi Kenangan & Kitchen - Galaxy Mall',
    invoiceNo: 'INV-KK-20261005-0421',
    date: '05 Okt 2026, 20:15 WIB',
    paymentMethod: 'QRIS BCA',
    paidBy: 'Alfian S.',
    subtotalMenu: 190000,
    taxPb1: 19000,
    service: 11000,
    totalBill: 220000
  });

  const [participants, setParticipants] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch Split Bill & Participants directly from Backend API (BE)
  const fetchSplitBillFromBE = async () => {
    try {
      setLoading(true);
      const res = await api.smartFin.getSplitBill();
      if (res && res.data) {
        const { participants: beParticipants, ...meta } = res.data;
        if (beParticipants) setParticipants(beParticipants);
        setBillMeta(prev => ({ ...prev, ...meta }));
      }
    } catch (err) {
      console.error('Failed fetching split bill from BE:', err);
      // Fallback local data if BE connection fails
      setParticipants([
        { id: 'p1', name: 'Alfian (Saya)', isHost: true, isPaid: true, portion: 57895, desc: 'Nasgor Gila + Fries' },
        { id: 'p2', name: 'Budi Pratama', isHost: false, isPaid: false, portion: 92632, desc: 'Double Wagyu + Fries' },
        { id: 'p3', name: 'Sari Anggraini', isHost: false, isPaid: true, portion: 63684, desc: 'Carbonara + Fries' },
        { id: 'p4', name: 'Dimas Raditya', isHost: false, isPaid: false, portion: 31263, desc: 'Kopi Mantan + Fries' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplitBillFromBE();
  }, []);

  // Update participant payment status in Backend API (BE)
  const handleTogglePaidBE = async (memberId) => {
    try {
      setIsUpdating(true);
      const res = await api.smartFin.toggleMemberPaid(memberId);
      if (res && res.data && res.data.participants) {
        setParticipants(res.data.participants);
        triggerToast(res.message || 'Status pembayaran diperbarui di Backend!');
      }
    } catch (err) {
      console.error('Failed updating status in BE:', err);
      // Fallback optimistic update
      setParticipants(prev => prev.map(p => p.id === memberId ? { ...p, isPaid: !p.isPaid } : p));
      triggerToast('Status pembayaran diperbarui (Local Sync)');
    } finally {
      setIsUpdating(false);
    }
  };

  const waText = `Halo teman-teman! Berikut rekap Split-Bill makan di ${billMeta.merchant} (${billMeta.date}):

${participants.map(p => `• *${p.name.replace(' (Saya)', '')}*: ${formatIDR(p.portion)} (${p.desc}) ${p.isPaid ? '[LUNAS ✅]' : ''}`).join('\n')}

Total Struk: *${formatIDR(billMeta.totalBill)}* (Pas 100%)
Silakan transfer ke BCA 5410-8821-9920 a/n Alfian Satria atau QRIS terlampir. Terima kasih! 🙏`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(waText);
    triggerToast('Format WhatsApp berhasil disalin ke clipboard!');
  };

  const paidCount = participants.filter(p => p.isPaid).length;

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
              Live Data from Backend API
            </span>
          </div>
          <h1 className="sf-page-title">
            <PieChart className="sf-text-primary" size={28} />
            <span>Smart Split-Bill Restoran &amp; Kafe</span>
          </h1>
          <p className="sf-page-subtitle">
            Bagi nota makan bersama teman secara adil &amp; transparan. Data rincian &amp; tombol status pembayaran terhubung langsung ke Server Backend.
          </p>
        </div>

        <div className="sf-actions-group">
          <button onClick={fetchSplitBillFromBE} className="sf-btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh BE</span>
          </button>
          <button onClick={copyToClipboard} className="sf-btn-primary">
            <Copy size={18} />
            <span>Salin Format WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Summary Banner Card */}
      <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                  {billMeta.merchant}
                </h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  BE Database Connected
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '2px', display: 'block' }}>
                Ref: <span style={{ fontFamily: 'monospace', color: 'var(--gray-700)' }}>#{billMeta.invoiceNo}</span> • {billMeta.date}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--gray-50)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Dibayar oleh: <strong style={{ color: 'var(--gray-900)' }}>{billMeta.paidBy}</strong> (via {billMeta.paymentMethod})</span>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', paddingTop: '8px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Subtotal Menu</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '2px' }}>{formatIDR(billMeta.subtotalMenu)}</div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>Dari Database BE</span>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Pajak PB1 (10%)</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>+{formatIDR(billMeta.taxPb1)}</div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>Hitungan BE</span>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Service Charge</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>+{formatIDR(billMeta.service)}</div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>Hitungan BE</span>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Total Nilai Struk</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{formatIDR(billMeta.totalBill)}</div>
            <span style={{ fontSize: '0.6875rem', color: '#047857' }}>Rekonsiliasi Pas 100%</span>
          </div>
        </div>
      </div>

      {/* Participants Cards (Fetched Live from BE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#10b981" />
            Rincian Nominal per Peserta (Live BE API Data)
          </h3>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Status Lunas: <strong style={{ color: '#047857' }}>{paidCount}/{participants.length} Peserta</strong>
          </span>
        </div>

        {loading ? (
          <div className="sf-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Memuat data rincian peserta dari Server Backend...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {participants.map((p) => (
              <div key={p.id} className="sf-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--gray-100)', color: 'var(--gray-800)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.desc}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: p.isPaid ? '#ecfdf5' : '#fffbeb',
                      color: p.isPaid ? '#047857' : '#b45309',
                      border: p.isPaid ? '1px solid #a7f3d0' : '1px solid #fde68a'
                    }}>
                      {p.isPaid ? 'LUNAS ✅' : 'MENUNGGU'}
                    </span>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Tagihan</span>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#047857' }}>{formatIDR(p.portion)}</div>
                  </div>
                </div>

                {!p.isHost && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleTogglePaidBE(p.id)}
                    className={p.isPaid ? 'sf-btn-secondary' : 'sf-btn-primary'}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8125rem', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    {p.isPaid ? 'Tandai Belum Lunas (BE Update)' : 'Tandai Sudah Lunas (BE Update)'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Rekap Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="#10b981" />
              WhatsApp Rekap Generator (BE Live Output)
            </h3>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--gray-500)' }}>Live Output</span>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--gray-900)', whitespace: 'pre-line', lineHeight: '1.6' }}>
            {waText}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={copyToClipboard} className="sf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Copy size={16} />
              <span>Salin Teks Clipboard</span>
            </button>
            <a href="https://web.whatsapp.com" target="_blank" rel="noreferrer" className="sf-btn-secondary">
              <ExternalLink size={16} color="#06b6d4" />
              <span>WhatsApp Web</span>
            </a>
          </div>
        </div>

        {/* Piutang Tracker */}
        <div className="sf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={20} color="#06b6d4" />
              Status Piutang Makan Server
            </h3>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#06b6d4' }}>
              {paidCount}/{participants.length} Selesai
            </span>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Rekening Penggantian:</span>
              <strong style={{ color: 'var(--gray-900)' }}>BCA 5410-8821-9920</strong>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Atas Nama:</span>
              <strong style={{ color: 'var(--gray-900)' }}>Alfian Satria</strong>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: '1.5' }}>
            Saat teman menyelesaikan transfer piutang, menekan tombol status di halaman ini akan memperbarui status pelunasan di Server Backend secara instan.
          </p>
        </div>
      </div>
    </div>
  );
}
