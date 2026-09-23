const db = require('../config/database');

class PriceHistory {
  static async create({ productId, storeId, purchaseItemId, oldPrice, newPrice, userId, recordedAt = null }, client = null) {
    const queryExecutor = client || db;
    const priceChange = newPrice - oldPrice;
    const priceChangePct = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

    const query = `
      INSERT INTO price_histories (
        product_id, store_id, purchase_item_id, old_price, new_price, 
        price_change, price_change_pct, user_id, recorded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_TIMESTAMP))
      RETURNING id
    `;

    const { rows } = await queryExecutor.query(query, [
      productId,
      storeId,
      purchaseItemId,
      oldPrice,
      newPrice,
      priceChange,
      parseFloat(priceChangePct.toFixed(2)),
      userId,
      recordedAt
    ]);
    return rows[0].id;
  }

  static async findByProductId(productId, userId) {
    const query = `
      SELECT 
        ph.*,
        ph.old_price::float as old_price,
        ph.new_price::float as new_price,
        ph.price_change::float as price_change,
        ph.price_change_pct::float as price_change_pct,
        s.name as store_name,
        s.store_type,
        l.city,
        p.purchase_date
      FROM price_histories ph
      LEFT JOIN stores s ON ph.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN purchase_items pi ON ph.purchase_item_id = pi.id
      LEFT JOIN purchases p ON pi.purchase_id = p.id
      WHERE ph.product_id = $1 AND (ph.user_id = $2 OR ph.user_id IS NULL)
      ORDER BY ph.recorded_at DESC
    `;
    const { rows } = await db.query(query, [productId, userId]);
    return rows;
  }
}

module.exports = PriceHistory;
