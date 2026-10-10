const db = require('../config/database');

class SmartFinTransaction {
  static formatTx(row) {
    return {
      id: 'TX-' + row.id,
      dbId: row.id,
      date: row.date_str,
      time: row.time_str || '12:00 WIB',
      merchant: row.merchant,
      itemsCount: parseInt(row.items_count, 10) || 1,
      amount: parseFloat(row.amount) || 0,
      type: row.type || 'expense',
      account: row.account || 'BCA Utama',
      category: row.category || 'Umum',
      status: row.status || 'Verified OCR',
      receiptNo: row.receipt_no || ('INV/' + row.id),
      confidence: parseFloat(row.confidence) || 99.0
    };
  }

  static async getTransactions(userId = 1, filters = {}) {
    const query = `
      SELECT id, user_id, date_str, time_str, merchant, items_count, amount::float as amount,
             type, account, category, status, receipt_no, confidence::float as confidence, created_at
      FROM smartfin_transactions
      WHERE (user_id = $1 OR user_id IS NULL)
      ORDER BY id DESC
    `;
    const { rows } = await db.query(query, [userId]);

    // Populate transactions from real purchases table if 0 exist in smartfin_transactions
    if (rows.length === 0) {
      const purchasesRes = await db.query(`
        SELECT 
          p.id as purchase_id,
          COALESCE(TO_CHAR(p.purchase_date, 'DD Mon YYYY'), '01 Okt 2026') as date_str,
          COALESCE(TO_CHAR(p.purchase_date, 'HH24:MI') || ' WIB', '12:00 WIB') as time_str,
          COALESCE(s.name, 'Toko Pembelian') as merchant,
          COALESCE(COUNT(pi.id), 1)::int as items_count,
          COALESCE(p.total_amount, 0)::float as amount,
          'expense' as type,
          COALESCE(p.payment_method, 'BCA Utama') as account,
          COALESCE(MAX(c.name), '🥫 Kebutuhan Dapur') as category,
          'Verified DB' as status,
          COALESCE(p.invoice_number, 'INV/' || p.id) as receipt_no,
          99.5 as confidence
        FROM purchases p
        LEFT JOIN stores s ON p.store_id = s.id
        LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
        LEFT JOIN products prod ON pi.product_id = prod.id
        LEFT JOIN categories c ON prod.category_id = c.id
        WHERE (p.user_id = $1 OR p.user_id IS NULL)
        GROUP BY p.id, p.purchase_date, s.name, p.total_amount, p.payment_method, p.invoice_number
        ORDER BY p.purchase_date DESC
      `, [userId]);

      if (purchasesRes.rows.length > 0) {
        for (const t of purchasesRes.rows) {
          await db.query(`
            INSERT INTO smartfin_transactions (user_id, date_str, time_str, merchant, items_count, amount, type, account, category, status, receipt_no, confidence)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [userId, t.date_str, t.time_str, t.merchant, t.items_count, t.amount, t.type, t.account, t.category, t.status, t.receipt_no, t.confidence]);
        }
      }

      const res = await db.query(query, [userId]);
      let seeded = res.rows.map(this.formatTx);
      return this.applyFilters(seeded, filters);
    }

    let result = rows.map(this.formatTx);
    return this.applyFilters(result, filters);
  }

  static applyFilters(transactions, filters) {
    let result = [...transactions];
    const { search, category, type } = filters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.merchant.toLowerCase().includes(q) || t.receiptNo.toLowerCase().includes(q));
    }

    if (category && category !== 'all') {
      result = result.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (type && type !== 'all') {
      result = result.filter(t => t.type === type);
    }

    return result;
  }

  static async createTransaction({ merchant, amount, type, category, account, date, time, itemsCount, status, receiptNo, confidence, userId = 1 }) {
    const dateFormatted = date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = time || (new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

    const { rows } = await db.query(`
      INSERT INTO smartfin_transactions 
        (user_id, date_str, time_str, merchant, items_count, amount, type, account, category, status, receipt_no, confidence)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, user_id, date_str, time_str, merchant, items_count, amount::float as amount,
                type, account, category, status, receipt_no, confidence::float as confidence
    `, [
      userId,
      dateFormatted,
      timeFormatted,
      merchant,
      itemsCount || 1,
      Number(amount) || 0,
      type || 'expense',
      account || 'BCA Utama',
      category || 'Lain-lain',
      status || 'Manual Input',
      receiptNo || ('MANUAL-' + Date.now().toString().slice(-6)),
      confidence || 100
    ]);

    return this.formatTx(rows[0]);
  }

  static async deleteTransaction(id, userId = 1) {
    const rawId = id.toString().replace(/^TX-/, '');
    const numericId = parseInt(rawId, 10);

    if (!isNaN(numericId) && numericId > 0) {
      await db.query(`
        DELETE FROM smartfin_transactions WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      `, [numericId, userId]);
    } else {
      await db.query(`
        DELETE FROM smartfin_transactions WHERE receipt_no = $1 AND (user_id = $2 OR user_id IS NULL)
      `, [id.toString(), userId]);
    }

    return this.getTransactions(userId);
  }
}

module.exports = SmartFinTransaction;
