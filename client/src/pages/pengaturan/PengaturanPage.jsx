import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { User, Lock, Layers, Save, Plus, Trash2 } from 'lucide-react';
import './PengaturanPage.css';

const PengaturanPage = () => {
  const { toggleSidebar } = useOutletContext();
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Categories Form
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name });
      success('Profil berhasil diperbarui');
    } catch (err) {
      error(err.message || 'Gagal menyimpan profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Konfirmasi password tidak cocok');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      success('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.message || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await api.post('/categories', {
        name: newCatName.trim(),
        color: newCatColor
      });
      success('Kategori baru berhasil ditambahkan');
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      error(err.message || 'Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      try {
        await api.delete(`/categories/${id}`);
        success('Kategori berhasil dihapus');
        fetchCategories();
      } catch (err) {
        error(err.message || 'Gagal menghapus kategori');
      }
    }
  };

  return (
    <div>
      <Header
        title="Pengaturan"
        subtitle="Kelola profil akun dan preferensi aplikasi"
        onToggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        <div className="settings-layout">
          {/* Settings Tabs */}
          <div className="card settings-nav-card">
            <button
              className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profil Pengguna</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={18} />
              <span>Keamanan & Password</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <Layers size={18} />
              <span>Kategori Barang</span>
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="settings-content-area">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Informasi Profil</h2>
                </div>
                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      disabled
                      style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                      <Save size={16} />
                      <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Ubah Password</h2>
                </div>
                <form onSubmit={handleSavePassword} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Password Saat Ini</label>
                    <input
                      type="password"
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Baru</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                      <Lock size={16} />
                      <span>{savingPassword ? 'Mengubah...' : 'Ubah Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Kelola Kategori</h2>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="add-category-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama Kategori Baru..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                  />
                  <input
                    type="color"
                    className="color-picker-input"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    title="Pilih Warna"
                  />
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} />
                    <span>Tambah</span>
                  </button>
                </form>

                {/* Categories List */}
                <div className="categories-manage-list mt-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="category-manage-item">
                      <div className="cat-manage-left">
                        <span
                          className="cat-color-dot"
                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                        />
                        <span className="cat-manage-name">{cat.name}</span>
                        <span className="cat-product-count">({cat.product_count || 0} barang)</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="action-btn delete"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengaturanPage;
