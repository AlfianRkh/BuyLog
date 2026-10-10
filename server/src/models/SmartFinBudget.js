const db = require('../config/database');

class SmartFinBudget {
  static async getBudgets(userId = 1) {
    const query = `
      SELECT 
        id, name, limit_amount::float as limit, spent_amount::float as spent,
        icon, category
      FROM smartfin_budgets
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY id ASC
    `;
    const { rows } = await db.query(query, [userId]);

    // Seed default envelope budgets if 0 exist in DB
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO smartfin_budgets (user_id, name, limit_amount, spent_amount, icon, category)
        VALUES 
          ($1, '🥫 Kebutuhan Dapur & Bahan', 2500000, 1850000, '🥫', 'Pokok'),
          ($1, '🍽️ Makan Luar & Resto', 1200000, 980000, '🍽️', 'Pokok'),
          ($1, '⚡ Tagihan & Utilitas', 800000, 620000, '⚡', 'Pokok'),
          ($1, '🚗 Bensin & Transport', 600000, 250000, '🚗', 'Pokok'),
          ($1, '☕ Kafe & Hiburan', 500000, 150000, '☕', 'Keinginan'),
          ($1, '🛡️ Dana Darurat & Investasi', 900000, 0, '🛡️', 'Tabungan')
      `, [userId]);

      const res = await db.query(query, [userId]);
      return res.rows.map(this.formatBudget);
    }

    return rows.map(this.formatBudget);
  }

  static formatBudget(r) {
    return {
      id: r.id.toString(),
      dbId: r.id,
      name: r.name,
      limit: parseFloat(r.limit) || 0,
      spent: parseFloat(r.spent) || 0,
      icon: r.icon || '💼',
      category: r.category || 'Pokok'
    };
  }

  static async createBudget({ name, limit, spent = 0, icon, category, userId = 1 }) {
    await db.query(`
      INSERT INTO smartfin_budgets (user_id, name, limit_amount, spent_amount, icon, category)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      name.trim(),
      Number(limit) || 0,
      Number(spent) || 0,
      icon || '💼',
      category || 'Pokok'
    ]);

    return this.getBudgets(userId);
  }

  static async updateSpent(categoryOrName, amount, userId = 1) {
    const budgets = await this.getBudgets(userId);
    const target = budgets.find(b => 
      b.name.toLowerCase().includes(categoryOrName.toLowerCase()) || 
      categoryOrName.toLowerCase().includes(b.category.toLowerCase())
    );

    if (target) {
      await db.query(`
        UPDATE smartfin_budgets
        SET spent_amount = spent_amount + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [amount, target.dbId]);
    }

    return this.getBudgets(userId);
  }

  static async applyRule503020(salary, userId = 1) {
    const total = Number(salary) || 5000000;
    const needsLimit = Math.round(total * 0.50);
    const wantsLimit = Math.round(total * 0.30);
    const savingsLimit = Math.round(total * 0.20);

    // Reset or update standard budgets
    await db.query(`
      DELETE FROM smartfin_budgets WHERE user_id = $1 OR user_id IS NULL
    `, [userId]);

    await db.query(`
      INSERT INTO smartfin_budgets (user_id, name, limit_amount, spent_amount, icon, category)
      VALUES 
        ($1, '🥫 Pos Kebutuhan Pokok (50%)', $2, 0, '🏠', 'Pokok'),
        ($1, '☕ Pos Keinginan & Gaya Hidup (30%)', $3, 0, '☕', 'Keinginan'),
        ($1, '🛡️ Pos Tabungan & Investasi (20%)', $4, 0, '📈', 'Tabungan')
    `, [userId, needsLimit, wantsLimit, savingsLimit]);

    return this.getBudgets(userId);
  }

  static async deleteBudget(id, userId = 1) {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId) && numericId > 0) {
      await db.query(`
        DELETE FROM smartfin_budgets WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      `, [numericId, userId]);
    } else {
      await db.query(`
        DELETE FROM smartfin_budgets WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
      `, [id.toString().trim(), userId]);
    }

    return this.getBudgets(userId);
  }
}

module.exports = SmartFinBudget;
