import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';

const MerkPage = () => {
  const { toggleSidebar } = useOutletContext();
  const { success, error } = useToast();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      if (res.success) setBrands(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setBrandName('');
    setShowModal(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, { name: brandName.trim() });
        success('Merk berhasil diperbarui');
      } else {
        await api.post('/brands', { name: brandName.trim() });
        success('Merk baru berhasil ditambahkan');
      }
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      error(err.message || 'Gagal menyimpan merk');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus merk ini?')) {
      try {
        await api.delete(`/brands/${id}`);
        success('Merk berhasil dihapus');
        fetchBrands();
      } catch (err) {
        error(err.message || 'Gagal menghapus');
      }
    }
  };

  return (
    <div>
      <Header
        title="Daftar Merk"
        subtitle="Kelola semua merk barang yang Anda beli"
        onToggleSidebar={toggleSidebar}
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Tambah Merk</span>
          </button>
        }
      />

      <div className="page-container">
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Merk</th>
                <th>Jumlah Produk Terkait</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-6">Memuat merk...</td></tr>
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className="flex-align">
                        <Tag size={16} color="#F59E0B" />
                        <strong className="text-gray-800">{brand.name}</strong>
                      </div>
                    </td>
                    <td>{brand.product_count || 0} Produk</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleOpenEdit(brand)}
                          className="action-btn"
                          title="Edit"
                        >
                          <Edit2 size={16} color="#3B82F6" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="action-btn delete"
                          title="Hapus"
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-6">Belum ada merk terdaftar</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingBrand ? 'Edit Merk' : 'Tambah Merk Baru'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Merk</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Logitech / Philips"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerkPage;
