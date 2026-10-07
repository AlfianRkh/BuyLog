const db = require('../config/database');

async function runMigrations() {
  console.log('Running PostgreSQL database migrations...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT 'Package',
      color VARCHAR(20) DEFAULT '#3B82F6',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      city VARCHAR(100) NOT NULL,
      province VARCHAR(100),
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      address TEXT,
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      store_type VARCHAR(50) DEFAULT 'fisik', -- 'fisik', 'online', 'marketplace'
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      model VARCHAR(100),
      description TEXT,
      photo_url TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(100),
      store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      payment_method VARCHAR(50) DEFAULT 'Tunai',
      notes TEXT,
      total_amount NUMERIC(15, 2) DEFAULT 0,
      purchase_date TIMESTAMPTZ NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(15, 2) NOT NULL,
      subtotal NUMERIC(15, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_histories (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
      purchase_item_id INTEGER REFERENCES purchase_items(id) ON DELETE SET NULL,
      old_price NUMERIC(15, 2) NOT NULL,
      new_price NUMERIC(15, 2) NOT NULL,
      price_change NUMERIC(15, 2) NOT NULL,
      price_change_pct NUMERIC(8, 2) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_user_date ON purchases(user_id, purchase_date);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_price_histories_product ON price_histories(product_id);

    -- DebtTracker User Settings Columns
    ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_summary_template TEXT DEFAULT 'Halo {contact_name}, berikut catatan rekap pinjaman kita per {date}:

📌 Catatan pinjaman ke saya:
{piutang_list}

📌 Catatan pinjaman saya ke kamu:
{hutang_list}

💵 Posisi Saldo Bersih:
{net_summary}

Nomor Rekening Pembayaran:
{bank_account}

Terima kasih banyak ya! Semoga lancar rezekinya.';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS default_payment_method VARCHAR(50) DEFAULT 'Transfer Bank';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_info TEXT DEFAULT 'BCA: 5410-2391-09 a/n Alfian S.';

    -- DebtTracker Tables
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      notes TEXT,
      total_hutang NUMERIC(15, 2) DEFAULT 0,
      total_piutang NUMERIC(15, 2) DEFAULT 0,
      active_debt_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS debts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      type VARCHAR(20) NOT NULL CHECK(type IN ('hutang', 'piutang')),
      amount NUMERIC(15, 2) NOT NULL,
      remaining NUMERIC(15, 2) NOT NULL,
      description TEXT,
      debt_date DATE NOT NULL,
      due_date DATE,
      payment_method VARCHAR(50),
      status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'overdue', 'settled', 'cancelled')),
      proof_url TEXT,
      notes TEXT,
      settled_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      cancel_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS debt_payments (
      id SERIAL PRIMARY KEY,
      debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
      amount NUMERIC(15, 2) NOT NULL,
      remaining_after NUMERIC(15, 2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_method VARCHAR(50),
      proof_url TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS debt_activity_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      debt_id INTEGER REFERENCES debts(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_debts_user_status ON debts(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_debts_contact ON debts(contact_id);
    CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);

    -- PriceRadar Tables
    CREATE TABLE IF NOT EXISTS price_radar_watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      brand VARCHAR(100),
      category VARCHAR(100),
      edition VARCHAR(255),
      image_url TEXT,
      current_price NUMERIC(15, 2) NOT NULL,
      target_price NUMERIC(15, 2) NOT NULL,
      store_name VARCHAR(150),
      deal_score NUMERIC(4, 1) DEFAULT 7.5,
      status VARCHAR(20) DEFAULT 'watching' CHECK(status IN ('watching', 'hit', 'bought', 'canceled')),
      is_atl BOOLEAN DEFAULT FALSE,
      min_price NUMERIC(15, 2),
      max_price NUMERIC(15, 2),
      url TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE price_radar_watchlist ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

    CREATE TABLE IF NOT EXISTS price_radar_logs (
      id SERIAL PRIMARY KEY,
      watchlist_id INTEGER REFERENCES price_radar_watchlist(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform_name VARCHAR(150) NOT NULL,
      price NUMERIC(15, 2) NOT NULL,
      notes TEXT,
      proof_url TEXT,
      recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_radar_sources (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      type VARCHAR(50) DEFAULT 'MARKETPLACE',
      url TEXT,
      win_rate VARCHAR(50),
      price_logs_count INTEGER DEFAULT 0,
      activity_status VARCHAR(50) DEFAULT 'Aktif',
      is_stale BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_priceradar_watchlist_user ON price_radar_watchlist(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_priceradar_logs_user ON price_radar_logs(user_id);

    -- SmartFin Accounts Table
    CREATE TABLE IF NOT EXISTS smartfin_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      type VARCHAR(50) DEFAULT 'Bank',
      number VARCHAR(100),
      balance NUMERIC(15, 2) DEFAULT 0,
      color VARCHAR(20) DEFAULT '#3b82f6',
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_smartfin_accounts_user ON smartfin_accounts(user_id, is_default);

    -- SmartFin Master Categories Table
    CREATE TABLE IF NOT EXISTS smartfin_categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      icon VARCHAR(50) DEFAULT '🏷️',
      type VARCHAR(50) DEFAULT 'Pengeluaran',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_smartfin_categories_user ON smartfin_categories(user_id);
  `);

  console.log('PostgreSQL database migrations completed successfully.');
}

module.exports = { runMigrations };
