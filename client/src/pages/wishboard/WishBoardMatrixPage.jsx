import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scale, 
  PlusCircle, 
  Download, 
  Sliders, 
  Filter, 
  Trophy, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  BarChart2,
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

export default function WishBoardMatrixPage() {
  const navigate = useNavigate();
  const { items, weights } = useWishBoard();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeItems = items.filter(i => i.status !== 'skipped');

  const filteredItems = activeItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCat = filterCat === 'all' || (item.categorySlug && item.categorySlug === filterCat) || (item.category && item.category.toLowerCase().includes(filterCat));
    return matchesStatus && matchesCat;
  });

  const topPick = activeItems[0];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Rank,Produk,Kategori,Harga,Urgency,Want,PriorityScore,DecisionScore,BudgetSaved,Deadline\n"
        + filteredItems.map((item, idx) => `#${idx + 1},"${item.name}","${item.category}",${item.price},${item.urgency},${item.want},${item.score},${item.decisionRatio}%,${item.saved},"${item.deadline}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "decision_matrix_wishboard.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 800);
  };

  const avgScore = (activeItems.reduce((acc, curr) => acc + curr.score, 0) / (activeItems.length || 1)).toFixed(1);
  const totalSaved = activeItems.reduce((acc, curr) => acc + (curr.saved || 0), 0);

  return (
    <div className="wb-container">
      <AddWishItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Header Section */}
      <div className="wb-header">
        <div className="wb-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="wb-badge-live">
              <Scale size={13} />
              <span>Quantitative Evaluation Engine · Avg Score: {avgScore} pt</span>
            </span>
          </div>
          <h1 className="wb-page-title">
            <Scale size={28} color="var(--primary-600)" />
            <span>Decision Matrix &amp; Comparative Ranking Studio</span>
          </h1>
          <p className="wb-page-subtitle">
            Matriks analitis kuantitatif yang mengkorelasikan Skor Prioritas, Rasio Keputusan (Pros vs Cons), Kesiapan Budget, dan Deadline.
          </p>
        </div>

        <div className="wb-actions-group">
          <button onClick={handleExport} className="wb-btn-secondary">
            <Download size={16} color="var(--primary-600)" />
            <span>{exporting ? 'Mengekspor...' : 'Export Matrix CSV'}</span>
          </button>
          <button onClick={() => navigate('/wishboard/settings')} className="wb-btn-secondary">
            <Sliders size={16} />
            <span>Bobot ({weights.urgency}/{weights.want}/{weights.budget})</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="wb-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Item</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="wb-filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all', label: `Semua Aktif (${activeItems.length})` },
            { id: 'want', label: `Want (${activeItems.filter(i => i.status === 'want').length})` },
            { id: 'saving', label: `Saving (${activeItems.filter(i => i.status === 'saving').length})` },
            { id: 'ready', label: `Ready (${activeItems.filter(i => i.status === 'ready').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={filterStatus === tab.id ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Kategori:</span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'elektronik', label: 'Elektronik' },
            { id: 'fashion', label: 'Fashion' },
            { id: 'furnitur', label: 'Rumah Tangga' },
            { id: 'hobi', label: 'Hobi' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilterCat(chip.id)}
              className={filterCat === chip.id ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Insights Highlight Banner */}
      {topPick && (
        <div className="wb-banner" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1px solid #A7F3D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-500)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-700)', textTransform: 'uppercase' }}>Rekomendasi Utama Matrix</span>
                  <span className="wb-tag-ready">RANK #1 TOP PICK</span>
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                  <strong style={{ color: 'var(--success-700)' }}>{topPick.name}</strong> menduduki Rank #1 dengan Total Skor Prioritas <span style={{ fontWeight: 800 }}>{topPick.score}/100</span> dan Tabungan <span style={{ fontWeight: 800 }}>{topPick.readiness}%</span>.
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/wishboard/detail" className="wb-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                Audit Pro &amp; Kontra
              </Link>
              <Link to="/wishboard/detail" className="wb-btn-accent" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                <span>Alokasikan Budget</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Matrix Comparison Table */}
      <div className="wb-table-wrapper">
        <table className="wb-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
              <th>Produk &amp; Kategori</th>
              <th style={{ textAlign: 'right' }}>Estimasi Harga</th>
              <th style={{ textAlign: 'center' }}>U &amp; W</th>
              <th style={{ minWidth: '160px' }}>Priority Score</th>
              <th style={{ minWidth: '170px' }}>Decision Ratio (P/C)</th>
              <th style={{ minWidth: '160px' }}>Budget Readiness</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary-600)' }}>
                  #{idx + 1}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={item.img} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.name}</span>
                        {item.tag && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', padding: '1px 6px', borderRadius: '4px' }}>{item.tag}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.category} • {item.brand}</span>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {formatRupiah(item.price)}
                </td>
                <td style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                  U:{item.urgency} • W:{item.want}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span>{item.score}/100</span>
                      <span className={item.score >= 80 ? 'wb-tag-urgent' : 'wb-tag-high'}>{item.scoreBadge}</span>
                    </div>
                    <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: `${item.score}%` }}></div></div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)' }}>{item.decisionRatio}% Positif ({item.pros ? item.pros.length : 0} P / {item.cons ? item.cons.length : 0} C)</span>
                    <div style={{ display: 'flex', height: '6px', width: '100%', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--gray-200)' }}>
                      <div style={{ width: `${item.decisionRatio}%`, backgroundColor: 'var(--success-500)' }}></div>
                      <div style={{ width: `${100 - item.decisionRatio}%`, backgroundColor: 'var(--danger-500)' }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span>{item.readiness}%</span>
                      <span style={{ color: 'var(--gray-500)' }}>{formatRupiah(item.saved)}</span>
                    </div>
                    <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: `${item.readiness}%`, backgroundColor: item.readiness >= 100 ? 'var(--success-500)' : 'var(--primary-600)' }}></div></div>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  {item.deadline}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Link to="/wishboard/detail" className="wb-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
