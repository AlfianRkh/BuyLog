-- =========================================================
-- StockPantry & WishBoard - PostgreSQL Migration Schema for Supabase
-- Jalankan script SQL ini di Supabase Dashboard > SQL Editor
-- =========================================================

-- ---------------------------------------------------------
-- 1. TABEL ZONA PENYIMPANAN (Pantry Zones)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry_zones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,              -- mis. Kulkas Chiller, Freezer Beku, Rak Bumbu
  temperature_type VARCHAR(100),           -- mis. 2°C - 4°C, Suhu Beku (-18°C)
  description TEXT,                        -- Deskripsi peruntukan zona
  icon VARCHAR(50) DEFAULT 'Boxes',       -- Nama ikon Lucide
  color VARCHAR(20) DEFAULT '#10b981',     -- Hex warna identitas zona
  max_capacity INTEGER DEFAULT 50,         -- Kapasitas unit maksimal
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. TABEL INVENTARIS & KATALOG DAPUR (Pantry Items)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id INTEGER REFERENCES pantry_zones(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,              -- mis. Telur Ayam Negeri, Susu UHT 1L
  brand VARCHAR(150),                      -- mis. Ultra Milk, Bimoli
  ean_code VARCHAR(100),                   -- Barcode EAN-13 / UPC
  category VARCHAR(100) DEFAULT 'Lainnya', -- Makanan Segar, Minuman & Dairy, Bahan Pokok
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1, -- Stok fisik aktif
  max_quantity NUMERIC(10, 2) DEFAULT 5,   -- Target stok maksimal
  unit VARCHAR(50) DEFAULT 'Pcs',          -- Satuan: Butir, kg, Pouch, Botol, Kotak
  estimated_price NUMERIC(15, 2) DEFAULT 0,-- Perkiraan harga beli per unit
  expiry_date DATE,                        -- Tanggal kedaluwarsa
  image_url TEXT,                          -- Foto produk
  status VARCHAR(30) DEFAULT 'safe',       -- 'safe', 'low', 'empty', 'expiring', 'expired'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 3. TABEL SMART SHOPPING LIST & RESTOCK STUDIO
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry_shopping_list (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pantry_item_id INTEGER REFERENCES pantry_items(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,              -- Nama barang belanjaan
  sub_text VARCHAR(150),                   -- mis. 15 Butir / 1 Tray
  reason VARCHAR(150),                     -- mis. Auto Low-Stock (13%), Manual Restock
  preferred_store VARCHAR(150),            -- Superindo, Indomaret, Pasar
  estimated_price NUMERIC(15, 2) DEFAULT 0,
  is_checked BOOLEAN DEFAULT FALSE,        -- Status centang saat belanja
  is_manual BOOLEAN DEFAULT FALSE,         -- True jika diinput manual (bukan auto)
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 4. TABEL AUDIT LOG & RIWAYAT KONSUMSI
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry_consumption_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pantry_item_id INTEGER REFERENCES pantry_items(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,        -- 'konsumsi', 'restock', 'waste'
  quantity_change VARCHAR(50),             -- mis. '-2 Butir', '+15 Butir'
  stock_remaining VARCHAR(50),            -- mis. '2 Butir'
  location_name VARCHAR(150),              -- Kulkas Chiller, Lemari Dapur
  notes TEXT,                              -- Catatan pemakaian atau alasan buang
  financial_impact NUMERIC(15, 2) DEFAULT 0, -- Nilai rupiah restock / kerugian waste
  is_undone BOOLEAN DEFAULT FALSE,         -- Status pembatalan (Undo)
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 5. TABEL WISHLIST ENGINE (WishBoard Items)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishboard_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(150),
  category VARCHAR(100),
  category_slug VARCHAR(100),
  image_url TEXT,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  saved_amount NUMERIC(15, 2) DEFAULT 0,
  urgency_score INTEGER DEFAULT 3 CHECK (urgency_score BETWEEN 1 AND 5),
  want_score INTEGER DEFAULT 4 CHECK (want_score BETWEEN 1 AND 5),
  status VARCHAR(50) DEFAULT 'saving',     -- 'want', 'saving', 'ready', 'purchased', 'skipped'
  target_deadline DATE,
  sku VARCHAR(100),
  guarantee VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 6. TABEL HISTORI TABUNGAN WISHLIST
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishboard_savings_history (
  id SERIAL PRIMARY KEY,
  wish_item_id INTEGER NOT NULL REFERENCES wishboard_items(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- INDEXES UNTUK OPTIMASI PERFORMA QUERY
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_zone ON pantry_items(user_id, zone_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_status ON pantry_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry ON pantry_items(user_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON pantry_shopping_list(user_id, is_checked);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_user ON pantry_consumption_logs(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_wishboard_items_user_status ON wishboard_items(user_id, status);
