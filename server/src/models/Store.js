const db = require('../config/database');

class Store {
  static async create({ name, address = null, locationId = null, storeType = 'fisik', userId }, client = null) {
    const queryExecutor = client || db;
    const query = `
      INSERT INTO stores (name, address, location_id, store_type, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await queryExecutor.query(query, [name, address, locationId, storeType, userId]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query(`
      SELECT s.*, l.city, l.province, l.latitude, l.longitude
      FROM stores s
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE s.id = $1
    `, [id]);
    return rows[0] || null;
  }

  static async findByName(name, userId, client = null) {
    const queryExecutor = client || db;
    const { rows } = await queryExecutor.query(`
      SELECT s.*, l.city, l.province
      FROM stores s
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE LOWER(s.name) = LOWER($1) AND (s.user_id = $2 OR s.user_id IS NULL)
    `, [name, userId]);
    return rows[0] || null;
  }

  static async findOrCreate({ name, address, locationId, storeType = 'fisik', userId }, client = null) {
    if (!name || !name.trim()) return null;
    let store = await this.findByName(name.trim(), userId, client);
    if (!store) {
      store = await this.create({ name: name.trim(), address, locationId, storeType, userId }, client);
    }
    return store;
  }

  static async findAll(userId) {
    const { rows } = await db.query(`
      SELECT s.*, l.city, l.province, l.latitude, l.longitude,
        (SELECT COUNT(*) FROM purchases p WHERE p.store_id = s.id) as purchase_count
      FROM stores s
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE s.user_id = $1 OR s.user_id IS NULL
      ORDER BY s.name ASC
    `, [userId]);
    return rows;
  }

  static async update(id, userId, { name, address, locationId, storeType }) {
    const query = `
      UPDATE stores
      SET name = COALESCE($1, name),
          address = COALESCE($2, address),
          location_id = COALESCE($3, location_id),
          store_type = COALESCE($4, store_type)
      WHERE id = $5 AND (user_id = $6 OR user_id IS NULL)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, address, locationId, storeType, id, userId]);
    return rows[0] || null;
  }

  static async delete(id, userId) {
    return db.query('DELETE FROM stores WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}

module.exports = Store;
