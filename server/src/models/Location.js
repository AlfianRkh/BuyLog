const db = require('../config/database');

class Location {
  static async create({ city, province = null, latitude = null, longitude = null, userId }) {
    const query = `
      INSERT INTO locations (city, province, latitude, longitude, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await db.query(query, [city, province, latitude, longitude, userId]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query('SELECT * FROM locations WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findByCity(city, userId) {
    const { rows } = await db.query(`
      SELECT * FROM locations 
      WHERE LOWER(city) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
    `, [city, userId]);
    return rows[0] || null;
  }

  static async findOrCreate({ city, province, latitude, longitude, userId }) {
    if (!city || !city.trim()) return null;
    let location = await this.findByCity(city.trim(), userId);
    if (!location) {
      location = await this.create({ city: city.trim(), province, latitude, longitude, userId });
    }
    return location;
  }

  static async findAll(userId) {
    const { rows } = await db.query(`
      SELECT l.*,
        (SELECT COUNT(*) FROM stores s WHERE s.location_id = l.id) as store_count
      FROM locations l
      WHERE l.user_id = $1 OR l.user_id IS NULL
      ORDER BY l.city ASC
    `, [userId]);
    return rows;
  }
}

module.exports = Location;
