import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Columns3, 
  PlusCircle, 
  Sliders, 
  Search, 
  Filter, 
  GripVertical, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle,
  Wallet,
  Target
} from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';
import AddWishItemModal from './AddWishItemModal';
import './WishBoardPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function WishBoardKanbanPage() {
  const navigate = useNavigate();
  const { items, skippedItems, updateItemStatus } = useWishBoard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [showSkipped, setShowSkipped] = useState(true);
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filterCard = (item) => {
    const matchesCat = selectedCat === 'Semua' || (item.category && item.category.toLowerCase().includes(selectedCat.toLowerCase())) || (item.categorySlug && item.categorySlug.toLowerCase().includes(selectedCat.toLowerCase()));
    const matchesQuery = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  };

  const wantList = items.filter(i => i.status === 'want' && filterCard(i));
  const savingList = items.filter(i => i.status === 'saving' && filterCard(i));
  const readyList = items.filter(i => i.status === 'ready' && filterCard(i));
  const purchasedList = items.filter(i => i.status === 'purchased' && filterCard(i));

  const wantTotal = wantList.reduce((a, c) => a + (c.price || 0), 0);
  const savingTotal = savingList.reduce((a, c) => a + (c.price || 0), 0);
  const savingSavedTotal = savingList.reduce((a, c) => a + (c.saved || 0), 0);
  const readyTotal = readyList.reduce((a, c) => a + (c.price || 0), 0);
  const purchasedTotal = purchasedList.reduce((a, c) => a + (c.price || 0), 0);

  // Drag and Drop handlers
  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      updateItemStatus(itemId, newStatus);
    }
  };

  return (
    <div className="wb-container">
      <AddWishItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Header Section */}
      <div className="wb-header">
        <div className="wb-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="wb-badge-live">
              <Columns3 size={13} />
              <span>Decision Pipeline · {items.length} Active Entities</span>
            </span>
          </div>
          <h1 className="wb-page-title">
            <Columns3 size={28} color="var(--primary-600)" />
            <span>Kanban Pipeline Keputusan Belanja</span>
          </h1>
          <p className="wb-page-subtitle">
            Visualisasi parameter multi-tahap pembelian dari evaluasi awal, fase akumulasi tabungan, validasi siap eksekusi, hingga realisasi hemat biaya.
          </p>
        </div>

        <div className="wb-actions-group">
          <button onClick={() => navigate('/wishboard/settings')} className="wb-btn-secondary">
            <Sliders size={16} />
            <span>Parameter Bobot</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="wb-btn-primary">
            <PlusCircle size={18} />
            <span>+ Tambah Item Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="wb-filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Semua', 'Elektronik', 'Fashion', 'Setup', 'Audio', 'Hobi'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={selectedCat === cat ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="wb-search-input">
          <Search size={16} color="var(--gray-400)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, brand, catatan evaluasi..."
            type="text"
          />
        </div>
      </div>

      {/* 4-Stage Kanban Pipeline Grid */}
      <div className="wb-grid-4" style={{ alignItems: 'start' }}>
        {/* STAGE 1: WANT */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'want')}
          className="wb-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', minHeight: '520px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="var(--gray-700)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>Want</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Est: {formatRupiah(wantTotal)}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--gray-200)' }}>{wantList.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wantList.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => navigate('/wishboard/detail')}
                className="wb-card"
                style={{ padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.category}</span>
                  <span className={item.score >= 80 ? 'wb-tag-urgent' : item.score >= 60 ? 'wb-tag-high' : 'wb-tag-want'}>
                    Score {item.score}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '2px' }}>{formatRupiah(item.price)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Brand: {item.brand}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--gray-50)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                    <span>Budget Dialokasi</span>
                    <span>{item.readiness}% ({formatRupiah(item.saved)})</span>
                  </div>
                  <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: `${item.readiness}%` }}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STAGE 2: SAVING */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'saving')}
          className="wb-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', minHeight: '520px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="var(--primary-600)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>Saving</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>{formatRupiah(savingSavedTotal)} / {formatRupiah(savingTotal)}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--gray-200)' }}>{savingList.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savingList.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => navigate('/wishboard/detail')}
                className="wb-card"
                style={{ padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '3px solid var(--primary-600)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.category}</span>
                  <span className={item.score >= 80 ? 'wb-tag-urgent' : 'wb-tag-saving'}>
                    Score {item.score}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '2px' }}>{formatRupiah(item.price)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Brand: {item.brand}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--gray-50)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                    <span>Terkumpul: {formatRupiah(item.saved)}</span>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>{item.readiness}%</span>
                  </div>
                  <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: `${item.readiness}%` }}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STAGE 3: READY TO BUY */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'ready')}
          className="wb-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', minHeight: '520px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--success-600)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--success-700)' }}>Ready to Buy</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600 }}>Siap: {formatRupiah(readyTotal)}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--success-600)', color: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{readyList.length} SIAP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readyList.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => navigate('/wishboard/detail')}
                className="wb-card"
                style={{ padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid var(--success-500)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 700 }}>Priority Ready · {item.brand}</span>
                  <span className="wb-tag-ready">Score {item.score}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success-600)', marginTop: '2px' }}>{formatRupiah(item.price)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600 }}>Budget 100% Terpenuhi</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); updateItemStatus(item.id, 'purchased'); }}
                  className="wb-btn-accent"
                  style={{ width: '100%', justifyContent: 'center', padding: '7px 12px', fontSize: '0.8rem' }}
                >
                  <ShoppingBag size={15} />
                  <span>Eksekusi Beli Sekarang</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* STAGE 4: PURCHASED */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'purchased')}
          className="wb-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', minHeight: '520px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--gray-600)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>Purchased</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Realisasi: {formatRupiah(purchasedTotal)}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--gray-200)' }}>{purchasedList.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {purchasedList.map((item) => (
              <div key={item.id} className="wb-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.category}</span>
                  <span className="wb-tag-ready">Sudah Dibeli</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '2px' }}>{formatRupiah(item.price)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.boughtDate || 'Terverifikasi'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible Skipped Decisions */}
      {showSkipped && (
        <div className="wb-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div onClick={() => setIsSkippedExpanded(!isSkippedExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>⏭ Skipped &amp; Canceled Decisions</h3>
                  <span className="wb-tag-urgent">{skippedItems.length} Item Dibatalkan</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Keputusan yang berhasil dieliminasi oleh decision matrix, menghemat modal total ~Rp 3.899.000.</p>
              </div>
            </div>
            <button className="wb-btn-secondary" style={{ padding: '6px' }}>
              {isSkippedExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {isSkippedExpanded && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }} className="md:grid-cols-2">
              {skippedItems.map((s) => (
                <div key={s.id} className="wb-card" style={{ padding: '14px', backgroundColor: 'var(--gray-50)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{s.category}</span>
                    <span className="wb-tag-urgent">Gagal Filter Impulsif</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)' }}>{s.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{formatRupiah(s.originalPrice)}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--gray-600)', backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                    <strong style={{ color: 'var(--danger-600)' }}>Alasan:</strong> {s.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
