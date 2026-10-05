import React, { createContext, useContext, useState, useEffect } from 'react';

const WishBoardContext = createContext();

const DEFAULT_WEIGHTS = {
  urgency: 35,
  want: 30,
  budget: 35
};

const INITIAL_ITEMS = [
  {
    id: '1',
    name: 'Logitech MX Keys S',
    brand: 'Logitech',
    tag: 'Top Pick',
    category: 'Elektronik & Kerja',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkORnMiewPI6STVTkYZVA4b2uHRxpWGeHdQedIHlW9xAnFDHd307ORkh5eIZKGQC0AtaRKedN0ZWoW6npvPtX6bcrX_9dCAcILoSljONMc-nhsd_SjJMrvMvJMBEAVUCOa-3BYQ9BlBnA-GY9rbeFQsDo2shiyLzx4PR2DdK7p04OUEMHJcuGhwMUWiTBxKD6HWMwvrxYdLRaR8eVvUmk9KNpMb6Juf-EfP_I_tOHQKpNLu32y0RUbjw',
    estimatedMin: 1400000,
    estimatedMax: 1600000,
    price: 1500000,
    saved: 1275000,
    urgency: 5,
    want: 5,
    status: 'saving', // 'want' | 'saving' | 'ready' | 'purchased' | 'skipped'
    deadline: '2026-10-20',
    daysLeft: '17 hari lagi',
    sku: 'LOGI-MXK-S-BLK',
    guarantee: '1 TAHUN',
    pros: [
      'Keyboard scissor-switch paling nyaman dan ergonomis untuk mengetik ribuan baris kode harian.',
      'Mendukung seamless switching 3 perangkat antara MacBook M4 kerja dan Windows PC personal.',
      'Smart backlighting otomatis menyala saat tangan mendekat + sensor ambient light hemat daya.',
      'Daya tahan baterai hingga 5 bulan dan rechargeable via USB-C cepat.',
      'Tombol programmable via Logi Options+ untuk shortcut IDE VS Code.'
    ],
    cons: [
      'Harga cukup premium (Rp 1.5jt) dibanding keyboard mechanical entry-level lokal.'
    ],
    alternatives: [
      { id: 'alt-1', name: 'Keychron K3 Pro', price: 1250000, store: 'Tokopedia', link: 'https://tokopedia.com', note: 'Low profile mechanical keyboard' }
    ],
    savingsHistory: [
      { id: 'sh-1', date: '2026-09-15', amount: 500000, note: 'Alokasi awal' },
      { id: 'sh-2', date: '2026-09-25', amount: 500000, note: 'Gaji bulanan' },
      { id: 'sh-3', date: '2026-10-02', amount: 275000, note: 'Top up hemat' }
    ]
  },
  {
    id: '2',
    name: 'iPhone 16 128GB',
    brand: 'Apple',
    category: 'Elektronik & Gadget',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYi1DQ4kl2QOeeFRPQYkqUYdkZbTSa-NqTt5e7-aOYl5tXljfFw_ukWcPgslp_JuNlUL7IUsKJU7R7DDIC-RIeuDS2afsUO-LxiFeV-tNtjyS1z6OMY7gvDV05g8Q9BJWbmuqVQW4JHt-KFZdZVp93oSTRaXFyqMpMkZq_uC-pWumdIsN0cXx_CZyOPXAj1F-Lf-wgLYF2fGmt5v3JD4w69ne5QBTKYIoojCUTD2knEAPGh2TVtvplLg',
    price: 15499000,
    saved: 15499000,
    urgency: 4,
    want: 5,
    status: 'ready',
    deadline: '2026-10-10',
    daysLeft: '7 hari lagi!',
    sku: 'APL-IPH16-128',
    pros: ['Kamera 48MP', 'Chip A18 super kencang', 'Action button', 'Kapasitas baterai meningkat'],
    cons: ['Layar masih 60Hz'],
    alternatives: [],
    savingsHistory: [{ id: 'sh-ip1', date: '2026-09-01', amount: 15499000, note: 'Tabungan khusus gadget' }]
  },
  {
    id: '3',
    name: 'Samsung Galaxy Buds3 Pro',
    brand: 'Samsung',
    category: 'Audio & Komunikasi',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_j0I1j-Nf5DKq2POopj8w3pQ1_xUQf4TSWaE9MQJnKiE9sRDgpRJIYCdWEWbxROyptylqJanGTQNo0QdkVAMk_ktwmYKAZDIHTUj_iJUR-zUmNaxiQEwjdU0HCez4hIE05tZsdh5gHYlkqrXsiID0jOOsu4sYrPy7uGfGGCt3Scw0iyuG5P89bQB7UzkIhpErHE1JWd2s1Y9llRuXmjRwy5p1LGOJlJXT7AexS_ivwGIoPRKmZV1r5w',
    price: 3200000,
    saved: 1920000,
    urgency: 4,
    want: 4,
    status: 'saving',
    deadline: '2026-10-30',
    daysLeft: '27 hari lagi',
    sku: 'SAM-BUDS3P',
    pros: ['ANC sangat kedap', '24-bit Hi-Fi Audio', 'Desain blade futuristic', 'Mikrofon jernih'],
    cons: ['Fitur terbaik khusus ekosistem Samsung', 'Harga melambung'],
    alternatives: [],
    savingsHistory: [{ id: 'sh-gb1', date: '2026-09-20', amount: 1920000, note: 'Setoran tahap 1' }]
  },
  {
    id: '4',
    name: 'Monitor LG UltraFine 4K 27"',
    brand: 'LG',
    category: 'Elektronik & Setup',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2b0E-ZdvdzbPAIAGUp1CKskSIWCgU1To8Tu9hQmhXUwwQ6AqP2zYV1jydCdrJdzemRr53v2GuAkX2hSbQ0GZlgT-LpToOV9L4MZM7NwUwlE1E3NAjNFkBPaa88Ju8GnV01jhz3rynzcPJxlhxEmDhf0CCOql0Y-k7OEi9k277pbOuX5ESUsTeYKazch8j5e4J6CgvrIFYMSeGipkqmHzVTumqeOgGzzJDGU1r6o_T-AmMZh5fDBRVcA',
    price: 5500000,
    saved: 5500000,
    urgency: 4,
    want: 4,
    status: 'ready',
    deadline: '2026-10-15',
    daysLeft: '12 hari lagi',
    sku: 'LG-27UL850',
    pros: ['Resolusi Crisp 4K IPS', 'USB-C Charging 60W', 'Warna DCI-P3 95%'],
    cons: ['Stand bawaan agak besar'],
    alternatives: [],
    savingsHistory: []
  },
  {
    id: '5',
    name: 'Ergonomic Chair PEX V2',
    brand: 'PEX Furniture',
    category: 'Rumah Tangga & Setup',
    categorySlug: 'furnitur',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyBgoJL69K3ADtXqs23jwcM9N-8-a6bhMGk797fLaZPOyBgsJqQaB_ZiFbVS-uS6_2ei8RkD8PuKzDpf00Q8I9ebojTRDUtnE8ZzU9bZG-FJvd_odC_7SkDhjEjo3YEVy2H52LoxzXhFIiNj54Tul3iHgher-UGu6kout3kYqFD05-yIEg5zzyJuTQXNOt0l3iZ9h00BXzybYKgJBU9TroKcZBrdS90MUWu-nqKRVSim6Hkpq9ZzTyoA',
    price: 2800000,
    saved: 1400000,
    urgency: 3,
    want: 4,
    status: 'saving',
    deadline: '2026-11-05',
    daysLeft: '33 hari lagi',
    sku: 'PEX-CHR-V2',
    pros: ['Lumbar support 3D adjustable', 'Bahan mesh dingin', 'Armrest 4D', 'Sandaran kepala stabil'],
    cons: ['Merakit butuh waktu 30 menit', 'Bobot lumayan berat'],
    alternatives: [],
    savingsHistory: []
  },
  {
    id: '6',
    name: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQcl6he1yaEma1oF9SZjxfzHOhwgQn928vD9_DJWW86SNB3RAI31t-OdKj54MIIwuM6AqxEmKt7SyqgMuFxzRah1oOEL8vt-KstMp1k_zAebKSmlelv8RUiknXNC7MXd0AIgcYR1uHbbVG-4uniJc-DTxmiRUw8ozt5twYRdWbZ3zrBl_Tse81RSOP69_OgblmLLUnBVpTQsG-ygf46oC8teqreFavQa1lRnyFbIuzXyFGhxXqN0nFig',
    price: 2100000,
    saved: 4200000 * 0.1, // 420000
    urgency: 3,
    want: 5,
    status: 'want',
    deadline: '2026-10-28',
    daysLeft: '25 hari lagi',
    sku: 'NKE-AM90-INF',
    pros: ['Desain timeless klasik', 'Bantalan Air Unit empuk', 'Model versatile matching outfit'],
    cons: ['Outsole terasa sedikit kaku saat baru', 'Rentan kotor di bagian suede'],
    alternatives: [],
    savingsHistory: []
  },
  {
    id: '7',
    name: 'Coffee Grinder Timemore C3',
    brand: 'Timemore',
    category: 'Hobi & Kopi',
    categorySlug: 'hobi',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPnrW65YaxGpypwUgPeMnqO311FNtdNectnWd5Tlc2ZtwXzYj2FvsRDCi7ENLSKapgGX6wJbYnQyfqTOHrxHotu6fcrW8ag-2h6QHT67GoSLwVKRruTl9XkXYxj0kQABynpnRUUyQHtQvD2qLsSQD-bFHCtXB_cE3f3WNPbOWDmKTF7LWmsHBA6255gw64qaZyaJQSc7Gt9yy93VeivGme_oGKNe23SdJgCr98HaoBNcG0TqHL8Wcx9Q',
    price: 950000,
    saved: 0,
    urgency: 2,
    want: 4,
    status: 'want',
    deadline: '2026-11-15',
    daysLeft: '43 hari lagi',
    sku: 'TM-C3-BLK',
    pros: ['S2C Burr presisi tinggi', 'Body aluminium kokoh', 'Putaran sangat ringan'],
    cons: ['Kapasitas wadah hanya 25 gram'],
    alternatives: [],
    savingsHistory: []
  },
  {
    id: '8',
    name: 'MacBook Pro 14 M4',
    brand: 'Apple',
    tag: 'Impulsive',
    category: 'Elektronik & Laptop',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDA8bGYBDs5il9I8Oc1F8ZD2RgmgkaAHOunQCsmU0E57KSquCd6NOzP-p4o8BO_YrnMYNWhvhK0lfl_V6otpDF4EJwem4HaiTsYJfnUEyvo4OlcGTZD54ria5nHfrU4yX6tGg7N2XoDpry8CdQh7G-B9ldBW6aM6l6zup1zuCiC2u6VZBfxVPSPyNwTkn7XrF4yrkpkTJ63wB9C_KJEz0HRR10giN-B9waeUmAlJgUPZ4_up6bXwTVTiw',
    price: 28000000,
    saved: 1400000,
    urgency: 2,
    want: 5,
    status: 'want',
    deadline: '2026-10-06',
    daysLeft: '3 hari lagi!',
    sku: 'APL-MBP14-M4',
    pros: ['Performa M4 pro luar biasa', 'Layar Liquid Retina XDR 120Hz', 'Baterai hingga 22 jam'],
    cons: ['Harga sangat tinggi', 'Laptop M2 saat ini masih sangat layak', 'Risiko pengeluaran impulsif tinggi', 'RAM tidak bisa di-upgrade'],
    alternatives: [],
    savingsHistory: []
  },

  // Purchased items
  {
    id: 'p-1',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    category: 'Elektronik & Gadget',
    categorySlug: 'elektronik',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXJKokkjH_3MH8YRpP7dlE6yQRz7VIxqr3Du0Crl_99UbQUr5a9wo9Cy_BBYwzSFNDfYXHlB4DhG_Qh5PkCVdBGx8wJYDoFSGRP4rm7JqhikFeOSwRfzobsYmrk9Kw8gM6HD5P-fxUlUuj_8ge3FLzA2MCCMJOD_rJkzPHGQNJ6VdN5GDIcHaIp-BoZU0ePhuZejczY0upF4raV97hiqGctLCS1onrF1ajTVEoqbwgMl4zCp7yueH8rg',
    price: 1350000,
    saved: 1350000,
    urgency: 5,
    want: 5,
    status: 'purchased',
    deadline: '2026-09-28',
    boughtDate: '2026-09-28',
    savedAmount: 150000,
    pros: ['Quiet clicks', '8K DPI tracking', 'MagSpeed scroll wheel'],
    cons: ['Ukurannya sedikit besar untuk tangan kecil'],
    alternatives: [],
    savingsHistory: []
  },
  {
    id: 'p-2',
    name: 'Uniqlo Airism Oversized (3x)',
    brand: 'Uniqlo',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcLxcRFACIjGSCPcXO869g1Odjww3avXrTsPOVixrHSxvdfRXdpOk_aYkboqTAr30EaTRfg61JAD2SAJREnw_m8gtuHPeIjnl6DwZ3mEaptM80fWpS5J_yPEIhj3KQPlfGJcKpmt_61RrlVAnhMq4gwZv4GPl-5UaJOtIK75P-OS4Km7xuTumBtpTih4tTdp3cxOP4faSgfcKYwCqFKD-iKQwRuVrmo1qD61jyMrlSqZUt8o0WlCunnA',
    price: 450000,
    saved: 450000,
    urgency: 4,
    want: 4,
    status: 'purchased',
    deadline: '2026-09-28',
    boughtDate: '2026-09-28',
    pros: ['Bahan sangat adem', 'Potongan rapi'],
    cons: [],
    alternatives: [],
    savingsHistory: []
  }
];

const INITIAL_SKIPPED = [
  {
    id: 's-1',
    name: 'Hoodie Uniqlo Souffle Yarn',
    category: 'Fashion · Hoodie',
    originalPrice: 499000,
    reason: 'Audit lemari menunjukkan sudah ada 3 hoodie serupa dalam kondisi prima. Utility Score hanya 22/100.',
    status: 'skipped'
  },
  {
    id: 's-2',
    name: 'Smartwatch Gen 4 Active',
    category: 'Gadget · Smartwatch',
    originalPrice: 3400000,
    reason: 'Daya tahan baterai hanya 18 jam (ekspektasi minimal 48 jam). Watchlist cooling-off 30 hari berhasil meredam hype.',
    status: 'skipped'
  }
];

export const WishBoardProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('wishboard_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [skippedItems, setSkippedItems] = useState(() => {
    const saved = localStorage.getItem('wishboard_skipped');
    return saved ? JSON.parse(saved) : INITIAL_SKIPPED;
  });

  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('wishboard_weights');
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  useEffect(() => {
    localStorage.setItem('wishboard_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('wishboard_skipped', JSON.stringify(skippedItems));
  }, [skippedItems]);

  useEffect(() => {
    localStorage.setItem('wishboard_weights', JSON.stringify(weights));
  }, [weights]);

  // Priority Score Algorithm Calculation Function
  const calculatePriorityScore = (item, w = weights) => {
    const urgencyScore = (item.urgency / 5) * 100;
    const wantScore = (item.want / 5) * 100;
    const budgetRatio = Math.min(1, item.price > 0 ? (item.saved || 0) / item.price : 0);
    const budgetScore = budgetRatio * 100;

    const weightedScore =
      (urgencyScore * (w.urgency / 100)) +
      (wantScore * (w.want / 100)) +
      (budgetScore * (w.budget / 100));

    return Math.round(weightedScore);
  };

  // Decision Score Calculation (Pros vs Cons Ratio)
  const calculateDecisionScore = (item) => {
    const prosCount = item.pros ? item.pros.length : 0;
    const consCount = item.cons ? item.cons.length : 0;
    const total = prosCount + consCount;
    if (total === 0) return 50;
    return Math.round((prosCount / total) * 100);
  };

  // Helper to enrich item with calculated metrics
  const enrichItem = (item) => {
    const score = calculatePriorityScore(item);
    const decisionRatio = calculateDecisionScore(item);
    const readiness = Math.min(100, Math.round(item.price > 0 ? ((item.saved || 0) / item.price) * 100 : 0));

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

  // Enriched Items sorted/ranked
  const enrichedItems = items.map(enrichItem).sort((a, b) => b.score - a.score);

  // Top 3 Recommendations
  const topRecommendations = enrichedItems
    .filter(i => i.status === 'want' || i.status === 'saving' || i.status === 'ready')
    .slice(0, 3);

  // Actions
  const addItem = (newItem) => {
    const created = {
      id: Date.now().toString(),
      saved: 0,
      urgency: 3,
      want: 4,
      status: 'want',
      deadline: '2026-11-30',
      pros: [],
      cons: [],
      alternatives: [],
      savingsHistory: [],
      ...newItem
    };
    setItems(prev => [created, ...prev]);
  };

  const updateItemStatus = (id, newStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const addDeposit = (itemId, amount, note = 'Setoran manual') => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newSaved = (item.saved || 0) + amount;
        const newHistory = [
          ...(item.savingsHistory || []),
          { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount, note }
        ];
        const newStatus = (newSaved >= item.price && item.status === 'saving') ? 'ready' : item.status;
        return { ...item, saved: newSaved, status: newStatus, savingsHistory: newHistory };
      }
      return item;
    }));
  };

  const addPro = (itemId, text) => {
    if (!text || !text.trim()) return;
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, pros: [...(item.pros || []), text.trim()] };
      }
      return item;
    }));
  };

  const addCon = (itemId, text) => {
    if (!text || !text.trim()) return;
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, cons: [...(item.cons || []), text.trim()] };
      }
      return item;
    }));
  };

  const updateWeights = (newWeights) => {
    setWeights(newWeights);
  };

  const skipItem = (itemId, reason) => {
    const itemToSkip = items.find(i => i.id === itemId);
    if (!itemToSkip) return;

    setItems(prev => prev.filter(i => i.id !== itemId));
    setSkippedItems(prev => [
      {
        id: Date.now().toString(),
        name: itemToSkip.name,
        category: itemToSkip.category,
        originalPrice: itemToSkip.price,
        reason: reason || 'Keputusan dibatalkan oleh pengguna.',
        status: 'skipped'
      },
      ...prev
    ]);
  };

  return (
    <WishBoardContext.Provider value={{
      items: enrichedItems,
      skippedItems,
      weights,
      topRecommendations,
      addItem,
      updateItemStatus,
      addDeposit,
      addPro,
      addCon,
      updateWeights,
      skipItem,
      calculatePriorityScore
    }}>
      {children}
    </WishBoardContext.Provider>
  );
};

export const useWishBoard = () => useContext(WishBoardContext);
