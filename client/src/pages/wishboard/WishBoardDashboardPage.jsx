import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  PlusCircle, 
  Download, 
  Calculator, 
  Package, 
  BrainCircuit, 
  Wallet, 
  CheckCircle2, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  PieChart, 
  History, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';
import AddWishItemModal from './AddWishItemModal';
import './WishBoardPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function WishBoardDashboardPage() {
  const navigate = useNavigate();
  const { items, topRecommendations } = useWishBoard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeItems = items.filter(i => i.status !== 'skipped');
  const wantItems = items.filter(i => i.status === 'want');
  const savingItems = items.filter(i => i.status === 'saving');
  const readyItems = items.filter(i => i.status === 'ready');
  const purchasedItems = items.filter(i => i.status === 'purchased');

  const totalEstimatedCost = activeItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalSaved = activeItems.reduce((acc, curr) => acc + (curr.saved || 0), 0);
  const totalDeficit = Math.max(0, totalEstimatedCost - totalSaved);
  const overallSavedPercent = totalEstimatedCost > 0 ? Math.min(100, Math.round((totalSaved / totalEstimatedCost) * 100)) : 0;

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nama,Kategori,Harga,Terkumpul,Status,PriorityScore\n"
      + activeItems.map(i => `"${i.name}","${i.category}",${i.price},${i.saved},"${i.status}",${i.score}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rekap_wishboard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wb-container">
      <AddWishItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Header Section */}
      <div className="wb-header">
        <div className="wb-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="wb-badge-live">
              <Sparkles size={13} />
              <span>Engine v2.4 Active · Algoritma Rasionalisasi</span>
            </span>
          </div>
          <h1 className="wb-page-title">
            <Sparkles size={28} color="var(--primary-600)" />
            <span>Dashboard Wishlist &amp; Analisis Prioritas</span>
          </h1>
          <p className="wb-page-subtitle">
            Kalkulasi cerdas data-driven untuk mengeliminasi pembelian impulsif dan prioritaskan target belanja berdasarkan utilitas riil.
          </p>
        </div>

        <div className="wb-actions-group">
          <button onClick={() => setIsAddModalOpen(true)} className="wb-btn-accent">
            <PlusCircle size={18} />
            <span>+ Tambah Wishlist</span>
          </button>
          <button onClick={handleExport} className="wb-btn-secondary">
            <Download size={18} color="var(--primary-600)" />
            <span>Export Rekap</span>
          </button>
          <button onClick={() => navigate('/wishboard/matrix')} className="wb-btn-primary">
            <Calculator size={18} />
            <span>Simulasi Budget</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="wb-kpi-grid-5">
        <div className="wb-kpi-card">
          <div className="wb-kpi-header">
            <div>
              <div className="wb-kpi-label">Total Items</div>
              <div className="wb-kpi-value">{activeItems.length} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>Produk</span></div>
            </div>
            <div className="wb-kpi-icon-box">
              <Package size={22} />
            </div>
          </div>
          <div className="wb-kpi-footer">
            <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{formatRupiah(totalEstimatedCost)}</span>
            <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Estimasi Total</span>
          </div>
        </div>

        <div className="wb-kpi-card">
          <div className="wb-kpi-header">
            <div>
              <div className="wb-kpi-label">In Want</div>
              <div className="wb-kpi-value">{wantItems.length} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>Item</span></div>
            </div>
            <div className="wb-kpi-icon-box" style={{ backgroundColor: 'var(--info-50)', color: 'var(--info-600)' }}>
              <BrainCircuit size={22} />
            </div>
          </div>
          <div className="wb-kpi-footer">
            <span style={{ color: 'var(--info-600)', fontWeight: 600 }}>Evaluasi &amp; Riset</span>
            <span>Cooling Off</span>
          </div>
        </div>

        <div className="wb-kpi-card">
          <div className="wb-kpi-header">
            <div>
              <div className="wb-kpi-label">In Saving</div>
              <div className="wb-kpi-value">{savingItems.length} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>Item</span></div>
            </div>
            <div className="wb-kpi-icon-box" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Wallet size={22} />
            </div>
          </div>
          <div className="wb-kpi-footer">
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>{formatRupiah(totalSaved)}</span>
            <span>{overallSavedPercent}% Terkumpul</span>
          </div>
        </div>

        <div className="wb-kpi-card" style={{ borderLeft: '4px solid var(--success-500)' }}>
          <div className="wb-kpi-header">
            <div>
              <div className="wb-kpi-label" style={{ color: 'var(--success-600)' }}>Ready to Buy</div>
              <div className="wb-kpi-value" style={{ color: 'var(--success-600)' }}>{readyItems.length} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Siap</span></div>
            </div>
            <div className="wb-kpi-icon-box" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="wb-kpi-footer">
            <span className="wb-tag-ready">SIAP BELI SEKARANG</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>Budget 100%</span>
          </div>
        </div>

        <div className="wb-kpi-card">
          <div className="wb-kpi-header">
            <div>
              <div className="wb-kpi-label">Purchased</div>
              <div className="wb-kpi-value">{purchasedItems.length} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>Item</span></div>
            </div>
            <div className="wb-kpi-icon-box" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)' }}>
              <ShoppingBag size={22} />
            </div>
          </div>
          <div className="wb-kpi-footer">
            <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>Hemat Rp 420k</span>
            <span>Bulan Ini</span>
          </div>
        </div>
      </div>

      {/* Global Budget Overview Banner */}
      <div className="wb-banner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-900)' }}>Alokasi &amp; Kapasitas Finansial Wishlist</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--gray-600)' }}>Metrik perbandingan antara total estimasi seluruh daftar keinginan dengan tabungan aktif tersimpan.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Target Total</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>{formatRupiah(totalEstimatedCost)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--primary-200)' }}></div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)', textTransform: 'uppercase' }}>Terkumpul ({overallSavedPercent}%)</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success-600)' }}>{formatRupiah(totalSaved)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--primary-200)' }}></div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger-600)', textTransform: 'uppercase' }}>Sisa Defisit</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-700)' }}>{formatRupiah(totalDeficit)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="wb-progress-bar">
              <div className="wb-progress-fill" style={{ width: `${overallSavedPercent}%`, backgroundColor: 'var(--primary-600)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>
              <span>Dana Terkumpul: {formatRupiah(totalSaved)}</span>
              <span>Kebutuhan Ekstra: {(100 - overallSavedPercent).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Algorithmic Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--gray-900)' }}>Beli Ini Dulu! (Top 3 Rekomendasi Algoritmik)</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>Diurutkan berdasarkan kombinasi Formula Urgensi, Skor Pro/Con, dan Kesiapan Tabungan.</p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', backgroundColor: 'var(--gray-100)', padding: '4px 10px', borderRadius: 'var(--radius-md)' }}>Metode: Multi-Factor Utility (v1)</span>
        </div>

        <div className="wb-grid-3">
          {topRecommendations.map((item, index) => (
            <div key={item.id} className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '16px', backgroundColor: index === 0 ? 'var(--primary-600)' : 'var(--gray-800)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                RANK #{index + 1} • SKOR {item.score}/100
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>{item.category}</span>
                      <span className={item.score >= 80 ? 'wb-tag-urgent' : 'wb-tag-high'}>{item.scoreBadge}</span>
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>{formatRupiah(item.price)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Urgensi</span>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>{'★'.repeat(item.urgency)}{'☆'.repeat(5 - item.urgency)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Keinginan</span>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>{'★'.repeat(item.want)}{'☆'.repeat(5 - item.want)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Tabungan ({item.readiness}%)</span>
                    <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>{formatRupiah(item.saved)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Decision Score</span>
                    <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>{item.decisionRatio}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Progress Dana</span>
                    <span style={{ color: 'var(--success-600)' }}>{item.readiness}% (Sisa {formatRupiah(Math.max(0, item.price - item.saved))})</span>
                  </div>
                  <div className="wb-progress-bar">
                    <div className="wb-progress-fill" style={{ width: `${item.readiness}%`, backgroundColor: 'var(--success-500)' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' }}>
                <Link to="/wishboard/detail" className="wb-btn-accent" style={{ flex: 1, justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Lihat Analisis Detail</span>
                </Link>
                <button onClick={() => navigate('/wishboard/matrix')} className="wb-btn-secondary" style={{ padding: '8px 12px' }} title="Buka Spreadsheet Komparasi">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Deadlines & Cooling Period Alerts */}
        <div style={{ gridColumn: 'span 12 / span 12' }} className="lg:col-span-7 flex flex-col gap-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--danger-500)" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Deadline Keputusan &amp; Cooling Alert</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)' }}>3 PERLU TINDAKAN</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="wb-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>MacBook Pro M4 14"</h4>
                    <span className="wb-tag-urgent">3 Hari Lagi! ⚠️</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-600)' }}>Target Evaluasi: 6 Okt 2026 • Perlu review pros/cons final sebelum promo berakhir</p>
                </div>
              </div>
              <button onClick={() => navigate('/wishboard/matrix')} className="wb-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Finalisasi Skor
              </button>
            </div>

            <div className="wb-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>Monitor LG UltraFine 4K 27"</h4>
                    <span className="wb-tag-ready">12 Hari Lagi</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-600)' }}>Target Evaluasi: 15 Okt 2026 • Status: Tabungan penuh 100%</p>
                </div>
              </div>
              <button onClick={() => navigate('/wishboard/board')} className="wb-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Pindahkan ke Ready
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Category Distribution & Audit Log */}
        <div style={{ gridColumn: 'span 12 / span 12' }} className="lg:col-span-5 flex flex-col gap-4">
          <div className="wb-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} color="var(--primary-600)" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>Distribusi per Kategori</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{formatRupiah(totalEstimatedCost)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>
                  <span>Elektronik &amp; Gadget</span>
                  <span style={{ color: 'var(--primary-600)' }}>55%</span>
                </div>
                <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: '55%' }}></div></div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>
                  <span>Fashion &amp; Apparel</span>
                  <span style={{ color: 'var(--info-600)' }}>22%</span>
                </div>
                <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: '22%', backgroundColor: 'var(--info-500)' }}></div></div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>
                  <span>Rumah Tangga &amp; Setup</span>
                  <span style={{ color: 'var(--success-600)' }}>15%</span>
                </div>
                <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: '15%', backgroundColor: 'var(--success-500)' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
