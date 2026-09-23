import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Store, Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';

const TokoPage = () => {
  const { toggleSidebar } = useOutletContext();
  const { success, error } = useToast();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('fisik');
  const [storeAddress, setStoreAddress] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores');
      if (res.success) setStores(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStore(null);
    setStoreName('');
    setStoreType('fisik');
    setStoreAddress('');
    setShowModal(true);
  };

  const handleOpenEdit = (store) => {
    setEditingStore(store);
    setStoreName(store.name);
    setStoreType(store.store_type || 'fisik');
    setStoreAddress(store.address || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    try {
      const payload = {
        name: storeName.trim(),
        store_type: storeType,
        address: storeAddress.trim() || null
      };

      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, payload);
        success('Toko berhasil diperbarui');
      } else {
        await api.post('/stores', payload);
        success('Toko baru berhasil ditambahkan');
      }
      setShowModal(false);
      fetchStores();
    } catch (err) {
      error(err.message || 'Gagal menyimpan toko');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus toko ini?')) {
      try {
        await api.delete(`/stores/${id}`);
        success('Toko berhasil dihapus');
        fetchStores();
      } catch (err) {
        error(err.message || 'Gagal menghapus toko');
      }
    }
  };

  return (
    <div>
      <Header
        title="Daftar Toko"
        subtitle="Kelola toko tempat Anda berbelanja"
        onToggleSidebar={toggleSidebar}
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Tambah Toko</span>
          </button>
        }
      />

      <div className="page-container">
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Toko</th>
                <th>Jenis</th>
                <th>Alamat & Kota</th>
                <th>Transaksi</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-6">Memuat toko...</td></tr>
              ) : stores.length > 0 ? (
                stores.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <div className="flex-align">
                        <Store size={16} color="#3B82F6" />
                        <strong className="text-gray-800">{store.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="store-type-badge">{store.store_type || 'fisik'}</span>
                    </td>
                    <td>
                      <div className="flex-align text-gray-600 text-sm">
                        <MapPin size={14} color="#94A3B8" />
                        <span>{store.address ? `${store.address}, ` : ''}{store.city || 'Surabaya'}</span>
                      </div>
                    </td>
                    <td>{store.purchase_count || 0} Pembelian</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleOpenEdit(store)}
                          className="action-btn"
                          title="Edit"
                        >
                          <Edit2 size={16} color="#3B82F6" />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
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
                <tr><td colSpan="5" className="text-center py-6">Belum ada toko terdaftar</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingStore ? 'Edit Toko' : 'Tambah Toko Baru'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Toko</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Indomaret / Toko Komputer ABC"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jenis Toko</label>
                  <select
                    className="form-select"
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                  >
                    <option value="fisik">Toko Fisik</option>
                    <option value="online">Online</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Toko (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Jl. Ahmad Yani No. 123"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
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

export default TokoPage;
