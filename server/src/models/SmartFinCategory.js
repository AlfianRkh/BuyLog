const db = require('../config/database');

class SmartFinCategory {
  static async getCategories(userId = 1) {
    const query = `
      SELECT id, name, icon, type
      FROM smartfin_categories
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY id ASC
    `;
    const { rows } = await db.query(query, [userId]);

    // Seed default master categories if 0 exist for user
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO smartfin_categories (user_id, name, icon, type)
        VALUES 
          ($1, 'Kebutuhan Dapur & Sembako', '🥫', 'Pengeluaran'),
          ($1, 'Makanan, Kafe & Resto', '☕', 'Pengeluaran'),
          ($1, 'Transportasi & Bensin', '🚗', 'Pengeluaran'),
          ($1, 'Perlengkapan Rumah', '🧼', 'Pengeluaran'),
          ($1, 'Tagihan & Utilitas', '⚡', 'Pengeluaran'),
          ($1, 'Gaji & Pemasukan Tetap', '💼', 'Pemasukan')
      `, [userId]);

      const res = await db.query(query, [userId]);
      return res.rows.map(this.formatCategory);
    }

    return rows.map(this.formatCategory);
  }

  static formatCategory(r) {
    return {
      id: r.id.toString(),
      dbId: r.id,
      name: r.name,
      icon: r.icon || '🏷️',
      type: r.type || 'Pengeluaran'
    };
  }

  static async createCategory({ name, icon, type, userId = 1 }) {
    if (!name || !name.trim()) {
      throw new Error('Nama kategori wajib diisi.');
    }

    await db.query(`
      INSERT INTO smartfin_categories (user_id, name, icon, type)
      VALUES ($1, $2, $3, $4)
    `, [
      userId,
      name.trim(),
      icon || '🏷️',
      type || 'Pengeluaran'
    ]);

    return this.getCategories(userId);
  }

  static async deleteCategory(id, userId = 1) {
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId) && numericId > 0) {
      await db.query(`
        DELETE FROM smartfin_categories 
        WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      `, [numericId, userId]);
    } else {
      await db.query(`
        DELETE FROM smartfin_categories 
        WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
      `, [id.toString().trim(), userId]);
    }

    return this.getCategories(userId);
  }
}

module.exports = SmartFinCategory;
