const db = require('../config/database');

class User {
  static async create({ name, email, passwordHash, avatar = null }) {
    const query = `
      INSERT INTO users (name, email, password_hash, avatar)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, avatar, created_at, updated_at
    `;
    const { rows } = await db.query(query, [name, email, passwordHash, avatar]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query(
      'SELECT id, name, email, avatar, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  static async update(id, { name, avatar }) {
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name), 
          avatar = COALESCE($2, avatar),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, avatar, created_at, updated_at
    `;
    const { rows } = await db.query(query, [name, avatar, id]);
    return rows[0] || null;
  }

  static async updatePassword(id, passwordHash) {
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    return db.query(query, [passwordHash, id]);
  }
}

module.exports = User;
