import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Target,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  Edit,
  Share2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Activity,
  BarChart2,
  Sparkles,
  Store,
  Clock,
  Send
} from 'lucide-react';
import api from '../../services/api';
import QuickLogModal from '../../components/priceRadar/QuickLogModal';
import './PriceRadarPages.css';

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

export default function PriceRadarProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3 BLN');
  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getProductDetail(slug || 'logitech-g-pro-x-2');
      setProduct(res.product || res);
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const handleShareWA = () => {
    const titleStr = product?.title || 'Logitech G Pro X 2 Lightspeed';
    const priceStr = formatRupiah(product?.current_price || 2890000);
    const targetStr = formatRupiah(product?.target_price || 3000000);
    const dealText = `🎯 PriceRadar Alert! ${titleStr}\n🔥 ALL-TIME LOW: ${priceStr} (Target ${targetStr})\n📍 Toko: ${product?.store_name || 'Tokopedia Official'}\n⭐ Deal Score: ${product?.deal_score || '9.6'}/10\n🔗 Pantau di PriceRadar`;
    
    navigator.clipboard.writeText(dealText).then(() => {
      showToast("Kartu info deal berhasil disalin ke clipboard! 🚀");
    }).catch(() => {
      showToast("Berhasil disiapkan!");
    });
  };

  const handleDelete = async () => {
    if (confirm("Hapus produk dari radar?")) {
      try {
        if (product?.id) {
          await api.priceRadar.deleteWatchlist(product.id);
        }
        showToast("Produk dihapus dari watchlist.");
        navigate('/priceradar/watchlist');
      } catch (err) {
        showToast("Gagal menghapus produk.");
      }
    }
  };

  const title = product?.title || 'Logitech G Pro X 2 Lightspeed Wireless';
  const currentPrice = product?.current_price || 2890000;
  const targetPrice = product?.target_price || 3000000;
  const dealScore = product?.deal_score || 9.6;
  const logs = product?.logs || [];
  const comparison = product?.platformComparison || [
    { platform: 'Tokopedia Official', price: 2890000, delta: 'BEST DEAL', status: 'Segar', isBest: true, url: 'https://tokopedia.com' },
    { platform: 'Shopee Mall', price: 3050000, delta: '+Rp 160.000', status: 'Aktif', isBest: false, url: 'https://shopee.co.id' },
    { platform: 'Blibli Official', price: 3120000, delta: '+Rp 230.000', status: 'Aktif', isBest: false, url: 'https://blibli.com' },
    { platform: 'GS Shop Mangga Dua', price: 3350000, delta: '+Rp 460.000', status: 'Perlu Cek', isBest: false, url: '#' }
  ];

  return (
    <div className="pr-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navigation & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link to="/priceradar/watchlist" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Watchlist</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">{product?.category || 'Elektronik'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold tracking-tight">{title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-bold text-xs text-blue-700 uppercase tracking-wider">Sedang Dipantau</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-xs text-emerald-700 uppercase tracking-wider">TARGET HIT (-3.7%)</span>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
            <span className="font-bold text-xs text-rose-700 uppercase tracking-wider">PRIORITY: HIGH</span>
          </div>
        </div>
      </div>

      {/* Product Overview Card */}
      <div className="pr-card">
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center p-2">
              <img className="w-full h-full object-contain rounded-xl" src={product?.image_url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80"} alt="Product Thumbnail"/>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-xs uppercase border border-slate-200">{product?.brand || 'Logitech G'}</span>
                <span className="text-xs text-slate-400 font-medium">SKU: LOG-GPX2-BLK</span>
                <span className="text-xs text-blue-600 font-semibold">Graphene 50mm Driver</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate max-w-2xl">
                {title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Wireless Gaming Headset with Bluetooth, 3.5mm, and DTS Headphone:X 2.0 Surround Sound.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setQuickLogModalOpen(true)}
              className="pr-btn-primary"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Harga</span>
            </button>
            <button
              onClick={() => showToast("Mode edit target dibuka!")}
              className="pr-btn-secondary"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Target</span>
            </button>
            <button
              onClick={() => showToast("Ditandai sudah dibeli!")}
              className="pr-btn-secondary"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tandai Beli</span>
            </button>
            <button
              onClick={handleShareWA}
              className="pr-btn-secondary"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Pemantauan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patokan Harga Target</span>
              <span className="text-lg text-slate-900 font-extrabold">{formatRupiah(targetPrice)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-white flex items-center gap-3 border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Status Ambang Batas:</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                TERCAPAI! {formatRupiah(currentPrice)}
              </span>
              <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">-110.000</span>
            </div>
            <a
              className="pr-btn-primary bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
              href="https://tokopedia.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Sikat Tokopedia</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* KPI Metric Array */}
      <div className="pr-kpi-grid">
        <div className="pr-kpi-card border-emerald-200 bg-emerald-50/20">
          <div className="pr-kpi-header">
            <span className="pr-kpi-label text-emerald-700">Radar Deal Index</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ATL RECORD</span>
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-emerald-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                <path className="text-emerald-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="96, 100" strokeLinecap="round" strokeWidth="3.5"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-emerald-700">
                {dealScore}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-slate-900">Strong Buy Signal</span>
              <span className="text-xs text-emerald-600 font-semibold">Skor {dealScore} / 10.0</span>
            </div>
          </div>
          <div className="pr-kpi-footer border-emerald-100 text-slate-600">
            <span>🔥 <strong className="text-emerald-700">ALL-TIME LOW</strong> sejak pantauan awal</span>
          </div>
        </div>

        <div className="pr-kpi-card">
          <div className="pr-kpi-header">
            <span className="pr-kpi-label">Harga Terendah (ATL)</span>
            <div className="pr-kpi-icon-box bg-emerald-50 text-emerald-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1">
            <div className="pr-kpi-value text-emerald-600">Rp 2.890.000</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Tokopedia Official</span> · 3 Okt 2026
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Diskon vs Rilis:</span>
            <span className="text-emerald-600 font-bold">-17.4% (-Rp 609k)</span>
          </div>
        </div>

        <div className="pr-kpi-card">
          <div className="pr-kpi-header">
            <span className="pr-kpi-label">Harga Tertinggi (ATH)</span>
            <div className="pr-kpi-icon-box bg-rose-50 text-rose-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1">
            <div className="pr-kpi-value text-slate-900">Rp 3.499.000</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Shopee Mall</span> · 1 Agu 2026
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Selisih vs Terendah:</span>
            <span className="text-rose-600 font-bold">+Rp 609.000</span>
          </div>
        </div>

        <div className="pr-kpi-card">
          <div className="pr-kpi-header">
            <span className="pr-kpi-label">Rata-Rata Historis</span>
            <div className="pr-kpi-icon-box">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="my-1">
            <div className="pr-kpi-value text-blue-600">Rp 3.125.000</div>
            <div className="text-xs text-slate-500 mt-1">
              Dihitung dari {logs.length || 12} log harga
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Posisi Saat Ini:</span>
            <span className="text-emerald-600 font-bold">7.5% di Bawah Rata²</span>
          </div>
        </div>
      </div>

      {/* Price Intelligence Chart Card */}
      <div className="pr-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-900">Tren Multi-Platform & Proyeksi Delta</h2>
            </div>
            <span className="text-xs text-slate-500">Analisis komparasi Tokopedia, Shopee, Blibli & Toko Retail Offline</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["1 BLN", "3 BLN", "6 BLN", "1 THN", "SEMUA"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  timeRange === range ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full bg-slate-50 rounded-2xl p-4 overflow-hidden border border-slate-200">
          <div className="pl-4 pr-4 pt-2 pb-4 w-full">
            <svg className="w-full h-64 sm:h-72 overflow-visible" preserveAspectRatio="none" viewBox="0 0 900 320">
              <defs>
                <linearGradient id="tokopediaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="80" y2="80"></line>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="160" y2="160"></line>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="240" y2="240"></line>

              {/* Target Line */}
              <line stroke="#2563EB" strokeDasharray="6 4" strokeWidth="1.5" x1="0" x2="900" y1="180" y2="180"></line>
              
              {/* Retail Offline */}
              <polyline fill="none" points="0,60 120,60 250,75 400,75 550,85 700,90 900,90" stroke="#94A3B8" strokeWidth="2"></polyline>
              {/* Blibli */}
              <polyline fill="none" points="0,110 150,110 280,130 420,130 580,145 720,150 900,145" stroke="#0284C7" strokeWidth="2.5"></polyline>
              {/* Shopee */}
              <polyline fill="none" points="0,30 140,55 290,95 430,120 600,135 740,165 900,165" stroke="#F43F5E" strokeWidth="2.5"></polyline>
              {/* Tokopedia */}
              <polygon fill="url(#tokopediaGrad)" points="0,75 140,75 280,110 420,125 560,165 720,205 900,240 900,320 0,320"></polygon>
              <polyline fill="none" points="0,75 140,75 280,110 420,125 560,165 720,205 900,240" stroke="#10B981" strokeWidth="3"></polyline>

              <circle cx="140" cy="75" fill="#FFFFFF" r="4" stroke="#10B981" strokeWidth="2"></circle>
              <circle cx="280" cy="110" fill="#FFFFFF" r="4" stroke="#10B981" strokeWidth="2"></circle>
              <circle cx="420" cy="125" fill="#FFFFFF" r="4" stroke="#10B981" strokeWidth="2"></circle>
              <circle cx="560" cy="165" fill="#FFFFFF" r="4" stroke="#10B981" strokeWidth="2"></circle>
              <circle cx="720" cy="205" fill="#FFFFFF" r="4" stroke="#10B981" strokeWidth="2"></circle>
              <circle cx="900" cy="240" fill="#10B981" r="5" stroke="#FFFFFF" strokeWidth="2"></circle>
            </svg>

            <div className="flex justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 font-medium">
              <span>1 Agu 2026</span>
              <span>15 Agu</span>
              <span>1 Sep 2026</span>
              <span>15 Sep</span>
              <span>25 Sep</span>
              <span className="text-emerald-600 font-bold">Hari ini (3 Okt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table & Audit Log Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 pr-card">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Perbandingan Harga Antar-Platform</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">4 Sumber Terpantau</span>
          </div>

          <div className="pr-table-wrapper">
            <table className="pr-table">
              <thead>
                <tr>
                  <th>Sumber Toko</th>
                  <th>Harga Terkini</th>
                  <th>Delta vs Rendah</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                          {item.platform.substring(0, 3).toUpperCase()}
                        </div>
                        <span>{item.platform}</span>
                      </div>
                    </td>
                    <td className="font-extrabold text-emerald-600">
                      {formatRupiah(item.price)}
                    </td>
                    <td>
                      {item.isBest ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">BEST DEAL</span>
                      ) : (
                        <span className="text-rose-600 font-semibold text-xs">{item.delta}</span>
                      )}
                    </td>
                    <td className="text-right">
                      <a
                        href={item.url || 'https://tokopedia.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                      >
                        <span>Kunjungi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail & Proof */}
        <div className="xl:col-span-5 pr-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Riwayat Log & Bukti</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Total {logs.length || 3} Log</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="text-xs text-emerald-800 font-bold">3 Okt 2026 · Tokopedia</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700">Rp 2.890.000</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Voucher diskon gajian 8% + cashback 100k GoPay Coins. Rekor termurah!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-xs text-slate-800 font-bold">28 Sep 2026 · Shopee</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Rp 3.050.000</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Flash sale promo midnight brand Logitech.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleShareWA}
              className="w-full pr-btn-secondary justify-center py-2.5"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Salin Kartu Info Deal untuk WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => setQuickLogModalOpen(false)}
        initialProductId={product?.id}
        onSuccess={(msg) => { showToast(msg); fetchDetail(); }}
      />
    </div>
  );
}
