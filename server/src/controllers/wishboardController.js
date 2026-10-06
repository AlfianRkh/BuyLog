// In-Memory / Backend DB Store for WishBoard
let wishboardWeights = {
  urgency: 35,
  want: 30,
  budget: 35
};

let wishboardItems = [
  {
    id: 'wb-1',
    name: 'Logitech MX Keys S',
    brand: 'Logitech',
    tag: 'Top Pick',
    category: 'Elektronik & Kerja',
    categorySlug: 'elektronik',
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    estimatedMin: 1400000,
    estimatedMax: 1600000,
    price: 1500000,
    saved: 1275000,
    urgency: 5,
    want: 5,
    status: 'saving', // 'want' | 'saving' | 'ready' | 'purchased' | 'skipped'
    deadline: '2026-10-20',
    daysLeft: '14 hari lagi',
    sku: 'LOGI-MXK-S-BLK',
    guarantee: '1 TAHUN',
    pros: [
      'Keyboard scissor-switch paling nyaman dan ergonomis untuk mengetik ribuan baris kode harian.',
      'Mendukung seamless switching 3 perangkat antara MacBook M4 kerja dan Windows PC personal.',
      'Smart backlighting otomatis menyala saat tangan mendekat + sensor ambient light hemat daya.',
      'Daya tahan baterai hingga 5 bulan dan rechargeable via USB-C cepat.'
    ],
    cons: [
      'Harga cukup premium (Rp 1.5jt) dibanding keyboard mechanical entry-level lokal.'
    ],
    savingsHistory: [
      { id: 'sh-1', date: '2026-09-15', amount: 500000, note: 'Alokasi awal' },
      { id: 'sh-2', date: '2026-09-25', amount: 500000, note: 'Gaji bulanan' },
      { id: 'sh-3', date: '2026-10-02', amount: 275000, note: 'Top up hemat' }
    ]
  },
  {
    id: 'wb-2',
    name: 'iPhone 16 128GB',
    brand: 'Apple',
    tag: 'Impulsive Guard',
    category: 'Elektronik & Gadget',
    categorySlug: 'elektronik',
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80',
    price: 15499000,
    saved: 15499000,
    urgency: 4,
    want: 5,
    status: 'ready',
    deadline: '2026-10-10',
    daysLeft: '4 hari lagi!',
    sku: 'APL-IPH16-128',
    pros: ['Kamera 48MP', 'Chip A18 super kencang', 'Action button', 'Kapasitas baterai meningkat'],
    cons: ['Layar masih 60Hz'],
    savingsHistory: [{ id: 'sh-ip1', date: '2026-09-01', amount: 15499000, note: 'Tabungan khusus gadget' }]
  },
  {
    id: 'wb-3',
    name: 'Samsung Galaxy Buds3 Pro',
    brand: 'Samsung',
    category: 'Audio & Komunikasi',
    categorySlug: 'elektronik',
    img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    price: 3200000,
    saved: 1920000,
    urgency: 4,
    want: 4,
    status: 'saving',
    deadline: '2026-10-30',
    daysLeft: '24 hari lagi',
    sku: 'SAM-BUDS3P',
    pros: ['ANC sangat kedap', '24-bit Hi-Fi Audio', 'Desain blade futuristic', 'Mikrofon jernih'],
    cons: ['Fitur terbaik khusus ekosistem Samsung', 'Harga melambung'],
    savingsHistory: [{ id: 'sh-gb1', date: '2026-09-20', amount: 1920000, note: 'Setoran tahap 1' }]
  },
  {
    id: 'wb-4',
    name: 'Monitor LG UltraFine 4K 27"',
    brand: 'LG',
    category: 'Elektronik & Setup',
    categorySlug: 'elektronik',
    img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    price: 5500000,
    saved: 5500000,
    urgency: 4,
    want: 4,
    status: 'ready',
    deadline: '2026-10-15',
    daysLeft: '9 hari lagi',
    sku: 'LG-27UL850',
    pros: ['Resolusi Crisp 4K IPS', 'USB-C Charging 60W', 'Warna DCI-P3 95%'],
    cons: ['Stand bawaan agak besar'],
    savingsHistory: [{ id: 'sh-lg1', date: '2026-09-10', amount: 5500000, note: 'Bonus Project' }]
  },
  {
    id: 'wb-5',
    name: 'Ergonomic Chair PEX V2',
    brand: 'PEX Furniture',
    category: 'Rumah Tangga & Setup',
    categorySlug: 'furnitur',
    img: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=500&auto=format&fit=crop&q=80',
    price: 2800000,
    saved: 1400000,
    urgency: 3,
    want: 4,
    status: 'saving',
    deadline: '2026-11-05',
    daysLeft: '30 hari lagi',
    sku: 'PEX-CHR-V2',
    pros: ['Lumbar support 3D adjustable', 'Bahan mesh dingin', 'Armrest 4D', 'Sandaran kepala stabil'],
    cons: ['Merakit butuh waktu 30 menit', 'Bobot lumayan berat'],
    savingsHistory: [{ id: 'sh-pex1', date: '2026-09-28', amount: 1400000, note: 'Setoran Alokasi Kursi' }]
  },
  {
    id: 'wb-6',
    name: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    price: 2100000,
    saved: 420000,
    urgency: 3,
    want: 5,
    status: 'want',
    deadline: '2026-10-28',
    daysLeft: '22 hari lagi',
    sku: 'NKE-AM90-INF',
    pros: ['Desain timeless klasik', 'Bantalan Air Unit empuk', 'Model versatile matching outfit'],
    cons: ['Outsole terasa sedikit kaku saat baru', 'Rentan kotor di bagian suede'],
    savingsHistory: []
  },
  {
    id: 'wb-7',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    category: 'Elektronik & Gadget',
    categorySlug: 'elektronik',
    img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    price: 1350000,
    saved: 1350000,
    urgency: 5,
    want: 5,
    status: 'purchased',
    deadline: '2026-09-28',
    boughtDate: '2026-09-28',
    pros: ['Quiet clicks', '8K DPI tracking', 'MagSpeed scroll wheel'],
    cons: ['Ukurannya sedikit besar untuk tangan kecil'],
    savingsHistory: []
  }
];

let skippedWishItems = [
  {
    id: 'sk-1',
    name: 'Hoodie Uniqlo Souffle Yarn',
    category: 'Fashion · Hoodie',
    originalPrice: 499000,
    reason: 'Audit lemari menunjukkan sudah ada 3 hoodie serupa dalam kondisi prima. Utility Score hanya 22/100.',
    status: 'skipped'
  },
  {
    id: 'sk-2',
    name: 'Smartwatch Gen 4 Active',
    category: 'Gadget · Smartwatch',
    originalPrice: 3400000,
    reason: 'Daya tahan baterai hanya 18 jam (ekspektasi minimal 48 jam). Watchlist cooling-off 30 hari berhasil meredam hype.',
    status: 'skipped'
  }
];

// Helper functions for scoring
const calculatePriorityScore = (item, w = wishboardWeights) => {
  const urgencyScore = ((item.urgency || 3) / 5) * 100;
  const wantScore = ((item.want || 4) / 5) * 100;
  const budgetRatio = Math.min(1, (item.price || 0) > 0 ? (item.saved || 0) / item.price : 0);
  const budgetScore = budgetRatio * 100;

  const weightedScore =
    (urgencyScore * (w.urgency / 100)) +
    (wantScore * (w.want / 100)) +
    (budgetScore * (w.budget / 100));

  return Math.round(weightedScore);
};

const calculateDecisionScore = (item) => {
  const prosCount = item.pros ? item.pros.length : 0;
  const consCount = item.cons ? item.cons.length : 0;
  const total = prosCount + consCount;
  if (total === 0) return 50;
  return Math.round((prosCount / total) * 100);
};

const enrichWishItem = (item) => {
  const score = calculatePriorityScore(item);
  const decisionRatio = calculateDecisionScore(item);
  const readiness = Math.min(100, Math.round((item.price || 0) > 0 ? ((item.saved || 0) / item.price) * 100 : 0));

  let scoreLevel = 'low';
  let scoreBadge = '🔵 Rendah';
  if (score >= 80) {
    scoreLevel = 'urgent';
    scoreBadge = '🔴 Urgent';
  } else if (score >= 60) {
    scoreLevel = 'high';
    scoreBadge = '🟠 High';
  } else if (score >= 40) {
    scoreLevel = 'medium';
    scoreBadge = '🟡 Menengah';
  }

  return {
    ...item,
    score,
    decisionRatio,
    readiness,
    scoreLevel,
    scoreBadge
  };
};

const getEnrichedList = () => {
  return wishboardItems.map(enrichWishItem).sort((a, b) => b.score - a.score);
};

// GET /api/wishboard/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const items = getEnrichedList();
    const activeItems = items.filter(i => i.status !== 'skipped');
    const wantItems = items.filter(i => i.status === 'want');
    const savingItems = items.filter(i => i.status === 'saving');
    const readyItems = items.filter(i => i.status === 'ready');
    const purchasedItems = items.filter(i => i.status === 'purchased');

    const totalEstimatedCost = activeItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalSaved = activeItems.reduce((acc, curr) => acc + (curr.saved || 0), 0);
    const totalDeficit = Math.max(0, totalEstimatedCost - totalSaved);
    const overallSavedPercent = totalEstimatedCost > 0 ? Math.min(100, Math.round((totalSaved / totalEstimatedCost) * 100)) : 0;

    const topRecommendations = activeItems
      .filter(i => i.status === 'want' || i.status === 'saving' || i.status === 'ready')
      .slice(0, 3);

    res.json({
      success: true,
      summary: {
        totalItemsCount: items.length,
        activeItemsCount: activeItems.length,
        wantCount: wantItems.length,
        savingCount: savingItems.length,
        readyCount: readyItems.length,
        purchasedCount: purchasedItems.length,
        skippedCount: skippedWishItems.length,
        totalEstimatedCost,
        totalSaved,
        totalDeficit,
        overallSavedPercent
      },
      topRecommendations,
      items,
      skippedItems: skippedWishItems,
      weights: wishboardWeights
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/wishboard/items
exports.getItems = async (req, res, next) => {
  try {
    const items = getEnrichedList();
    res.json({
      success: true,
      items,
      skippedItems: skippedWishItems,
      weights: wishboardWeights
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishboard/items
exports.createItem = async (req, res, next) => {
  try {
    const { name, brand, category, price, urgency, want, deadline, img, pros, cons } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama item wishlist wajib diisi.' });
    }

    const newItem = {
      id: 'wb-' + Date.now(),
      name: name.trim(),
      brand: brand || 'Generic',
      category: category || 'Umum & Lainnya',
      categorySlug: (category || 'elektronik').toLowerCase().includes('elek') ? 'elektronik' : 'fashion',
      img: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      price: Number(price) || 0,
      saved: 0,
      urgency: Number(urgency) || 3,
      want: Number(want) || 4,
      status: 'want',
      deadline: deadline || '2026-12-31',
      daysLeft: '30+ hari lagi',
      sku: 'SKU-' + Date.now().toString().slice(-6),
      pros: Array.isArray(pros) ? pros : (pros ? [pros] : []),
      cons: Array.isArray(cons) ? cons : (cons ? [cons] : []),
      savingsHistory: []
    };

    wishboardItems.unshift(newItem);
    const enrichedList = getEnrichedList();
    const enrichedNewItem = enrichedList.find(i => i.id === newItem.id);

    res.status(201).json({
      success: true,
      message: `Item wishlist "${name}" berhasil dibuat di Backend API server!`,
      item: enrichedNewItem,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/wishboard/items/:id/status
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = wishboardItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    if (status) {
      item.status = status;
      if (status === 'purchased' && !item.boughtDate) {
        item.boughtDate = new Date().toISOString().split('T')[0];
      }
    }

    const enrichedList = getEnrichedList();
    const updatedEnriched = enrichedList.find(i => i.id === id);

    res.json({
      success: true,
      message: `Status item "${item.name}" berhasil diubah menjadi "${status.toUpperCase()}" di Backend!`,
      item: updatedEnriched,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishboard/items/:id/deposit
exports.addDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const numAmount = Number(amount) || 0;

    if (numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Nominal setoran tabungan harus lebih dari 0.' });
    }

    const item = wishboardItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    item.saved = (item.saved || 0) + numAmount;
    if (!item.savingsHistory) item.savingsHistory = [];

    item.savingsHistory.unshift({
      id: 'sh-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: numAmount,
      note: note || 'Top up tabungan Backend'
    });

    if (item.saved >= item.price && item.status === 'saving') {
      item.status = 'ready';
    }

    const enrichedList = getEnrichedList();
    const updatedEnriched = enrichedList.find(i => i.id === id);

    res.json({
      success: true,
      message: `Setoran tabungan Rp ${numAmount.toLocaleString('id-ID')} untuk "${item.name}" berhasil disimpan di Backend!`,
      item: updatedEnriched,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishboard/items/:id/pros
exports.addPro = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Teks alasan Pro wajib diisi.' });
    }

    const item = wishboardItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    if (!item.pros) item.pros = [];
    item.pros.push(text.trim());

    const enrichedList = getEnrichedList();
    const updatedEnriched = enrichedList.find(i => i.id === id);

    res.json({
      success: true,
      message: 'Alasan Pro berhasil ditambahkan ke Backend!',
      item: updatedEnriched,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishboard/items/:id/cons
exports.addCon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Teks alasan Con wajib diisi.' });
    }

    const item = wishboardItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    if (!item.cons) item.cons = [];
    item.cons.push(text.trim());

    const enrichedList = getEnrichedList();
    const updatedEnriched = enrichedList.find(i => i.id === id);

    res.json({
      success: true,
      message: 'Alasan Con berhasil ditambahkan ke Backend!',
      item: updatedEnriched,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishboard/items/:id/skip
exports.skipItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const itemIndex = wishboardItems.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    const itemToSkip = wishboardItems[itemIndex];
    wishboardItems.splice(itemIndex, 1);

    const skippedRecord = {
      id: 'sk-' + Date.now(),
      name: itemToSkip.name,
      category: itemToSkip.category,
      originalPrice: itemToSkip.price,
      reason: reason || 'Keputusan dibatalkan oleh pengguna via Backend.',
      status: 'skipped'
    };

    skippedWishItems.unshift(skippedRecord);

    const enrichedList = getEnrichedList();

    res.json({
      success: true,
      message: `Item "${itemToSkip.name}" berhasil di-skip dan dipindahkan ke histori rasionalisasi Backend!`,
      skippedItem: skippedRecord,
      items: enrichedList,
      skippedItems: skippedWishItems
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishboard/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = wishboardItems.find(i => i.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan.' });
    }

    wishboardItems = wishboardItems.filter(i => i.id !== id);
    const enrichedList = getEnrichedList();

    res.json({
      success: true,
      message: `Item "${target.name}" berhasil dihapus dari Backend Server!`,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/wishboard/settings
exports.getSettings = async (req, res, next) => {
  try {
    res.json({
      success: true,
      weights: wishboardWeights
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/wishboard/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { urgency, want, budget } = req.body;

    if (urgency !== undefined) wishboardWeights.urgency = Number(urgency);
    if (want !== undefined) wishboardWeights.want = Number(want);
    if (budget !== undefined) wishboardWeights.budget = Number(budget);

    const enrichedList = getEnrichedList();

    res.json({
      success: true,
      message: 'Formula bobot prioritas berhasil diperbarui di Backend Server!',
      weights: wishboardWeights,
      items: enrichedList
    });
  } catch (error) {
    next(error);
  }
};
