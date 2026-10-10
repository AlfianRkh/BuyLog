import React, { useState } from 'react';
import { Store, X, Info } from 'lucide-react';
import api from '../../services/api';

export default function AddPlatformModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('marketplace');
  const [accentColor, setAccentColor] = useState('cyan');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType((initialData.type || 'marketplace').toLowerCase());
      setUrl(initialData.url || '');
      setNotes(initialData.notes || '');
      setAccentColor(initialData.accent_color || 'cyan');
    } else {
      setName('');
      setType('marketplace');
      setUrl('');
      setNotes('');
      setAccentColor('cyan');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData && initialData.id) {
        await api.priceRadar.updateSource(initialData.id, {
          name,
          type: type.toUpperCase(),
          accent_color: accentColor,
          url,
          notes
        });
        if (onSuccess) onSuccess('Platform berhasil diperbarui!');
      } else {
        await api.priceRadar.createSource({
          name,
          type: type.toUpperCase(),
          accent_color: accentColor,
          url,
          notes
        });
        if (onSuccess) onSuccess('Platform baru berhasil ditambahkan ke direktori PriceRadar!');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan platform.');
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
            <h2 className="font-bold text-lg text-slate-900">
              {initialData ? 'Edit Sumber Harga' : 'Daftarkan Sumber Harga Baru'}
            </h2>
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
            <div className="flex flex-col gap-1 relative">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Aksen Tag</label>
                <div className="group relative cursor-pointer flex items-center">
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col gap-1.5 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none border border-slate-700">
                    <p className="font-bold text-blue-400">💡 Penjelasan Aksen Tag:</p>
                    <p><strong className="text-blue-300">🔵 Blue (Tech Modern):</strong> Untuk toko resmi elektronik, gadget, atau official store.</p>
                    <p><strong className="text-emerald-300">🟢 Emerald (Winner):</strong> Untuk rujukan platform pemenang promo / harga termurah.</p>
                    <p><strong className="text-amber-300">🟠 Orange (Marketplace):</strong> Untuk platform e-commerce &amp; marketplace umum.</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <select
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="cyan">Blue (Tech Modern) - Gadget &amp; Official Store</option>
                <option value="emerald">Emerald (Winner) - Rujukan Promo Termurah</option>
                <option value="orange">Orange (Marketplace Hot) - E-Commerce / Marketplace</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {accentColor === 'cyan' && '🔵 Untuk toko resmi elektronik & gadget.'}
                {accentColor === 'emerald' && '🟢 Untuk platform rujukan promo termurah.'}
                {accentColor === 'orange' && '🟠 Untuk e-commerce / marketplace umum.'}
              </p>
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
