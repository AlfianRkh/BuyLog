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
  Trash2,
  ExternalLink,
  ShieldCheck,
  Activity,
  BarChart2,
  Store,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import QuickLogModal from '../../components/priceRadar/QuickLogModal';
import EditTargetModal from '../../components/priceRadar/EditTargetModal';
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
  const [editTargetModalOpen, setEditTargetModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.priceRadar.getProductDetail(slug);
      setProduct(res.product || res);
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchDetail();
    }
  }, [slug]);

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

  const title = product?.title || 'Memuat Data Produk...';
  const currentPrice = Number(product?.current_price || 0);
  const targetPrice = Number(product?.target_price || 0);
  const minPrice = Number(product?.min_price || currentPrice);
  const maxPrice = Number(product?.max_price || currentPrice);
  const dealScore = product?.deal_score || (targetPrice > 0 && currentPrice <= targetPrice ? 9.5 : 7.0);
  const logs = product?.logs || [];
  const storeName = product?.store_name || 'Toko Utama';
  const isHit = currentPrice <= targetPrice && targetPrice > 0;

  const avgPrice = logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + Number(l.price || 0), 0) / logs.length)
    : Math.round((minPrice + maxPrice) / 2);

  const priceDiff = targetPrice - currentPrice;

  const comparison = logs.length > 0
    ? logs.map(l => ({
        platform: l.platform_name || storeName,
        price: Number(l.price),
        delta: Number(l.price) <= currentPrice ? 'BEST DEAL' : `+${formatRupiah(Number(l.price) - currentPrice)}`,
        isBest: Number(l.price) <= currentPrice,
        url: product?.url || '#'
      }))
    : [
        { platform: storeName, price: currentPrice, delta: 'BEST DEAL', isBest: true, url: product?.url || '#' }
      ];

  // Dynamic Chart Points Calculation
  const chartPoints = React.useMemo(() => {
    let rawPoints = [];
    if (logs && logs.length > 0) {
      const sorted = [...logs].sort((a, b) => 
        new Date(a.recorded_at || a.created_at || 0) - new Date(b.recorded_at || b.created_at || 0)
      );
      rawPoints = sorted.map(l => ({
        price: Number(l.price || 0),
        date: new Date(l.recorded_at || l.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        platform: l.platform_name || storeName
      }));
    }

    if (rawPoints.length === 0) {
      rawPoints = [
        { price: maxPrice || currentPrice, date: 'Awal Pemantauan', platform: storeName },
        { price: currentPrice, date: 'Terkini', platform: storeName }
      ];
    } else if (rawPoints.length === 1) {
      rawPoints = [
        { price: maxPrice || rawPoints[0].price, date: 'Awal Pemantauan', platform: storeName },
        ...rawPoints
      ];
    }

    const prices = rawPoints.map(p => p.price);
    if (targetPrice > 0) prices.push(targetPrice);

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = (maxP - minP) || maxP || 1;
    const padding = range * 0.15;
    const minY = Math.max(0, minP - padding);
    const maxY = maxP + padding;

    const points = rawPoints.map((pt, idx) => {
      const x = rawPoints.length === 1 ? 450 : Math.round(40 + (idx / (rawPoints.length - 1)) * 820);
      const normalizedRatio = (pt.price - minY) / (maxY - minY || 1);
      const y = Math.round(270 - normalizedRatio * 220);
      return { ...pt, x, y };
    });

    const targetY = targetPrice > 0 
      ? Math.round(270 - ((targetPrice - minY) / (maxY - minY || 1)) * 220)
      : null;

    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
    const polygonStr = `${points[0].x},280 ` + polylineStr + ` ${points[points.length - 1].x},280`;

    return { points, polylineStr, polygonStr, targetY };
  }, [logs, currentPrice, targetPrice, maxPrice, storeName]);

  if (loading && !product) {
    return (
      <div className="pr-container py-12 text-center text-slate-500 font-semibold">
        Memuat detail intelijen produk...
      </div>
    );
  }

  return (
    <div className="pr-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-sm font-semibold">
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
          <span className="text-slate-500 font-medium">{product?.category || 'Umum'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold tracking-tight">{title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-bold text-xs text-blue-700 uppercase tracking-wider">
              {product?.status === 'watching' ? 'Sedang Dipantau' : product?.status === 'hit' ? 'Target Hit' : 'Aktif'}
            </span>
          </div>
          {isHit ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-xs text-emerald-700 uppercase tracking-wider">
                TARGET HIT ({formatRupiah(Math.abs(priceDiff))})
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-xs text-amber-700 uppercase tracking-wider">
                MEMANTAU TARGET
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Overview Card */}
      <div className="pr-card">
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center p-2">
              <img
                className="w-full h-full object-contain rounded-xl"
                src={product?.image_url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80"}
                alt={title}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-xs uppercase border border-slate-200">
                  {product?.brand || 'Umum'}
                </span>
                {product?.edition && (
                  <span className="text-xs text-blue-600 font-semibold">{product.edition}</span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate max-w-2xl">
                {title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {product?.notes || 'Tidak ada deskripsi tambahan.'}
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
              onClick={() => setEditTargetModalOpen(true)}
              className="pr-btn-secondary"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Target</span>
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
                {isHit ? `TERCAPAI! ${formatRupiah(currentPrice)}` : `BELUM TARGET (${formatRupiah(currentPrice)})`}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold text-white ${isHit ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                {isHit ? `Hemat ${formatRupiah(Math.abs(priceDiff))}` : `+${formatRupiah(Math.abs(priceDiff))}`}
              </span>
            </div>
            {product?.url && (
              <a
                className="pr-btn-primary bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Buka {storeName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Array */}
      <div className="pr-kpi-grid">
        <div className="pr-kpi-card border-emerald-200 bg-emerald-50/20">
          <div className="pr-kpi-header">
            <span className="pr-kpi-label text-emerald-700">Radar Deal Index</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {product?.is_atl ? 'ALL-TIME LOW' : 'STATUS DEAL'}
            </span>
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-emerald-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                <path className="text-emerald-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${(dealScore / 10) * 100}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-emerald-700">
                {dealScore}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-slate-900">{dealScore >= 8.0 ? 'Strong Buy Signal' : 'Monitoring Signal'}</span>
              <span className="text-xs text-emerald-600 font-semibold">Skor {dealScore} / 10.0</span>
            </div>
          </div>
          <div className="pr-kpi-footer border-emerald-100 text-slate-600">
            <span>🔥 {isHit ? 'Penawaran Sangat Bagus' : 'Menunggu Penurunan Harga'}</span>
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
            <div className="pr-kpi-value text-emerald-600">{formatRupiah(minPrice)}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{storeName}</span>
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Selisih vs Target:</span>
            <span className="text-emerald-600 font-bold">{formatRupiah(targetPrice - minPrice)}</span>
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
            <div className="pr-kpi-value text-slate-900">{formatRupiah(maxPrice)}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{storeName}</span>
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Selisih vs Terendah:</span>
            <span className="text-rose-600 font-bold">+{formatRupiah(maxPrice - minPrice)}</span>
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
            <div className="pr-kpi-value text-blue-600">{formatRupiah(avgPrice)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Dihitung dari {logs.length} log harga
            </div>
          </div>
          <div className="pr-kpi-footer">
            <span>Posisi Saat Ini:</span>
            <span className="text-emerald-600 font-bold">
              {currentPrice <= avgPrice
                ? `${formatRupiah(avgPrice - currentPrice)} di Bawah Rata²`
                : `${formatRupiah(currentPrice - avgPrice)} di Atas Rata²`}
            </span>
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
            <span className="text-xs text-slate-500">Analisis komparasi pergerakan harga produk</span>
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
                <linearGradient id="priceGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="80" y2="80"></line>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="160" y2="160"></line>
              <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="900" y1="240" y2="240"></line>

              {/* Target Line */}
              {chartPoints.targetY !== null && chartPoints.targetY >= 20 && chartPoints.targetY <= 300 && (
                <g>
                  <line stroke="#2563EB" strokeDasharray="6 4" strokeWidth="1.5" x1="0" x2="900" y1={chartPoints.targetY} y2={chartPoints.targetY}></line>
                  <text x="12" y={chartPoints.targetY - 6} fill="#2563EB" fontSize="11" fontWeight="bold">
                    Target: {formatRupiah(targetPrice)}
                  </text>
                </g>
              )}

              {/* Price Line & Fill */}
              <polygon fill="url(#priceGrad)" points={chartPoints.polygonStr}></polygon>
              <polyline fill="none" points={chartPoints.polylineStr} stroke="#10B981" strokeWidth="3"></polyline>

              {/* Data Points */}
              {chartPoints.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === chartPoints.points.length - 1 ? "6" : "4"}
                    fill={idx === chartPoints.points.length - 1 ? "#10B981" : "#FFFFFF"}
                    stroke={idx === chartPoints.points.length - 1 ? "#FFFFFF" : "#10B981"}
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {formatRupiah(pt.price)}
                  </text>
                </g>
              ))}
            </svg>

            {/* X-Axis Dates */}
            <div className="flex justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 font-medium">
              {chartPoints.points.map((pt, idx) => (
                <span key={idx} className={idx === chartPoints.points.length - 1 ? "text-emerald-600 font-bold" : ""}>
                  {pt.date}
                </span>
              ))}
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
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {comparison.length} Sumber Terpantau
            </span>
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
                      {item.url && item.url !== '#' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                        >
                          <span>Kunjungi</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Internal Log</span>
                      )}
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
              <span className="text-xs text-slate-500 font-medium">Total {logs.length} Log</span>
            </div>

            <div className="flex flex-col gap-3">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada riwayat log harga tercatat. Klik tombol <strong>Log Harga</strong> untuk menambahkan catatan harga terkini.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id || idx} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="text-xs text-emerald-800 font-bold">
                          {new Date(log.recorded_at || log.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · {log.platform_name || storeName}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700">{formatRupiah(log.price)}</span>
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-600 mt-1">{log.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => setQuickLogModalOpen(false)}
        initialProductId={product?.id}
        onSuccess={(msg) => { showToast(msg); fetchDetail(); }}
      />

      <EditTargetModal
        isOpen={editTargetModalOpen}
        onClose={() => setEditTargetModalOpen(false)}
        product={product}
        onSuccess={(msg) => { showToast(msg); fetchDetail(); }}
      />
    </div>
  );
}
