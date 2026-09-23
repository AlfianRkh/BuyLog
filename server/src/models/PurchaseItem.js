const db = require('../config/database');

class PurchaseItem {
  static async create({ purchaseId, productId, quantity, unitPrice, subtotal, notes = null }, client = null) {
    const queryExecutor = client || db;
    const query = `
      INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const { rows } = await queryExecutor.query(query, [purchaseId, productId, quantity, unitPrice, subtotal, notes]);
    return rows[0].id;
  }

  static async findByPurchaseId(purchaseId) {
    const query = `
      SELECT 
        pi.*,
        pi.unit_price::float as unit_price,
        pi.subtotal::float as subtotal,
        p.name as product_name,
        p.model as product_model,
        p.photo_url as product_photo_url,
        b.name as brand_name,
        c.name as category_name,
        c.color as category_color
      FROM purchase_items pi
      JOIN products p ON pi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pi.purchase_id = $1
    `;
    const { rows } = await db.query(query, [purchaseId]);
    return rows;
  }

  static async getLatestPrice(productId, storeId = null, client = null) {
    const queryExecutor = client || db;
    if (storeId) {
      const query = `
        SELECT pi.unit_price::float as unit_price, pur.purchase_date, pur.store_id
        FROM purchase_items pi
        JOIN purchases pur ON pi.purchase_id = pur.id
        WHERE pi.product_id = $1 AND pur.store_id = $2
        ORDER BY pur.purchase_date DESC, pi.id DESC
        LIMIT 1
      `;
      const { rows } = await queryExecutor.query(query, [productId, storeId]);
      return rows[0] || null;
    } else {
      const query = `
        SELECT pi.unit_price::float as unit_price, pur.purchase_date, pur.store_id
        FROM purchase_items pi
        JOIN purchases pur ON pi.purchase_id = pur.id
        WHERE pi.product_id = $1
        ORDER BY pur.purchase_date DESC, pi.id DESC
        LIMIT 1
      `;
      const { rows } = await queryExecutor.query(query, [productId]);
      return rows[0] || null;
    }
  }
}

module.exports = PurchaseItem;
