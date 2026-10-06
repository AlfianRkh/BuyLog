import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  ThumbsUp, 
  ThumbsDown, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  Tag, 
  Zap, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';
import './WishBoardPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function WishBoardDetailPage() {
  const navigate = useNavigate();
  const { items, addDeposit, addPro, addCon, updateItemStatus } = useWishBoard();

  const activeItem = items && items.length > 0 ? items[0] : null;

  const [toastMsg, setToastMsg] = useState(null);
  const [newProText, setNewProText] = useState('');
  const [newConText, setNewConText] = useState('');

  if (!activeItem) {
    return (
      <div className="wb-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={32} color="var(--primary-600)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>Belum Ada Item Wishlist</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>
            Daftarkan impian atau barang target Anda untuk memulai analisis prioritas dan rasionalisasi budget.
          </p>
          <Link to="/wishboard" className="wb-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <PlusCircle size={18} />
            <span>Kembali ke Dashboard Wishboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDepositClick = (amount, note) => {
    addDeposit(activeItem.id, amount, note);
    triggerToast(`Berhasil menambahkan tabungan +${formatRupiah(amount)} (${note})!`);
  };

  const handleAddProSubmit = (e) => {
    e.preventDefault();
    if (newProText.trim()) {
      addPro(activeItem.id, newProText);
      setNewProText('');
      triggerToast('Alasan Pro berhasil ditambahkan!');
    }
  };

  const handleAddConSubmit = (e) => {
    e.preventDefault();
    if (newConText.trim()) {
      addCon(activeItem.id, newConText);
      setNewConText('');
      triggerToast('Alasan Con berhasil ditambahkan!');
    }
  };

  const handleMarkPurchased = () => {
    updateItemStatus(activeItem.id, 'purchased');
    triggerToast('Status diperbarui: Ditandai Sudah Dibeli! 🚀');
  };

  const remainingBudget = Math.max(0, activeItem.price - (activeItem.saved || 0));

  return (
    <div className="wb-container">
      {/* Toast Alert */}
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
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} color="var(--success-500)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/wishboard/board" className="wb-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <ArrowLeft size={16} />
            <span>Kanban Board</span>
          </Link>
          <span style={{ color: 'var(--gray-400)' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>{activeItem.category}</span>
          <span style={{ color: 'var(--gray-400)' }}>/</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)' }}>{activeItem.name}</span>
          <span className="wb-tag-saving">💰 SEDANG MENABUNG ({activeItem.readiness}%)</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleMarkPurchased} className="wb-btn-accent">
            <CheckCircle2 size={18} />
            <span>Tandai Sudah Beli</span>
          </button>
          <button onClick={() => handleDepositClick(remainingBudget, 'Pelunasan Sisa')} className="wb-btn-primary">
            <Wallet size={18} />
            <span>+ Lunasi Sisa</span>
          </button>
        </div>
      </div>

      {/* Product Spec Panel */}
      <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img src={activeItem.img} alt={activeItem.name} style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                SKU: {activeItem.sku || 'LOGI-MXK-S-BLK'} • GARANSI {activeItem.guarantee || '1 TAHUN'}
              </span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)' }}>{activeItem.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>{formatRupiah(activeItem.price)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>(Target: {formatRupiah(activeItem.price)})</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span className="wb-tag-urgent"><Clock size={12} /> Deadline: {activeItem.deadline} ({activeItem.daysLeft})</span>
                <span className="wb-tag-saving">{activeItem.category}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-700)', textTransform: 'uppercase' }}>Status Mesin Keputusan</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-700)' }}>READY TO EXECUTE</span>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--success-700)' }}>Risiko penyesalan finansial: <strong style={{ color: 'var(--success-700)' }}>Sangat Rendah (4%)</strong>.</p>
          </div>
        </div>
      </div>

      {/* 3 Score Gauges */}
      <div className="wb-grid-3">
        <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Priority Score</span>
            <span className="wb-tag-urgent">🔴 {activeItem.score}/100</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '5px solid var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-600)', flexShrink: 0 }}>
              {activeItem.score}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>Priority Index</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Top Tier Kuadran 1</p>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Urgensi (5/5 × 35%)</span><span style={{ fontWeight: 700 }}>35.0</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Keinginan (5/5 × 30%)</span><span style={{ fontWeight: 700 }}>30.0</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dana ({activeItem.readiness}% × 35%)</span><span style={{ fontWeight: 700 }}>{((activeItem.readiness * 35) / 100).toFixed(1)}</span></div>
          </div>
        </div>

        <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Decision Score</span>
            <span className="wb-tag-ready">🟢 {activeItem.decisionRatio}% Layak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '5px solid var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-600)', flexShrink: 0 }}>
              {activeItem.decisionRatio}%
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>Pros vs Cons</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--success-600)', fontWeight: 600 }}>{activeItem.pros ? activeItem.pros.length : 0} Alasan vs {activeItem.cons ? activeItem.cons.length : 0} Risiko</p>
            </div>
          </div>
          <div style={{ display: 'flex', height: '8px', width: '100%', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--gray-200)' }}>
            <div style={{ width: `${activeItem.decisionRatio}%`, backgroundColor: 'var(--success-500)' }}></div>
            <div style={{ width: `${100 - activeItem.decisionRatio}%`, backgroundColor: 'var(--danger-500)' }}></div>
          </div>
        </div>

        <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Budget Readiness</span>
            <span className="wb-tag-saving">{activeItem.readiness}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '5px solid var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-600)', flexShrink: 0 }}>
              {activeItem.readiness}%
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>{formatRupiah(activeItem.saved)}</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Target: {formatRupiah(activeItem.price)}</p>
            </div>
          </div>
          <div className="wb-progress-bar">
            <div className="wb-progress-fill" style={{ width: `${activeItem.readiness}%` }}></div>
          </div>
        </div>
      </div>

      {/* Pros & Cons Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '20px' }} className="lg:grid-cols-2">
        <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--gray-200)', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsUp size={18} />
                <span>Alasan Kuat Beli ({activeItem.pros ? activeItem.pros.length : 0})</span>
              </h3>
              <span className="wb-tag-ready">+85 POIN</span>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, listStyle: 'none' }}>
              {activeItem.pros && activeItem.pros.map((p, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--gray-800)', border: '1px solid var(--gray-200)' }}>
                  <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleAddProSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              value={newProText}
              onChange={(e) => setNewProText(e.target.value)}
              placeholder="+ Tambah Alasan Pro..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="wb-btn-accent" style={{ padding: '8px 14px' }}>
              Tambah
            </button>
          </form>
        </div>

        <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--gray-200)', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--danger-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsDown size={18} />
                <span>Alasan Menunda / Skip ({activeItem.cons ? activeItem.cons.length : 0})</span>
              </h3>
              <span className="wb-tag-urgent">-15 POIN</span>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, listStyle: 'none' }}>
              {activeItem.cons && activeItem.cons.map((c, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--gray-800)', border: '1px solid var(--gray-200)' }}>
                  <AlertCircle size={16} color="var(--danger-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleAddConSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              value={newConText}
              onChange={(e) => setNewConText(e.target.value)}
              placeholder="+ Tambah Keraguan/Con..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="wb-btn-secondary" style={{ padding: '8px 14px', backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', borderColor: 'var(--danger-200)' }}>
              Tambah
            </button>
          </form>
        </div>
      </div>

      {/* Quick Deposit Actions */}
      <div className="wb-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Simulasi Setoran Tabungan</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleDepositClick(50000, 'Top up instan')} className="wb-btn-secondary">
            +Rp 50.000
          </button>
          <button onClick={() => handleDepositClick(100000, 'Top up instan')} className="wb-btn-secondary">
            +Rp 100.000
          </button>
          <button onClick={() => handleDepositClick(remainingBudget, 'Pelunasan Penuh')} className="wb-btn-accent">
            +{formatRupiah(remainingBudget)} (Pelunasan 100%)
          </button>
        </div>
      </div>
    </div>
  );
}
