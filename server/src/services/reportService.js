const db = require('../config/database');

class ReportService {
  static async getReports(userId, { month = 9, year = 2026 } = {}) {
    const monthPadded = String(month).padStart(2, '0');
    const monthStr = `${year}-${monthPadded}`;

    // 1. Total Pengeluaran & Transaksi in month
    const summaryRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0)::float as total_spending,
        COUNT(id)::int as total_transactions
      FROM purchases
      WHERE (user_id = $1 OR user_id IS NULL)
        AND TO_CHAR(purchase_date, 'YYYY-MM') = $2
    `, [userId, monthStr]);

    const summary = summaryRes.rows[0] || { total_spending: 0, total_transactions: 0 };

    // Prev month comparison
    let prevMonth = Number(month) - 1;
    let prevYear = Number(year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevSummaryRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0)::float as total_spending,
        COUNT(id)::int as total_transactions
      FROM purchases
      WHERE (user_id = $1 OR user_id IS NULL)
        AND TO_CHAR(purchase_date, 'YYYY-MM') = $2
    `, [userId, prevMonthStr]);

    const prevSummary = prevSummaryRes.rows[0] || { total_spending: 0, total_transactions: 0 };

    let spendingChangePct = 0;
    if (prevSummary.total_spending > 0) {
      spendingChangePct = ((summary.total_spending - prevSummary.total_spending) / prevSummary.total_spending) * 100;
    }

    let txChangePct = 0;
    if (prevSummary.total_transactions > 0) {
      txChangePct = ((summary.total_transactions - prevSummary.total_transactions) / prevSummary.total_transactions) * 100;
    }

    // 2. Category spending breakdown
    const categorySpendingRes = await db.query(`
      SELECT 
        COALESCE(c.name, 'Lainnya') as category_name,
        COALESCE(c.color, '#8B5CF6') as color,
        SUM(pi.subtotal)::float as total_amount
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      JOIN products prod ON pi.product_id = prod.id
      LEFT JOIN categories c ON prod.category_id = c.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
        AND TO_CHAR(p.purchase_date, 'YYYY-MM') = $2
      GROUP BY c.name, c.color
      ORDER BY total_amount DESC
    `, [userId, monthStr]);

    const categorySpending = categorySpendingRes.rows;
    const totalCategorySum = categorySpending.reduce((acc, cur) => acc + cur.total_amount, 0);
    const categoryBreakdown = categorySpending.map(cat => ({
      ...cat,
      percentage: totalCategorySum > 0 ? Math.round((cat.total_amount / totalCategorySum) * 100) : 0
    }));

    // 3. Toko Paling Sering
    const topStoresRes = await db.query(`
      SELECT 
        s.id,
        s.name as store_name,
        s.store_type,
        COUNT(p.id)::int as transaction_count,
        SUM(p.total_amount)::float as total_spent
      FROM purchases p
      JOIN stores s ON p.store_id = s.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      GROUP BY s.id, s.name, s.store_type
      ORDER BY transaction_count DESC, total_spent DESC
      LIMIT 6
    `, [userId]);

    // 4. Barang Paling Sering Dibeli
    const topProductsRes = await db.query(`
      SELECT 
        prod.id,
        prod.name as product_name,
        prod.model,
        prod.photo_url,
        b.name as brand_name,
        SUM(pi.quantity)::int as total_quantity,
        COUNT(pi.id)::int as purchase_frequency,
        SUM(pi.subtotal)::float as total_spent
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      JOIN products prod ON pi.product_id = prod.id
      LEFT JOIN brands b ON prod.brand_id = b.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      GROUP BY prod.id, prod.name, prod.model, prod.photo_url, b.name
      ORDER BY purchase_frequency DESC, total_quantity DESC
      LIMIT 6
    `, [userId]);

    // 5. Lokasi Terbanyak
    const topLocationsRes = await db.query(`
      SELECT 
        COALESCE(l.city, s.name, 'Lainnya') as location_name,
        COUNT(p.id)::int as transaction_count
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      GROUP BY location_name
      ORDER BY transaction_count DESC
      LIMIT 5
    `, [userId]);

    return {
      month: Number(month),
      year: Number(year),
      summary: {
        total_spending: summary.total_spending,
        spending_change_pct: parseFloat(spendingChangePct.toFixed(1)),
        total_transactions: summary.total_transactions,
        transactions_change_pct: parseFloat(txChangePct.toFixed(1))
      },
      category_breakdown: categoryBreakdown,
      top_stores: topStoresRes.rows,
      top_products: topProductsRes.rows,
      top_locations: topLocationsRes.rows
    };
  }
}

module.exports = ReportService;
