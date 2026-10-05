import React, { createContext, useContext, useState, useEffect } from 'react';

const StockPantryContext = createContext();

const INITIAL_ZONES = [
  {
    id: 'chiller',
    name: 'Kulkas Chiller',
    temp: '2°C - 4°C',
    type: 'Suhu Dingin',
    desc: 'Makanan Segar, Susu, Sayuran Berkadar Air Tinggi, Olahan Dairy.',
    color: '#38bdf8',
    icon: 'Refrigerator',
    capacityPct: 75,
    itemsCount: 18,
    valuation: 345000,
    previews: ['Susu UHT 1L', 'Telur Ayam 2 btr', 'Greek Yogurt', 'Selada Romaine']
  },
  {
    id: 'freezer',
    name: 'Freezer Beku',
    temp: '-18°C',
    type: 'Suhu Beku Ekstrem',
    desc: 'Daging, Seafood, Frozen Prepared Meals, Es Batu & Dessert.',
    color: '#22d3ee',
    icon: 'Snowflake',
    capacityPct: 50,
    itemsCount: 6,
    valuation: 210000,
    previews: ['Daging Sukiyaki', 'Daging Ayam Fillet', 'Es Krim Vanilla']
  },
  {
    id: 'lemari',
    name: 'Lemari Dapur Bawah',
    temp: '26°C',
    type: 'Suhu Ruang Kering',
    desc: 'Bahan Pokok, Minyak Goreng, Karbohidrat & Umbi-umbian Segar.',
    color: '#f97316',
    icon: 'Boxes',
    capacityPct: 60,
    itemsCount: 12,
    valuation: 165000,
    previews: ['Beras Ramos 5kg', 'Minyak Bimoli 2L', 'Roti Tawar Gandum']
  },
  {
    id: 'bumbu',
    name: 'Rak Bumbu & Rempah',
    temp: '25°C',
    type: 'Meja Masak Dekat Kompor',
    desc: 'Botol Saus, Kecap, Garam Meja, Rempah Bubuk & Kaldu Aromatik.',
    color: '#f59e0b',
    icon: 'UtensilsCrossed',
    capacityPct: 80,
    itemsCount: 8,
    valuation: 68000,
    previews: ['Saus Tiram', 'Kecap Manis', 'Garam Halus']
  },
  {
    id: 'p3k',
    name: 'Kotak Obat P3K',
    temp: '24°C',
    type: 'Tempat Kering & Sejuk',
    desc: 'Obat Darurat Keluarga, Multivitamin Rutin, Perban & Masker Medis.',
    color: '#ef4444',
    icon: 'Cross',
    capacityPct: 40,
    itemsCount: 4,
    valuation: 32000,
    previews: ['Paracetamol 500mg', 'Vitamin C 1000mg', 'Band-Aid']
  },
  {
    id: 'cuci',
    name: 'Rak Perlengkapan & Cuci',
    temp: '27°C',
    type: 'Area Dapur Basah',
    desc: 'Sabun Cuci Piring, Spons, Refill Pembersih Lantai & Tissue Dapur.',
    color: '#a855f7',
    icon: 'Sparkles',
    capacityPct: 35,
    itemsCount: 4,
    valuation: 20000,
    previews: ['Sunlight Jeruk Nipis', 'Tissue Paseo 250s']
  }
];

const INITIAL_PANTRY_ITEMS = [
  {
    id: 'p1',
    name: 'Telur Ayam Negeri',
    brand: 'Peternak Lokal',
    ean: 'EAN-8991204',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    zoneIcon: '❄️',
    status: 'low',
    qty: 2,
    maxQty: 15,
    unit: 'Butir',
    price: 32000,
    category: 'Makanan Segar',
    expiry: '2026-10-18',
    expiryDays: 13,
    expiryStatus: 'Aman 2 Minggu+',
    img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    name: 'Susu UHT Ultra Milk 1L',
    brand: 'Ultra Milk',
    ean: 'EAN-8992753',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    zoneIcon: '❄️',
    status: 'expiring',
    qty: 1,
    maxQty: 2,
    unit: 'Kotak',
    price: 19000,
    category: 'Minuman & Dairy',
    expiry: '2026-10-06',
    expiryDays: 1,
    expiryStatus: 'Exp Besok (6 Okt)',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p3',
    name: 'Minyak Goreng Spesial 2L',
    brand: 'Bimoli',
    ean: 'EAN-8993012',
    zone: 'Lemari Dapur Bawah',
    zoneId: 'lemari',
    zoneIcon: '🥫',
    status: 'empty',
    qty: 0,
    maxQty: 2,
    unit: 'Pouch',
    price: 38000,
    category: 'Bahan Pokok',
    expiry: '2026-10-20',
    expiryDays: 15,
    expiryStatus: 'Habis',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p4',
    name: 'Beras Ramos Setra 5kg',
    brand: 'Topi Koki',
    ean: 'EAN-8994511',
    zone: 'Lemari Dapur Bawah',
    zoneId: 'lemari',
    zoneIcon: '🥫',
    status: 'safe',
    qty: 4.2,
    maxQty: 5,
    unit: 'kg',
    price: 78000,
    category: 'Bahan Pokok',
    expiry: '2026-12-12',
    expiryDays: 68,
    expiryStatus: 'Aman',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p5',
    name: 'Saus Tiram Selera 510g',
    brand: 'Lee Kum Kee',
    ean: 'EAN-088921',
    zone: 'Rak Bumbu & Rempah',
    zoneId: 'bumbu',
    zoneIcon: '🧂',
    status: 'empty',
    qty: 0,
    maxQty: 1,
    unit: 'Botol',
    price: 26500,
    category: 'Bumbu Masak',
    expiry: '2026-11-15',
    expiryDays: 41,
    expiryStatus: 'Habis',
    img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p6',
    name: 'Greek Yogurt Blueberry 120g',
    brand: 'Cimory',
    ean: 'EAN-8991008',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    zoneIcon: '❄️',
    status: 'expiring',
    qty: 1,
    maxQty: 4,
    unit: 'Cup',
    price: 12000,
    category: 'Minuman & Dairy',
    expiry: '2026-10-07',
    expiryDays: 2,
    expiryStatus: '2 Hari Lagi',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p7',
    name: 'Bawang Putih Kating 250g',
    brand: 'Pasar Segar',
    ean: 'NON-BARCODE',
    zone: 'Lemari Dapur Bawah',
    zoneId: 'lemari',
    zoneIcon: '🥫',
    status: 'low',
    qty: 50,
    maxQty: 250,
    unit: 'g',
    price: 15000,
    category: 'Bumbu Masak',
    expiry: '2026-10-25',
    expiryDays: 20,
    expiryStatus: 'Organik Kering',
    img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p8',
    name: 'Daging Slice Sukiyaki 500g',
    brand: 'Meatland',
    ean: 'EAN-8997721',
    zone: 'Freezer Beku',
    zoneId: 'freezer',
    zoneIcon: '🧊',
    status: 'safe',
    qty: 500,
    maxQty: 500,
    unit: 'g',
    price: 85000,
    category: 'Daging & Seafood',
    expiry: '2026-12-20',
    expiryDays: 76,
    expiryStatus: 'Deep Freeze',
    img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p9',
    name: 'Paracetamol 500mg',
    brand: 'Panadol Biru',
    ean: 'EAN-8991192',
    zone: 'Kotak Obat P3K',
    zoneId: 'p3k',
    zoneIcon: '💊',
    status: 'safe',
    qty: 8,
    maxQty: 10,
    unit: 'Kaplet',
    price: 12500,
    category: 'Obat & Kesehatan',
    expiry: '2028-01-15',
    expiryDays: 467,
    expiryStatus: 'Aman',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p10',
    name: 'Yoghurt Strawberry Biokul 150ml',
    brand: 'Biokul',
    ean: 'EAN-8990099',
    zone: 'Kulkas Chiller',
    zoneId: 'chiller',
    zoneIcon: '❄️',
    status: 'expired',
    qty: 1,
    maxQty: 2,
    unit: 'Botol',
    price: 14000,
    category: 'Minuman & Dairy',
    expiry: '2026-10-03',
    expiryDays: -2,
    expiryStatus: 'Kedaluwarsa 2 Hari Lalu',
    img: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80'
  }
];

const INITIAL_SHOPPING_LIST = [
  { id: 'sl1', name: 'Telur Ayam Negeri', sub: '15 Butir / 1 Tray', reason: 'Sisa 2 Butir · Kritis 13%', store: 'Superindo Merr', zone: '❄️ Kulkas Chiller', price: 32000, checked: false, isManual: false, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80' },
  { id: 'sl2', name: 'Minyak Goreng Bimoli 2L', sub: '1 Pouch', reason: 'HABIS TOTAL (0 Pouch)', store: 'Indomaret', zone: '🥫 Lemari Dapur', price: 38000, checked: false, isManual: false, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80' },
  { id: 'sl3', name: 'Saus Tiram Lee Kum Kee 510g', sub: '1 Botol', reason: 'HABIS! (0 Botol)', store: 'Grand Lucky', zone: '🧂 Rak Bumbu', price: 26500, checked: false, isManual: false, img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&auto=format&fit=crop&q=80' },
  { id: 'sl4', name: 'Susu UHT Ultra Milk 1L', sub: '2 Kotak', reason: 'Sisa 1 (Exp besok!)', store: 'Superindo Merr', zone: '❄️ Kulkas Chiller', price: 38000, checked: false, isManual: false, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },
  { id: 'sl5', name: 'Sunlight Jeruk Nipis 750ml', sub: '1 Pouch', reason: 'Manual Restock', store: 'Minimarket', zone: '🧼 Perlengkapan Rumah', price: 16000, checked: true, isManual: true, img: '' },
  { id: 'sl6', name: 'Tissue Paseo 250s', sub: '2 Pack', reason: 'Manual Restock', store: 'Minimarket', zone: '🧼 Perlengkapan Rumah', price: 28000, checked: true, isManual: true, img: '' },
  { id: 'sl7', name: 'Biskuit Roma Kelapa 300g', sub: '1 Bungkus', reason: 'Camilan Tamu', store: 'Minimarket', zone: '🥫 Lemari Dapur', price: 12500, checked: false, isManual: true, img: '' }
];

const INITIAL_LOGS = [
  { id: 'l1', dateGroup: 'Hari Ini — 5 Oktober 2026', category: 'konsumsi', name: 'Telur Ayam Negeri', change: '-2 Butir', stockRemaining: '2 Butir', time: '07:15 WIB', location: '❄️ Kulkas Chiller', note: 'Menu sarapan telur orak-arik & roti panggang', icon: '🥚', canUndo: true, undone: false },
  { id: 'l2', dateGroup: 'Hari Ini — 5 Oktober 2026', category: 'konsumsi', name: 'Susu UHT Ultra Milk 1L', change: '-250 ml', stockRemaining: '1 Kotak (terpakai 1/4)', time: '08:30 WIB', location: 'Rak Pintu Kulkas', note: 'Campuran kopi latte pagi', icon: '🥛', canUndo: true, undone: false },
  { id: 'l3', dateGroup: 'Hari Ini — 5 Oktober 2026', category: 'restock', name: 'Telur Ayam Negeri', change: '+15 Butir', stockRemaining: '17 Butir', time: '09:30 WIB', location: 'Superindo Merr', note: 'Restock Mingguan', icon: '🥚', price: 'Rp 31.500', canUndo: false, undone: false },
  { id: 'l4', dateGroup: 'Kemarin — 4 Oktober 2026', category: 'waste', name: 'Yoghurt Strawberry Biokul 150ml', change: '-1 Botol', stockRemaining: '0 Botol', time: '19:40 WIB', location: 'Dibuang (Kedaluwarsa)', note: 'Sudah lewat 2 hari dan asam', icon: '🍓', loss: 'Rp 14.000', canUndo: false, undone: false },
  { id: 'l5', dateGroup: 'Kemarin — 4 Oktober 2026', category: 'konsumsi', name: 'Beras Ramos Topi Koki 5kg', change: '-500 gram', stockRemaining: '4.2 kg', time: '11:20 WIB', location: 'Lemari Sembako Utama', note: 'Masak nasi 4 porsi makan siang', icon: '🍚', canUndo: true, undone: false },
  { id: 'l6', dateGroup: 'Kemarin — 4 Oktober 2026', category: 'konsumsi', name: 'Minyak Goreng Bimoli 2L', change: '-200 ml', stockRemaining: '0 Pouch (HABIS)', time: '17:45 WIB', location: 'Auto-Trigger List', note: 'Menggoreng tempe & ikan', icon: '🍳', canUndo: true, undone: false }
];

export const StockPantryProvider = ({ children }) => {
  const [pantryItems, setPantryItems] = useState(() => {
    const saved = localStorage.getItem('stockpantry_items');
    return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
  });

  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('stockpantry_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('stockpantry_shopping');
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING_LIST;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('stockpantry_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('stockpantry_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('stockpantry_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('stockpantry_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('stockpantry_logs', JSON.stringify(logs));
  }, [logs]);

  // Actions
  const addPantryItem = (newItem) => {
    const id = 'p_' + Date.now();
    const itemWithId = {
      id,
      status: newItem.qty === 0 ? 'empty' : newItem.qty <= newItem.maxQty * 0.3 ? 'low' : 'safe',
      expiryDays: 30,
      expiryStatus: 'Aman',
      img: newItem.img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      ...newItem
    };
    setPantryItems(prev => [itemWithId, ...prev]);
  };

  const updatePantryItem = (id, updatedFields) => {
    setPantryItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextItem = { ...item, ...updatedFields };
        if (nextItem.qty === 0) nextItem.status = 'empty';
        else if (nextItem.qty <= nextItem.maxQty * 0.3) nextItem.status = 'low';
        else if (nextItem.expiryDays <= 3) nextItem.status = 'expiring';
        else nextItem.status = 'safe';
        return nextItem;
      }
      return item;
    }));
  };

  const deletePantryItem = (id) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  const changeQty = (id, delta) => {
    setPantryItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, parseFloat((item.qty + delta).toFixed(2)));
        let newStatus = 'safe';
        if (newQty === 0) newStatus = 'empty';
        else if (newQty <= item.maxQty * 0.3) newStatus = 'low';
        else if (item.expiryDays <= 3) newStatus = 'expiring';

        return { ...item, qty: newQty, status: newStatus };
      }
      return item;
    }));
  };

  const consumeItem = (id, qtyUsed, note = '') => {
    const item = pantryItems.find(i => i.id === id);
    if (!item) return;

    changeQty(id, -qtyUsed);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newLog = {
      id: 'l_' + Date.now(),
      dateGroup: 'Hari Ini — Pemakaian',
      category: 'konsumsi',
      name: item.name,
      change: `-${qtyUsed} ${item.unit}`,
      stockRemaining: `${Math.max(0, item.qty - qtyUsed)} ${item.unit}`,
      time: timeStr,
      location: item.zone,
      note: note || 'Pemakaian harian',
      icon: '🍳',
      canUndo: true,
      undone: false
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const discardItem = (id, reason = 'Kedaluwarsa') => {
    const item = pantryItems.find(i => i.id === id);
    if (!item) return;

    updatePantryItem(id, { qty: 0, status: 'expired' });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newLog = {
      id: 'l_' + Date.now(),
      dateGroup: 'Hari Ini — Waste Audit',
      category: 'waste',
      name: item.name,
      change: `-${item.qty} ${item.unit}`,
      stockRemaining: `0 ${item.unit}`,
      time: timeStr,
      location: 'Dibuang',
      note: reason,
      icon: '🗑️',
      loss: `Rp ${item.price.toLocaleString('id-ID')}`,
      canUndo: false,
      undone: false
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const toggleShoppingCheck = (id) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addShoppingItem = (newItem) => {
    const item = {
      id: 'sl_' + Date.now(),
      checked: false,
      isManual: true,
      price: newItem.price || 20000,
      store: newItem.store || 'Supermarket',
      zone: newItem.zone || '🥫 Lemari Dapur',
      reason: newItem.reason || 'Manual Restock',
      ...newItem
    };
    setShoppingList(prev => [item, ...prev]);
  };

  const commitRestock = () => {
    const checkedItems = shoppingList.filter(i => i.checked);
    if (checkedItems.length === 0) return 0;

    // Update pantry items qty
    setPantryItems(prev => prev.map(p => {
      const match = checkedItems.find(c => c.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(c.name.toLowerCase()));
      if (match) {
        return {
          ...p,
          qty: p.maxQty || (p.qty + 1),
          status: 'safe'
        };
      }
      return p;
    }));

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
      note: 'Restock dari Smart Shopping List',
      icon: '🛒',
      price: `Rp ${checkedItems.reduce((sum, i) => sum + i.price, 0).toLocaleString('id-ID')}`,
      canUndo: false,
      undone: false
    };
    setLogs(prev => [newLog, ...prev]);

    // Keep unchecked items in shopping list
    setShoppingList(prev => prev.filter(i => !i.checked));

    return checkedItems.length;
  };

  const undoLog = (logId) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, undone: true } : l));
  };

  const addZone = (newZone) => {
    const id = 'z_' + Date.now();
    setZones(prev => [...prev, { id, capacityPct: 0, itemsCount: 0, valuation: 0, previews: [], ...newZone }]);
  };

  return (
    <StockPantryContext.Provider
      value={{
        pantryItems,
        zones,
        shoppingList,
        logs,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        changeQty,
        consumeItem,
        discardItem,
        toggleShoppingCheck,
        addShoppingItem,
        commitRestock,
        undoLog,
        addZone
      }}
    >
      {children}
    </StockPantryContext.Provider>
  );
};

export const useStockPantry = () => useContext(StockPantryContext);
