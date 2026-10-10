const db = require('../config/database');

class Category {
  static async create({ name, icon = '🏷️', color = '#3B82F6', type = 'Pengeluaran', feature = 'shopping', userId }) {
    const query = `
      INSERT INTO categories (name, icon, color, type, feature, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      name.trim(),
      icon || '🏷️',
      color || '#3B82F6',
      type || 'Pengeluaran',
      feature || 'shopping',
      userId
    ]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findByName(name, userId, feature = null) {
    let query = `
      SELECT * FROM categories 
      WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
    `;
    const params = [name, userId];
    if (feature && feature !== 'all') {
      params.push(feature);
      query += ` AND feature = $${params.length}`;
    }
    const { rows } = await db.query(query, params);
    return rows[0] || null;
  }

  static async findAll(userId, feature = null) {
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE (c.user_id = $1 OR c.user_id IS NULL)
    `;
    const params = [userId];

    if (feature && feature !== 'all') {
      params.push(feature);
      query += ` AND c.feature = $${params.length}`;
    }

    query += ` ORDER BY c.id ASC`;

    let { rows } = await db.query(query, params);

    // Seed default categories for specific feature if 0 exist for user
    if (rows.length === 0 && feature && feature !== 'all') {
      await this.seedDefaultCategories(userId, feature);
      const reFetch = await db.query(query, params);
      rows = reFetch.rows;
    }

    return rows;
  }

  static async seedDefaultCategories(userId, feature) {
    if (feature === 'smartfin') {
      await db.query(`
        INSERT INTO categories (user_id, name, icon, type, feature)
        VALUES 
          ($1, 'Kebutuhan Dapur & Sembako', '🥫', 'Pengeluaran', 'smartfin'),
          ($1, 'Makanan, Kafe & Resto', '☕', 'Pengeluaran', 'smartfin'),
          ($1, 'Transportasi & Bensin', '🚗', 'Pengeluaran', 'smartfin'),
          ($1, 'Perlengkapan Rumah', '🧼', 'Pengeluaran', 'smartfin'),
          ($1, 'Tagihan & Utilitas', '⚡', 'Pengeluaran', 'smartfin'),
          ($1, 'Gaji & Pemasukan Tetap', '💼', 'Pemasukan', 'smartfin')
      `, [userId]);
    } else if (feature === 'price_radar') {
      await db.query(`
        INSERT INTO categories (user_id, name, icon, type, feature)
        VALUES 
          ($1, 'Elektronik & Gadget', '📱', 'Watching', 'price_radar'),
          ($1, 'Fashion & Sepatu', '👕', 'Watching', 'price_radar'),
          ($1, 'Groceries & FMCG', '🛒', 'Watching', 'price_radar'),
          ($1, 'Rumah Tangga & Hobi', '🏠', 'Watching', 'price_radar'),
          ($1, 'Otomotif & Aksesori', '🚗', 'Watching', 'price_radar'),
          ($1, 'Lainnya', '📦', 'Watching', 'price_radar')
      `, [userId]);
    } else if (feature === 'shopping') {
      await db.query(`
        INSERT INTO categories (user_id, name, icon, color, type, feature)
        VALUES 
          ($1, 'Belanja Harian', '🛍️', '#3B82F6', 'General', 'shopping'),
          ($1, 'Elektronik', '💻', '#8B5CF6', 'General', 'shopping'),
          ($1, 'Pakaian', '👔', '#EC4899', 'General', 'shopping'),
          ($1, 'Peralatan Rumah', '🏠', '#10B981', 'General', 'shopping')
      `, [userId]);
    }
  }

  static async update(id, userId, { name, icon, color, type, feature }) {
    const query = `
      UPDATE categories
      SET name = COALESCE($1, name),
          icon = COALESCE($2, icon),
          color = COALESCE($3, color),
          type = COALESCE($4, type),
          feature = COALESCE($5, feature)
      WHERE id = $6 AND (user_id = $7 OR user_id IS NULL)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, icon, color, type, feature, id, userId]);
    return rows[0] || null;
  }

  static async delete(id, userId) {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      return db.query('DELETE FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [numericId, userId]);
    } else {
      return db.query('DELETE FROM categories WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
    }
  }
}

module.exports = Category;
