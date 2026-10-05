import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ListFilter, 
  Grid, 
  Table as TableIcon, 
  PlusCircle, 
  Search, 
  Download, 
  CheckCircle2, 
  X,
  Eye,
  Wallet
} from 'lucide-react';
import { useWishBoard } from '../../contexts/WishBoardContext';
import AddWishItemModal from './AddWishItemModal';
import './WishBoardPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function WishBoardListPage() {
  const navigate = useNavigate();
  const { items, updateItemStatus } = useWishBoard();
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeItems = items.filter(i => i.status !== 'skipped');

  const filteredItems = activeItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesQuery = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredItems.map(i => i.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(i => i !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleBatchStatusChange = (newStatus) => {
    selectedRows.forEach(id => updateItemStatus(id, newStatus));
    setSelectedRows([]);
  };

  const handleExportSelected = () => {
    const selectedItems = activeItems.filter(i => selectedRows.includes(i.id));
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nama,Kategori,Harga,Terkumpul,Status,PriorityScore\n"
      + selectedItems.map(i => `"${i.name}","${i.category}",${i.price},${i.saved},"${i.status}",${i.score}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_wishboard_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSavedAll = activeItems.reduce((a, c) => a + (c.saved || 0), 0);

  return (
    <div className="wb-container">
      <AddWishItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Header Section */}
      <div className="wb-header">
        <div className="wb-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="wb-badge-live">
              <ListFilter size={13} />
              <span>Daftar Wishlist · {activeItems.length} Item · Terkumpul {formatRupiah(totalSavedAll)}</span>
            </span>
          </div>
          <h1 className="wb-page-title">
            <ListFilter size={28} color="var(--primary-600)" />
            <span>Daftar Wishlist &amp; Analisis Komparatif</span>
          </h1>
          <p className="wb-page-subtitle">
            Eksplorasi efisien katalog keinginan, pengurutan multi-kriteria, filter dimensi ganda, dan aksi massal terpadu.
          </p>
        </div>

        <div className="wb-actions-group">
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <button
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <TableIcon size={15} />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Grid size={15} />
              <span>Grid</span>
            </button>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="wb-btn-primary">
            <PlusCircle size={18} />
            <span>Tambah Item</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="wb-filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all', label: `Semua Aktif (${activeItems.length})` },
            { id: 'want', label: `🤔 Want (${activeItems.filter(i => i.status === 'want').length})` },
            { id: 'saving', label: `💰 Saving (${activeItems.filter(i => i.status === 'saving').length})` },
            { id: 'ready', label: `🎯 Ready (${activeItems.filter(i => i.status === 'ready').length})` }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={statusFilter === st.id ? 'wb-btn-primary' : 'wb-btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="wb-search-input">
          <Search size={16} color="var(--gray-400)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama item, brand..."
            type="text"
          />
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'table' ? (
        <div className="wb-table-wrapper">
          <table className="wb-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    checked={selectedRows.length === filteredItems.length && filteredItems.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                  />
                </th>
                <th>Item &amp; Brand</th>
                <th>Kategori</th>
                <th>Estimasi Harga</th>
                <th>Priority Score</th>
                <th>Decision Score</th>
                <th style={{ minWidth: '150px' }}>Budget Readiness</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                      style={{ cursor: 'pointer' }}
                      type="checkbox"
                    />
                  </td>
                  <td>
                    <Link to="/wishboard/detail" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={item.img} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gray-200)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Brand: {item.brand}</span>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                    {formatRupiah(item.price)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800 }}>{item.score}</span>
                    <span className={item.score >= 80 ? 'wb-tag-urgent' : 'wb-tag-high'} style={{ marginLeft: '6px' }}>{item.scoreBadge}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>{item.decisionRatio}%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>{item.pros ? item.pros.length : 0} Pros / {item.cons ? item.cons.length : 0} Cons</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-600)' }}>{item.readiness}% ({formatRupiah(item.saved)})</span>
                      <div className="wb-progress-bar"><div className="wb-progress-fill" style={{ width: `${item.readiness}%` }}></div></div>
                    </div>
                  </td>
                  <td>
                    <span className={item.status === 'ready' ? 'wb-tag-ready' : item.status === 'saving' ? 'wb-tag-saving' : 'wb-tag-want'}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to="/wishboard/detail" className="wb-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="wb-grid-3">
          {filteredItems.map(item => (
            <div key={item.id} className="wb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className={item.status === 'ready' ? 'wb-tag-ready' : 'wb-tag-saving'} style={{ position: 'absolute', top: '8px', left: '8px' }}>
                    {item.status.toUpperCase()}
                  </span>
                  <span className="wb-tag-urgent" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    {item.score} pt
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>{item.name}</h3>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-600)' }}>{formatRupiah(item.price)} ({item.readiness}% Saved)</span>
              </div>
              <Link to="/wishboard/detail" className="wb-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Buka Detail
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Floating Batch Bar */}
      {selectedRows.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: '24px',
          zIndex: 100,
          alignSelf: 'center',
          width: '100%',
          maxWidth: '700px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--gray-900)',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyConstraint: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--primary-600)', color: '#ffffff', fontWeight: 800, width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              {selectedRows.length}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Item Terpilih untuk Operasi Massal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <button onClick={() => handleBatchStatusChange('ready')} className="wb-btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Tandai Ready
            </button>
            <button onClick={handleExportSelected} className="wb-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--gray-800)', color: '#ffffff', borderColor: 'var(--gray-700)' }}>
              Ekspor CSV
            </button>
            <button onClick={() => setSelectedRows([])} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
