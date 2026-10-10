const db = require('../config/database');

class SmartFinMutation {
  static async getMutationsByAccountId(accountId, userId = 1) {
    const numericAccountId = parseInt(accountId, 10);
    let query = `
      SELECT 
        id, date_str as date, merchant, category, amount::float as amount,
        type, method, invoice, created_at
      FROM smartfin_mutations
      WHERE (user_id = $1 OR user_id IS NULL)
    `;
    let params = [userId];

    if (!isNaN(numericAccountId) && numericAccountId > 0) {
      query += ` AND account_id = $2`;
      params.push(numericAccountId);
    }
    query += ` ORDER BY id DESC LIMIT 50`;

    const { rows } = await db.query(query, params);

    // Seed initial default mutations if 0 rows in DB
    if (rows.length === 0) {
      const initialMutations = [
        { date: '06 Okt 2026 · 09:45 WIB', merchant: 'Indomaret Merr Surabaya', category: '🥫 Kebutuhan Dapur', amount: 88500, type: 'expense', method: 'QRIS BCA', invoice: 'INV/20261006/00892' },
        { date: '05 Okt 2026 · 20:15 WIB', merchant: 'Kopi Kenangan & Kitchen', category: '🍽️ Makan & Minum', amount: 57895, type: 'expense', method: 'QRIS BCA', invoice: 'INV/20261005/0421' },
        { date: '04 Okt 2026 · 14:10 WIB', merchant: 'Superindo Merr Rungkut', category: '🥫 Bahan Makanan Segar', amount: 185000, type: 'expense', method: 'Debit BCA', invoice: 'INV/20261004/00188' },
        { date: '01 Okt 2026 · 08:00 WIB', merchant: 'PT Inovasi Digital Nusantara', category: '💼 Pemasukan Utama', amount: 7500000, type: 'income', method: 'Transfer Bank', invoice: 'PAYROLL-20261001' }
      ];

      for (const m of initialMutations) {
        await db.query(`
          INSERT INTO smartfin_mutations (account_id, user_id, date_str, merchant, category, amount, type, method, invoice)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          !isNaN(numericAccountId) ? numericAccountId : null,
          userId, m.date, m.merchant, m.category, m.amount, m.type, m.method, m.invoice
        ]);
      }

      const res = await db.query(query, params);
      return res.rows.map(r => ({ ...r, id: 'MUT-' + r.id }));
    }

    return rows.map(r => ({ ...r, id: 'MUT-' + r.id }));
  }

  static async recordMutation({ accountId, dateStr, merchant, category, amount, type, method, invoice, userId = 1 }) {
    const numericAccountId = parseInt(accountId, 10);
    const dateFormatted = dateStr || (new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

    const { rows } = await db.query(`
      INSERT INTO smartfin_mutations (account_id, user_id, date_str, merchant, category, amount, type, method, invoice)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, date_str as date, merchant, category, amount::float as amount, type, method, invoice
    `, [
      !isNaN(numericAccountId) ? numericAccountId : null,
      userId,
      dateFormatted,
      merchant,
      category || 'Umum',
      Number(amount) || 0,
      type || 'expense',
      method || 'Transfer',
      invoice || ('INV/' + Date.now())
    ]);

    return { ...rows[0], id: 'MUT-' + rows[0].id };
  }
}

module.exports = SmartFinMutation;
