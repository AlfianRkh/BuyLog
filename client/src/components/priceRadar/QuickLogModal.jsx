import React, { useState } from 'react';
import { PlusCircle, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function QuickLogModal({ isOpen, onClose, onSuccess, initialProductId = '', initialPlatform = '' }) {
  const [watchlistId, setWatchlistId] = useState(initialProductId);
  const [platform, setPlatform] = useState(initialPlatform || 'Tokopedia Official');
  const [price, setPrice] = useState('2.890.000');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialPlatform) setPlatform(initialPlatform);
      if (initialProductId) setWatchlistId(initialProductId);
    }
  }, [isOpen, initialPlatform, initialProductId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanPrice = parseFloat(price.replace(/[^0-9]/g, ''));
      await api.priceRadar.recordLog({
        watchlist_id: watchlistId || null,
        platform_name: platform,
        price: cleanPrice,
        notes: note
      });
      if (onSuccess) onSuccess(`Log harga Rp ${price} (${platform}) berhasil dicatat ke radar!`);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan log harga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 text-slate-800">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-lg text-slate-900">Input Log Harga Manual</h4>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Platform Sumber</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {initialPlatform && !['Tokopedia Official', 'Shopee Mall', 'Blibli Official', 'Indomaret / Alfamart Point', 'Toko Fisik / Offline'].includes(initialPlatform) && (
                <option value={initialPlatform}>{initialPlatform}</option>
              )}
              <option value="Tokopedia Official">Tokopedia Official</option>
              <option value="Shopee Mall">Shopee Mall</option>
              <option value="Blibli Official">Blibli Official</option>
              <option value="Indomaret / Alfamart Point">Indomaret / Alfamart Point</option>
              <option value="Toko Fisik / Offline">Toko Fisik / Offline</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Harga Terlihat (IDR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-semibold text-slate-400 text-sm">Rp</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 font-medium text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                placeholder="2.890.000"
                type="text"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Catatan Promo / Kupon</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="Misal: Flash Sale 10.10 + kupon cashback"
              type="text"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan ke Radar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
