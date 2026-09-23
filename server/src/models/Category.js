const db = require('../config/database');

class Category {
  static async create({ name, icon = 'Package', color = '#3B82F6', userId }) {
    const query = `
      INSERT INTO categories (name, icon, color, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, icon, color, userId]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findByName(name, userId) {
    const { rows } = await db.query(`
      SELECT * FROM categories 
      WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
    `, [name, userId]);
    return rows[0] || null;
  }

  static async findAll(userId) {
    const { rows } = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.user_id = $1 OR c.user_id IS NULL
      ORDER BY c.name ASC
    `, [userId]);
    return rows;
  }

  static async update(id, userId, { name, icon, color }) {
    const query = `
      UPDATE categories
      SET name = COALESCE($1, name),
          icon = COALESCE($2, icon),
          color = COALESCE($3, color)
      WHERE id = $4 AND (user_id = $5 OR user_id IS NULL)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, icon, color, id, userId]);
    return rows[0] || null;
  }

  static async delete(id, userId) {
    return db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}

module.exports = Category;
