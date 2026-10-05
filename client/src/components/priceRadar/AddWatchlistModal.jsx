import React, { useState } from 'react';
import { Target, X } from 'lucide-react';
import api from '../../services/api';

export default function AddWatchlistModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanTarget = parseFloat(targetPrice.replace(/[^0-9]/g, ''));
      const cleanCurrent = parseFloat(currentPrice.replace(/[^0-9]/g, '')) || cleanTarget;

      await api.priceRadar.createWatchlist({
        title,
        brand,
        category,
        target_price: cleanTarget,
        current_price: cleanCurrent,
        url,
        store_name: 'Tokopedia'
      });

      if (onSuccess) onSuccess(`Target radar untuk "${title}" telah diaktifkan!`);
      setTitle('');
      setBrand('');
      setTargetPrice('');
      setCurrentPrice('');
      setUrl('');
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menambahkan produk ke watchlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-5 border border-slate-200 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-900">Kunci Target Baru</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">INPUT DATA TRACKING PRODUK</span>
            </div>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nama Produk & Spesifikasi</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white text-slate-900 font-semibold placeholder:text-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Sony WH-1000XM5 Black"
              type="text"
              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white text-slate-900 font-semibold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              >
                <option value="Elektronik" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Elektronik & Gadget</option>
                <option value="Groceries" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Groceries</option>
                <option value="Fashion & Sepatu" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Fashion & Sepatu</option>
                <option value="Rumah Tangga" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Rumah Tangga</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Brand / Merk</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white text-slate-900 font-semibold placeholder:text-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Sony, Apple, Nike"
                type="text"
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Target Beli (IDR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-semibold text-slate-500 text-sm">Rp</span>
                <input
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold placeholder:text-slate-400 text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4.500.000"
                  type="text"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Harga Saat Ini (Baseline)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-semibold text-slate-500 text-sm">Rp</span>
                <input
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold placeholder:text-slate-400 text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4.999.000"
                  type="text"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tautan Produk Marketplace (Opsional)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white text-slate-900 font-semibold placeholder:text-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://tokopedia.com/... atau https://shopee.co.id/..."
              type="url"
              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Target className="w-4 h-4" />
              <span>{loading ? 'Proses...' : 'Aktifkan Radar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
