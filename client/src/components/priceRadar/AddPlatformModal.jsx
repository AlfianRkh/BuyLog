import React, { useState } from 'react';
import { Store, X } from 'lucide-react';
import api from '../../services/api';

export default function AddPlatformModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('marketplace');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.priceRadar.createSource({
        name,
        type: type.toUpperCase(),
        url,
        notes
      });
      if (onSuccess) onSuccess('Platform baru berhasil ditambahkan ke direktori PriceRadar!');
      setName('');
      setUrl('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menambahkan platform.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-5 border border-slate-200 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-slate-900">Daftarkan Sumber Harga Baru</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Platform / Toko</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="Contoh: Eraspace / Gramedia / Mangga Dua Store"
              required
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kategori Sumber</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="marketplace">Marketplace Online</option>
                <option value="official_brand">Official Online Store</option>
                <option value="offline_retail">Toko Fisik / Offline</option>
                <option value="grocery">Grocery & FMCG</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Aksen Tag</label>
              <select className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                <option value="cyan">Blue (Tech Modern)</option>
                <option value="emerald">Emerald (Winner)</option>
                <option value="orange">Orange (Marketplace Hot)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Base Website URL (Opsional jika Fisik)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Operasional</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="Contoh: Survey langsung setiap Sabtu..."
              rows="2"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors" type="button">
              Batal
            </button>
            <button
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
              type="submit"
            >
              {loading ? 'Menyimpan...' : 'Simpan Platform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
