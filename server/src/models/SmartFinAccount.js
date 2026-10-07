const db = require('../config/database');

class SmartFinAccount {
  static async getAccounts(userId = 1) {
    const query = `
      SELECT id, name, type, number, balance::float, color, is_default
      FROM smartfin_accounts
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY is_default DESC, id ASC
    `;
    const { rows } = await db.query(query, [userId]);

    // Seed initial database rows if 0 accounts exist for user
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO smartfin_accounts (user_id, name, type, number, balance, color, is_default)
        VALUES 
          ($1, 'BCA Utama', 'Bank', '5410-8891-2291', 12800000, '#3b82f6', TRUE),
          ($1, 'GoPay Premium', 'E-Wallet', '0812-8899-2341', 950000, '#06b6d4', FALSE),
          ($1, 'Kas Tunai Dompet', 'Cash', 'Dompet Saku', 500000, '#10b981', FALSE)
      `, [userId]);

      const res = await db.query(query, [userId]);
      return res.rows.map(this.formatAccount);
    }

    return rows.map(this.formatAccount);
  }

  static formatAccount(r) {
    return {
      id: r.id.toString(),
      dbId: r.id,
      name: r.name,
      type: r.type,
      number: r.number,
      balance: parseFloat(r.balance) || 0,
      color: r.color,
      isDefault: Boolean(r.is_default)
    };
  }

  static async getDefaultAccount(userId = 1) {
    const accounts = await this.getAccounts(userId);
    return accounts.find(a => a.isDefault) || accounts[0] || null;
  }

  static async setDefaultAccount(accountIdOrName, userId = 1) {
    if (!accountIdOrName) return this.getAccounts(userId);

    // Reset all defaults for user
    await db.query(`
      UPDATE smartfin_accounts 
      SET is_default = FALSE 
      WHERE user_id = $1 OR user_id IS NULL
    `, [userId]);

    // Set target account as default
    const numericId = parseInt(accountIdOrName, 10);
    if (!isNaN(numericId) && numericId > 0) {
      await db.query(`
        UPDATE smartfin_accounts
        SET is_default = TRUE
        WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      `, [numericId, userId]);
    } else {
      await db.query(`
        UPDATE smartfin_accounts
        SET is_default = TRUE
        WHERE LOWER(name) = LOWER($1) AND (user_id = $2 OR user_id IS NULL)
      `, [accountIdOrName.toString().trim(), userId]);
    }

    return this.getAccounts(userId);
  }

  static async createAccount({ name, type, number, balance, color, isDefault = false, userId = 1 }) {
    if (isDefault) {
      await db.query(`
        UPDATE smartfin_accounts 
        SET is_default = FALSE 
        WHERE user_id = $1 OR user_id IS NULL
      `, [userId]);
    }

    await db.query(`
      INSERT INTO smartfin_accounts (user_id, name, type, number, balance, color, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      name.trim(),
      type || 'Bank',
      number || 'Rekening Baru',
      Number(balance) || 0,
      color || '#3b82f6',
      Boolean(isDefault)
    ]);

    return this.getAccounts(userId);
  }

  static async transferAccounts({ fromId, toId, amount, userId = 1 }) {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
      throw new Error('Nominal transfer harus lebih dari 0.');
    }

    const accounts = await this.getAccounts(userId);
    const fromAcc = accounts.find(a => a.id === fromId.toString() || a.name.toLowerCase() === fromId.toString().toLowerCase());
    const toAcc = accounts.find(a => a.id === toId.toString() || a.name.toLowerCase() === toId.toString().toLowerCase());

    if (!fromAcc || !toAcc) {
      throw new Error('Rekening asal atau tujuan tidak ditemukan.');
    }

    if (fromAcc.balance < numericAmount) {
      throw new Error('Saldo rekening asal tidak mencukupi.');
    }

    await db.query(`
      UPDATE smartfin_accounts 
      SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [numericAmount, fromAcc.dbId]);

    await db.query(`
      UPDATE smartfin_accounts 
      SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [numericAmount, toAcc.dbId]);

    const updatedAccounts = await this.getAccounts(userId);

    return {
      fromAcc,
      toAcc,
      amount: numericAmount,
      accounts: updatedAccounts
    };
  }

  static async deleteAccount(id, userId = 1) {
    const accounts = await this.getAccounts(userId);
    const targetAcc = accounts.find(a => a.id === id.toString() || a.name.toLowerCase() === id.toString().toLowerCase());

    if (!targetAcc) {
      throw new Error('Rekening tidak ditemukan.');
    }

    await db.query(`
      DELETE FROM smartfin_accounts 
      WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
    `, [targetAcc.dbId, userId]);

    if (targetAcc.isDefault) {
      const remaining = await this.getAccounts(userId);
      if (remaining.length > 0) {
        await this.setDefaultAccount(remaining[0].id, userId);
      }
    }

    const updatedAccounts = await this.getAccounts(userId);
    return {
      targetAcc,
      accounts: updatedAccounts
    };
  }

  static async updateBalance(accountNameOrId, deltaAmount, userId = 1) {
    const accounts = await this.getAccounts(userId);
    const targetAcc = accounts.find(a => a.id === accountNameOrId.toString() || a.name.toLowerCase() === accountNameOrId.toString().toLowerCase()) || accounts[0];

    if (targetAcc) {
      await db.query(`
        UPDATE smartfin_accounts 
        SET balance = GREATEST(0, balance + $1), updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [deltaAmount, targetAcc.dbId]);
    }

    return this.getAccounts(userId);
  }
}

module.exports = SmartFinAccount;
