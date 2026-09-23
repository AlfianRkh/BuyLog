const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function runSeeds() {
  console.log('Running PostgreSQL database seeds...');

  // Check if default user exists
  const existingUserRes = await db.query('SELECT id FROM users WHERE email = $1', ['alfian@example.com']);
  if (existingUserRes.rows.length > 0) {
    console.log('PostgreSQL database already seeded. Skipping.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  // Insert Demo User
  const userRes = await db.query(`
    INSERT INTO users (name, email, password_hash, avatar)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, ['Alfian', 'alfian@example.com', passwordHash, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80']);
  
  const userId = userRes.rows[0].id;

  // Insert Default Categories
  const insertCat = async (name, icon, color) => {
    const res = await db.query(`
      INSERT INTO categories (name, icon, color, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [name, icon, color, userId]);
    return res.rows[0].id;
  };

  const catElektronik = await insertCat('Elektronik', 'Smartphone', '#3B82F6');
  const catMakanan = await insertCat('Makanan', 'Utensils', '#F59E0B');
  const catRumahTangga = await insertCat('Rumah Tangga', 'Home', '#10B981');
  const catPakaian = await insertCat('Pakaian', 'Shirt', '#EC4899');
  const catLainnya = await insertCat('Lainnya', 'Package', '#8B5CF6');

  // Insert Brands
  const insertBrand = async (name) => {
    const res = await db.query(`
      INSERT INTO brands (name, user_id)
      VALUES ($1, $2)
      RETURNING id
    `, [name, userId]);
    return res.rows[0].id;
  };

  const brandLogitech = await insertBrand('Logitech');
  const brandBimoli = await insertBrand('Bimoli');
  const brandUGREEN = await insertBrand('UGREEN');
  const brandNevada = await insertBrand('Nevada');
  const brandBaseus = await insertBrand('Baseus');
  const brandGoodDay = await insertBrand('Good Day');
  const brandPepsodent = await insertBrand('Pepsodent');
  const brandMituBaby = await insertBrand('Mitu Baby');

  // Insert Locations
  const insertLocation = async (city, province, latitude, longitude) => {
    const res = await db.query(`
      INSERT INTO locations (city, province, latitude, longitude, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [city, province, latitude, longitude, userId]);
    return res.rows[0].id;
  };

  const locSby = await insertLocation('Surabaya', 'Jawa Timur', -7.2575, 112.7521);
  const locJkt = await insertLocation('Jakarta', 'DKI Jakarta', -6.2088, 106.8456);
  const locOnline = await insertLocation('Online', 'Indonesia', -7.2575, 112.7521);

  // Insert Stores
  const insertStore = async (name, address, locationId, storeType) => {
    const res = await db.query(`
      INSERT INTO stores (name, address, location_id, store_type, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [name, address, locationId, storeType, userId]);
    return res.rows[0].id;
  };

  const storeTokopedia = await insertStore('Tokopedia', 'Marketplace Online', locOnline, 'marketplace');
  const storeShopee = await insertStore('Shopee', 'Marketplace Online', locOnline, 'marketplace');
  const storeIndomaret = await insertStore('Indomaret', 'Jl. Raya Darmo No. 45', locSby, 'fisik');
  const storeAlfamart = await insertStore('Alfamart', 'Jl. Basuki Rahmat No. 12', locSby, 'fisik');
  const storeTokoKomputerABC = await insertStore('Toko Komputer ABC', 'Jl. Ahmad Yani No. 123', locSby, 'fisik');

  // Insert Products
  const insertProduct = async (name, brandId, categoryId, model, description, photoUrl) => {
    const res = await db.query(`
      INSERT INTO products (name, brand_id, category_id, model, description, photo_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [name, brandId, categoryId, model, description, photoUrl, userId]);
    return res.rows[0].id;
  };

  const pMouse = await insertProduct(
    'Mouse Wireless',
    brandLogitech,
    catElektronik,
    'M331',
    'Mouse wireless silent click hemat baterai',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80'
  );

  const pMinyak = await insertProduct(
    'Minyak Goreng 2L',
    brandBimoli,
    catMakanan,
    'Refill 2 Liter',
    'Minyak kelapa sawit murni',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80'
  );

  const pKabel = await insertProduct(
    'Kabel LAN Cat 6',
    brandUGREEN,
    catElektronik,
    'Cat6 5M',
    'Kabel jaringan RJ45 kecepatan gigabit',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'
  );

  const pTShirt = await insertProduct(
    'T-Shirt Polos',
    brandNevada,
    catPakaian,
    'Cotton Combed 30s',
    'Kaos polos bahan adem dan nyaman',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'
  );

  const pPowerbank = await insertProduct(
    'Power Bank 10000mAh',
    brandBaseus,
    catElektronik,
    'Bipow 20W',
    'Power bank fast charging dual output',
    'https://images.unsplash.com/photo-1609592426868-b7e6fbe538b7?w=300&auto=format&fit=crop&q=80'
  );

  const pKopi = await insertProduct(
    'Kopi Instan Mocacinno',
    brandGoodDay,
    catMakanan,
    'Pack 10 Sachet',
    'Kopi bubuk instan rasa coklat',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80'
  );

  const pSikatGigi = await insertProduct(
    'Sikat Gigi Double Action',
    brandPepsodent,
    catRumahTangga,
    'Medium 3 Pcs',
    'Bulu sikat halus membersihkan sela gigi',
    'https://images.unsplash.com/photo-1559591937-e1032a24fa6a?w=300&auto=format&fit=crop&q=80'
  );

  const pTisu = await insertProduct(
    'Tisu Basah Antiseptik',
    brandMituBaby,
    catRumahTangga,
    '50 Sheets',
    'Tisu basah non alkohol harum segar',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
  );

  // Insert Purchases & Items helper
  const insertPurchase = async (inv, storeId, lat, lng, payMethod, notes, total, date) => {
    const res = await db.query(`
      INSERT INTO purchases (invoice_number, store_id, latitude, longitude, payment_method, notes, total_amount, purchase_date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [inv, storeId, lat, lng, payMethod, notes, total, date, userId]);
    return res.rows[0].id;
  };

  const insertItem = async (purchaseId, productId, qty, price, subtotal, notes) => {
    const res = await db.query(`
      INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [purchaseId, productId, qty, price, subtotal, notes]);
    return res.rows[0].id;
  };

  const insertPriceHist = async (prodId, storeId, piId, oldP, newP, change, pct, recordedAt) => {
    await db.query(`
      INSERT INTO price_histories (product_id, store_id, purchase_item_id, old_price, new_price, price_change, price_change_pct, user_id, recorded_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [prodId, storeId, piId, oldP, newP, change, pct, userId, recordedAt]);
  };

  // 1. Mouse Logitech di Tokopedia
  const p1 = await insertPurchase('INV/20260923/001', storeTokopedia, -7.2575, 112.7521, 'QRIS', 'Mouse untuk laptop kantor', 250000, '2026-09-23 14:30:00');
  const pi1 = await insertItem(p1, pMouse, 1, 250000, 250000, 'Warna hitam');

  // 2. Minyak Goreng di Indomaret
  const p2 = await insertPurchase('INV/20260922/002', storeIndomaret, -7.2891, 112.7384, 'Tunai', 'Belanja kebutuhan dapur bulanan', 38000, '2026-09-22 10:15:00');
  const pi2 = await insertItem(p2, pMinyak, 1, 38000, 38000, null);

  // 3. Kabel LAN di Toko Komputer ABC
  const p3 = await insertPurchase('INV/20260920/003', storeTokoKomputerABC, -7.3156, 112.7298, 'Transfer Bank', 'Kabel LAN ruang kerja', 45000, '2026-09-20 16:45:00');
  await insertItem(p3, pKabel, 1, 45000, 45000, null);

  // 4. T-Shirt di Shopee
  const p4 = await insertPurchase('INV/20260918/004', storeShopee, -7.2575, 112.7521, 'E-Wallet', 'Baju harian warna navy', 75000, '2026-09-18 19:20:00');
  await insertItem(p4, pTShirt, 1, 75000, 75000, null);

  // 5. Power Bank di Tokopedia
  const p5 = await insertPurchase('INV/20260915/005', storeTokopedia, -7.2575, 112.7521, 'QRIS', 'Cadangan daya saat traveling', 199000, '2026-09-15 11:00:00');
  await insertItem(p5, pPowerbank, 1, 199000, 199000, null);

  // 6. Kopi Instan di Alfamart
  const p6 = await insertPurchase('INV/20260912/006', storeAlfamart, -7.2655, 112.7482, 'Tunai', 'Stok kopi mingguan', 13500, '2026-09-12 08:30:00');
  await insertItem(p6, pKopi, 1, 13500, 13500, null);

  // 7. Sikat Gigi di Indomaret
  const p7 = await insertPurchase('INV/20260910/007', storeIndomaret, -7.2891, 112.7384, 'Tunai', 'Perlengkapan mandi', 8000, '2026-09-10 17:10:00');
  await insertItem(p7, pSikatGigi, 1, 8000, 8000, null);

  // 8. Tisu Basah di Indomaret
  const p8 = await insertPurchase('INV/20260905/008', storeIndomaret, -7.2891, 112.7384, 'QRIS', 'Tisu basah mobil', 17500, '2026-09-05 13:40:00');
  await insertItem(p8, pTisu, 1, 17500, 17500, null);

  // Previous purchases for price comparison & history test:
  // Previous purchase of Mouse Wireless at Toko Komputer ABC on 10 Aug 2026 (Rp 275.000)
  const prevP1 = await insertPurchase('INV/20260810/010', storeTokoKomputerABC, -7.3156, 112.7298, 'Tunai', 'Beli mouse pertama kali', 275000, '2026-08-10 14:00:00');
  await insertItem(prevP1, pMouse, 1, 275000, 275000, null);

  // Price history record for Mouse Wireless
  await insertPriceHist(pMouse, storeTokopedia, pi1, 275000, 250000, -25000, -9.09, '2026-09-23 14:30:00');

  // Previous purchase of Minyak Goreng at Alfamart on 01 Sep 2026 (Rp 35.000)
  const prevP2 = await insertPurchase('INV/20260901/011', storeAlfamart, -7.2655, 112.7482, 'Tunai', 'Beli minyak goreng promo', 35000, '2026-09-01 09:00:00');
  await insertItem(prevP2, pMinyak, 1, 35000, 35000, null);

  // Price history record for Minyak Goreng (naik dari 35rb ke 38rb)
  await insertPriceHist(pMinyak, storeIndomaret, pi2, 35000, 38000, 3000, 8.57, '2026-09-22 10:15:00');

  // Previous purchase of Minyak Goreng at Tokopedia (Rp 34.000)
  const prevP3 = await insertPurchase('INV/20260815/012', storeTokopedia, -7.2575, 112.7521, 'QRIS', 'Beli minyak goreng online', 34000, '2026-08-15 15:00:00');
  await insertItem(prevP3, pMinyak, 1, 34000, 34000, null);

  console.log('PostgreSQL database seeds completed successfully.');
}

module.exports = { runSeeds };
