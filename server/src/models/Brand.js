const db = require('../config/database');

class Brand {
  static async create({ name, userId }) {
    const query = `
      INSERT INTO brands (name, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, userId]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query('SELECT * FROM brands WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findByName(name, userId) {
    const { rows } = await db.query(`
      SELECT * FROM brands 
      WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
    `, [name, userId]);
    return rows[0] || null;
  }

  static async findOrCreate(name, userId) {
    if (!name || !name.trim()) return null;
    let brand = await this.findByName(name.trim(), userId);
    if (!brand) {
      brand = await this.create({ name: name.trim(), userId });
    }
    return brand;
  }

  static async findAll(userId) {
    const { rows } = await db.query(`
      SELECT b.*,
        (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) as product_count
      FROM brands b
      WHERE b.user_id = $1 OR b.user_id IS NULL
      ORDER BY b.name ASC
    `, [userId]);
    return rows;
  }

  static async update(id, userId, { name }) {
    const query = `
      UPDATE brands
      SET name = $1
      WHERE id = $2 AND (user_id = $3 OR user_id IS NULL)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, id, userId]);
    return rows[0] || null;
  }

  static async delete(id, userId) {
    return db.query('DELETE FROM brands WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}

module.exports = Brand;
