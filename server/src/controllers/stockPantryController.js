// In-Memory / Backend DB Store for StockPantry
let pantryItems = [
  {
    id: 'p-1',
    name: 'Minyak Goreng Bimoli 2L',
    category: 'Bahan Pokok',
    zone: 'Lemari Dapur Bawah',
    zoneId: 'lemari',
    qty: 2,
    unit: 'Pouch',
    maxQty: 4,
    status: 'safe', // 'safe' | 'low' | 'empty' | 'expiring' | 'expired'
    expiryDate: '2026-12-15',
    expiryDays: 70,
    expiryStatus: 'Aman',
    price: 38500,
    brand: 'Bimoli',
    store: 'Indomaret Merr',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    notes: 'Stok rutin masak harian'
  },
  {
    id: 'p-2',
    name: 'Telur Ayam Negeri',
    category: 'Bahan Segar',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    qty: 1,
    unit: 'Tray (10 Butir)',
    maxQty: 2,
    status: 'low',
    expiryDate: '2026-10-18',
    expiryDays: 12,
    expiryStatus: 'Perhatikan',
    price: 28000,
    brand: 'Farm Fresh',
    store: 'Superindo',
    img: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=80',
    notes: 'Segera restock sebelum habis'
  },
  {
    id: 'p-3',
    name: 'Daging Slice Sukiyaki 500g',
    category: 'Daging & Seafood',
    zone: 'Freezer Beku',
    zoneId: 'freezer',
    qty: 3,
    unit: 'Pack',
    maxQty: 3,
    status: 'safe',
    expiryDate: '2026-11-20',
    expiryDays: 45,
    expiryStatus: 'Aman',
    price: 85000,
    brand: 'US Beef',
    store: 'Superindo',
    img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80',
    notes: 'Simpan beku -18°C'
  },
  {
    id: 'p-4',
    name: 'Susu UHT Ultra Milk 1L',
    category: 'Olahan Dairy',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    qty: 0,
    unit: 'Kotak',
    maxQty: 6,
    status: 'empty',
    expiryDate: '2026-10-10',
    expiryDays: 4,
    expiryStatus: 'Segera Habiskan',
    price: 19500,
    brand: 'Ultra Milk',
    store: 'Indomaret',
    img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
    notes: 'Stok habis, siap dipesan'
  }
];

let zonesData = [
  {
    id: 'chiller',
    name: 'Kulkas Chiller',
    temp: '2°C - 4°C',
    type: 'Suhu Dingin',
    desc: 'Makanan Segar, Susu, Sayuran Berkadar Air Tinggi, Olahan Dairy.',
    color: '#38bdf8',
    icon: 'Refrigerator'
  },
  {
    id: 'freezer',
    name: 'Freezer Beku',
    temp: '-18°C',
    type: 'Suhu Beku Ekstrem',
    desc: 'Daging, Seafood, Frozen Prepared Meals, Es Batu & Dessert.',
    color: '#22d3ee',
    icon: 'Snowflake'
  },
  {
    id: 'lemari',
    name: 'Lemari Dapur Bawah',
    temp: '26°C',
    type: 'Suhu Ruang Kering',
    desc: 'Bahan Pokok, Minyak Goreng, Karbohidrat & Umbi-umbian Segar.',
    color: '#f97316',
    icon: 'Boxes'
  },
  {
    id: 'bumbu',
    name: 'Rak Bumbu & Rempah',
    temp: '25°C',
    type: 'Meja Masak Dekat Kompor',
    desc: 'Botol Saus, Kecap, Garam Meja, Rempah Bubuk & Kaldu Aromatik.',
    color: '#f59e0b',
    icon: 'UtensilsCrossed'
  },
  {
    id: 'p3k',
    name: 'Kotak Obat P3K',
    temp: '24°C',
    type: 'Tempat Kering & Sejuk',
    desc: 'Obat Darurat Keluarga, Multivitamin Rutin, Perban & Masker Medis.',
    color: '#ef4444',
    icon: 'Cross'
  },
  {
    id: 'cuci',
    name: 'Rak Perlengkapan & Cuci',
    temp: '27°C',
    type: 'Area Dapur Basah',
    desc: 'Sabun Cuci Piring, Spons, Refill Pembersih Lantai & Tissue Dapur.',
    color: '#a855f7',
    icon: 'Sparkles'
  }
];

let shoppingListData = [
  {
    id: 'sl_1',
    name: 'Telur Ayam Negeri',
    qty: 1,
    unit: 'Tray',
    price: 28000,
    checked: true,
    isManual: false,
    store: 'Superindo',
    zone: '🥚 Kulkas Chiller',
    reason: 'Stok Menipis (1/2 Tray)'
  },
  {
    id: 'sl_2',
    name: 'Susu UHT Ultra Milk 1L',
    qty: 4,
    unit: 'Kotak',
    price: 78000,
    checked: false,
    isManual: false,
    store: 'Indomaret',
    zone: '🥛 Kulkas Chiller',
    reason: 'Stok Habis (0/6 Kotak)'
  },
  {
    id: 'sl_3',
    name: 'Bawang Merah & Putih 500g',
    qty: 1,
    unit: 'Pack',
    price: 25000,
    checked: false,
    isManual: true,
    store: 'Pasar Tradisional',
    zone: '🧅 Rak Bumbu',
    reason: 'Restock Manual'
  }
];

let logsData = [
  {
    id: 'l_1',
    dateGroup: 'Hari Ini — Pemakaian',
    category: 'konsumsi',
    name: 'Telur Ayam Negeri',
    change: '-2 Butir',
    stockRemaining: '8 Butir',
    time: '07:30 WIB',
    location: 'Kulkas Chiller',
    note: 'Masak sarapan pagi',
    icon: '🍳',
    canUndo: true,
    undone: false
  },
  {
    id: 'l_2',
    dateGroup: 'Kemarin — Waste Audit',
    category: 'waste',
    name: 'Roti Tawar Kupas',
    change: '-1 Pack',
    stockRemaining: '0 Pack',
    time: '19:45 WIB',
    location: 'Dibuang',
    note: 'Kedaluwarsa (Berjamur)',
    icon: '🗑️',
    loss: 'Rp 16.500',
    canUndo: false,
    undone: false
  }
];

// Helper metric calculator
const getSummaryMetrics = () => {
  const totalItems = pantryItems.length;
  const safeCount = pantryItems.filter(i => i.status === 'safe').length;
  const lowCount = pantryItems.filter(i => i.status === 'low').length;
  const emptyCount = pantryItems.filter(i => i.status === 'empty').length;
  const expiringCount = pantryItems.filter(i => i.expiryDays <= 3 && i.status !== 'empty').length;

  const totalValuation = pantryItems.reduce((acc, curr) => acc + ((curr.qty || 0) * (curr.price || 0)), 0);

  return {
    totalItems,
    safeCount,
    lowCount,
    emptyCount,
    expiringCount,
    totalValuation
  };
};

// GET /api/stockpantry/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const metrics = getSummaryMetrics();
    res.json({
      success: true,
      metrics,
      items: pantryItems,
      zones: zonesData,
      shoppingList: shoppingListData,
      logs: logsData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stockpantry/items
exports.getItems = async (req, res, next) => {
  try {
    res.json({
      success: true,
      items: pantryItems,
      metrics: getSummaryMetrics()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stockpantry/items
exports.createItem = async (req, res, next) => {
  try {
    const { name, category, zone, qty, unit, maxQty, price, brand, expiryDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama bahan/produk wajib diisi.' });
    }

    const parsedQty = Number(qty) || 1;
    const parsedMaxQty = Number(maxQty) || 5;

    let status = 'safe';
    if (parsedQty === 0) status = 'empty';
    else if (parsedQty <= parsedMaxQty * 0.3) status = 'low';

    const newItem = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      category: category || 'Bahan Pokok',
      zone: zone || 'Lemari Dapur Bawah',
      zoneId: (zone || 'lemari').toLowerCase().includes('kulkas') ? 'chiller' : 'lemari',
      qty: parsedQty,
      unit: unit || 'Pcs',
      maxQty: parsedMaxQty,
      status,
      expiryDate: expiryDate || '2026-11-30',
      expiryDays: 30,
      expiryStatus: 'Aman',
      price: Number(price) || 15000,
      brand: brand || 'Generic',
      img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      notes: 'Disimpan via Backend Server'
    };

    pantryItems.unshift(newItem);

    res.status(201).json({
      success: true,
      message: `Bahan dapur "${name}" berhasil ditambahkan ke Server BE!`,
      item: newItem,
      items: pantryItems
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/stockpantry/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = pantryItems.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Bahan dapur tidak ditemukan.' });
    }

    Object.assign(item, req.body);

    if (item.qty === 0) item.status = 'empty';
    else if (item.qty <= item.maxQty * 0.3) item.status = 'low';
    else item.status = 'safe';

    res.json({
      success: true,
      message: `Item "${item.name}" berhasil diperbarui di Server BE!`,
      item,
      items: pantryItems
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/stockpantry/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = pantryItems.find(i => i.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Bahan dapur tidak ditemukan.' });
    }

    pantryItems = pantryItems.filter(i => i.id !== id);

    res.json({
      success: true,
      message: `Item "${target.name}" berhasil dihapus dari Backend!`,
      items: pantryItems
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stockpantry/items/:id/consume
exports.consumeItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qtyUsed, note } = req.body;
    const used = Number(qtyUsed) || 1;

    const item = pantryItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Bahan dapur tidak ditemukan.' });
    }

    item.qty = Math.max(0, parseFloat((item.qty - used).toFixed(2)));
    if (item.qty === 0) item.status = 'empty';
    else if (item.qty <= item.maxQty * 0.3) item.status = 'low';

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newLog = {
      id: 'l_' + Date.now(),
      dateGroup: 'Hari Ini — Pemakaian',
      category: 'konsumsi',
      name: item.name,
      change: `-${used} ${item.unit}`,
      stockRemaining: `${item.qty} ${item.unit}`,
      time: timeStr,
      location: item.zone,
      note: note || 'Pemakaian harian',
      icon: '🍳',
      canUndo: true,
      undone: false
    };

    logsData.unshift(newLog);

    res.json({
      success: true,
      message: `Berhasil mencatat pemakaian ${used} ${item.unit} "${item.name}" ke BE!`,
      item,
      items: pantryItems,
      logs: logsData
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stockpantry/shopping
exports.addShoppingItem = async (req, res, next) => {
  try {
    const { name, price, store, zone, reason } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama item belanja wajib diisi.' });
    }

    const newItem = {
      id: 'sl_' + Date.now(),
      name: name.trim(),
      qty: 1,
      unit: 'Item',
      price: Number(price) || 20000,
      checked: false,
      isManual: true,
      store: store || 'Supermarket',
      zone: zone || '🥫 Lemari Dapur',
      reason: reason || 'Manual Restock'
    };

    shoppingListData.unshift(newItem);

    res.status(201).json({
      success: true,
      message: `Item "${name}" berhasil ditambahkan ke Shopping List Server BE!`,
      shoppingList: shoppingListData
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/stockpantry/shopping/:id/toggle
exports.toggleShoppingCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = shoppingListData.find(s => s.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Item belanja tidak ditemukan.' });
    }

    target.checked = !target.checked;

    res.json({
      success: true,
      message: `Status item "${target.name}" diperbarui di BE (${target.checked ? 'Checked' : 'Unchecked'}).`,
      shoppingList: shoppingListData
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stockpantry/shopping/commit-restock
exports.commitRestock = async (req, res, next) => {
  try {
    const checkedItems = shoppingListData.filter(i => i.checked);
    if (checkedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada item tercentang untuk direstock.' });
    }

    // Update pantry items
    pantryItems.forEach(p => {
      const match = checkedItems.find(c => c.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(c.name.toLowerCase()));
      if (match) {
        p.qty = p.maxQty || (p.qty + 1);
        p.status = 'safe';
      }
    });

    // Add restock log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newLog = {
      id: 'l_' + Date.now(),
      dateGroup: 'Hari Ini — Restock Belanja',
      category: 'restock',
      name: `${checkedItems.length} Item Belanjaan`,
      change: `+Restock Completed`,
      stockRemaining: `Stok Diperbarui`,
      time: timeStr,
      location: 'Kasir Supermarket',
      note: 'Restock dari Smart Shopping List via BE',
      icon: '🛒',
      price: `Rp ${checkedItems.reduce((sum, i) => sum + i.price, 0).toLocaleString('id-ID')}`,
      canUndo: false,
      undone: false
    };

    logsData.unshift(newLog);
    shoppingListData = shoppingListData.filter(i => !i.checked);

    res.json({
      success: true,
      message: `Berhasil menyelesaikan restock ${checkedItems.length} item di Backend Server!`,
      restockedCount: checkedItems.length,
      items: pantryItems,
      shoppingList: shoppingListData,
      logs: logsData
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stockpantry/zones
exports.createZone = async (req, res, next) => {
  try {
    const { name, temp, type, desc, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama zona penyimpanan wajib diisi.' });
    }

    const newZone = {
      id: 'z_' + Date.now(),
      name: name.trim(),
      temp: temp || '25°C',
      type: type || 'Suhu Ruang',
      desc: desc || 'Area Penyimpanan Baru',
      color: color || '#f97316',
      icon: icon || 'Boxes'
    };

    zonesData.push(newZone);

    res.status(201).json({
      success: true,
      message: `Zona penyimpanan "${name}" berhasil dibuat di Backend Server!`,
      zones: zonesData
    });
  } catch (error) {
    next(error);
  }
};
