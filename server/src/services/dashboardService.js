const db = require('../config/database');

class DashboardService {
  static async getMonthlyDashboard(userId, month = 9, year = 2026) {
    const monthPadded = String(month).padStart(2, '0');
    const monthStr = `${year}-${monthPadded}`;

    // 1. Total Pembelian in selected month
    const monthlySpendingRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0)::float as total_spending,
        COUNT(id)::int as total_transactions
      FROM purchases
      WHERE (user_id = $1 OR user_id IS NULL)
        AND TO_CHAR(purchase_date, 'YYYY-MM') = $2
    `, [userId, monthStr]);

    const monthlySpendingRow = monthlySpendingRes.rows[0] || { total_spending: 0, total_transactions: 0 };

    // Previous month spending for percentage comparison
    let prevMonth = Number(month) - 1;
    let prevYear = Number(year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevMonthRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0)::float as total_spending,
        COUNT(id)::int as total_transactions
      FROM purchases
      WHERE (user_id = $1 OR user_id IS NULL)
        AND TO_CHAR(purchase_date, 'YYYY-MM') = $2
    `, [userId, prevMonthStr]);

    const prevMonthRow = prevMonthRes.rows[0] || { total_spending: 0, total_transactions: 0 };

    let spendingChangePct = 0;
    if (prevMonthRow.total_spending > 0) {
      spendingChangePct = ((monthlySpendingRow.total_spending - prevMonthRow.total_spending) / prevMonthRow.total_spending) * 100;
    }

    let txChangePct = 0;
    if (prevMonthRow.total_transactions > 0) {
      txChangePct = ((monthlySpendingRow.total_transactions - prevMonthRow.total_transactions) / prevMonthRow.total_transactions) * 100;
    }

    // 2. Total Barang
    const productCountRes = await db.query(`
      SELECT COUNT(id)::int as count FROM products 
      WHERE (user_id = $1 OR user_id IS NULL)
    `, [userId]);

    // 3. Total Merk
    const brandCountRes = await db.query(`
      SELECT COUNT(id)::int as count FROM brands 
      WHERE (user_id = $1 OR user_id IS NULL)
    `, [userId]);

    // 4. Pengeluaran per Kategori (for Donut Chart)
    const categorySpendingRes = await db.query(`
      SELECT 
        COALESCE(c.name, 'Lainnya') as category_name,
        COALESCE(c.color, '#8B5CF6') as color,
        COALESCE(c.icon, 'Package') as icon,
        SUM(pi.subtotal)::float as total_amount
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      JOIN products prod ON pi.product_id = prod.id
      LEFT JOIN categories c ON prod.category_id = c.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
        AND TO_CHAR(p.purchase_date, 'YYYY-MM') = $2
      GROUP BY c.name, c.color, c.icon
      ORDER BY total_amount DESC
    `, [userId, monthStr]);

    const categorySpending = categorySpendingRes.rows;
    const totalCategorySum = categorySpending.reduce((acc, cur) => acc + cur.total_amount, 0);
    const categorySpendingWithPct = categorySpending.map(cat => ({
      ...cat,
      percentage: totalCategorySum > 0 ? Math.round((cat.total_amount / totalCategorySum) * 100) : 0
    }));

    // 5. Pembelian Terbaru
    const recentPurchasesRes = await db.query(`
      SELECT 
        p.id,
        p.invoice_number,
        p.purchase_date,
        p.total_amount::float as total_amount,
        p.payment_method,
        s.name as store_name,
        s.store_type,
        l.city,
        (SELECT prod.name FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id LIMIT 1) as primary_product_name,
        (SELECT prod.model FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id LIMIT 1) as primary_product_model,
        (SELECT b.name FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         LEFT JOIN brands b ON prod.brand_id = b.id
         WHERE pi.purchase_id = p.id LIMIT 1) as primary_brand,
        (SELECT prod.photo_url FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id AND prod.photo_url IS NOT NULL LIMIT 1) as photo_url,
        (SELECT COUNT(*)::int FROM purchase_items pi WHERE pi.purchase_id = p.id) as item_count
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      ORDER BY p.purchase_date DESC
      LIMIT 6
    `, [userId]);

    return {
      month: Number(month),
      year: Number(year),
      summary: {
        total_spending: monthlySpendingRow.total_spending,
        spending_change_pct: parseFloat(spendingChangePct.toFixed(1)),
        total_transactions: monthlySpendingRow.total_transactions,
        transactions_change_pct: parseFloat(txChangePct.toFixed(1)),
        total_products: productCountRes.rows[0]?.count || 0,
        total_brands: brandCountRes.rows[0]?.count || 0
      },
      category_spending: categorySpendingWithPct,
      total_category_spending: totalCategorySum,
      recent_purchases: recentPurchasesRes.rows
    };
  }
}

module.exports = DashboardService;
