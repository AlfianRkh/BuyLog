const db = require('../config/database');

class Product {
  static async create({ name, brandId = null, categoryId = null, model = null, description = null, photoUrl = null, userId }, client = null) {
    const queryExecutor = client || db;
    const query = `
      INSERT INTO products (name, brand_id, category_id, model, description, photo_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await queryExecutor.query(query, [name, brandId, categoryId, model, description, photoUrl, userId]);
    return this.findById(rows[0].id, client);
  }

  static async findById(id, client = null) {
    const queryExecutor = client || db;
    const query = `
      SELECT p.*, 
             b.name as brand_name, 
             c.name as category_name, 
             c.color as category_color,
             c.icon as category_icon,
             (SELECT COUNT(*)::int FROM purchase_items pi WHERE pi.product_id = p.id) as total_purchased,
             (SELECT unit_price::float FROM purchase_items pi 
              JOIN purchases pur ON pi.purchase_id = pur.id 
              WHERE pi.product_id = p.id 
              ORDER BY pur.purchase_date DESC LIMIT 1) as latest_price
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const { rows } = await queryExecutor.query(query, [id]);
    return rows[0] || null;
  }

  static async findByNameAndBrand(name, brandId, userId, client = null) {
    const queryExecutor = client || db;
    if (brandId) {
      const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE LOWER(p.name) = LOWER($1) AND p.brand_id = $2 AND (p.user_id = $3 OR p.user_id IS NULL)
      `;
      const { rows } = await queryExecutor.query(query, [name.trim(), brandId, userId]);
      return rows[0] || null;
    } else {
      const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE LOWER(p.name) = LOWER($1) AND p.brand_id IS NULL AND (p.user_id = $2 OR p.user_id IS NULL)
      `;
      const { rows } = await queryExecutor.query(query, [name.trim(), userId]);
      return rows[0] || null;
    }
  }

  static async findAll(userId, { search = '', categoryId, brandId, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT p.*, 
             b.name as brand_name, 
             c.name as category_name,
             c.color as category_color,
             c.icon as category_icon,
             (SELECT COUNT(*)::int FROM purchase_items pi WHERE pi.product_id = p.id) as purchase_count,
             (SELECT unit_price::float FROM purchase_items pi 
              JOIN purchases pur ON pi.purchase_id = pur.id 
              WHERE pi.product_id = p.id 
              ORDER BY pur.purchase_date DESC LIMIT 1) as latest_price,
             (SELECT pur.purchase_date FROM purchase_items pi 
              JOIN purchases pur ON pi.purchase_id = pur.id 
              WHERE pi.product_id = p.id 
              ORDER BY pur.purchase_date DESC LIMIT 1) as latest_purchase_date,
             (SELECT s.name FROM purchase_items pi 
              JOIN purchases pur ON pi.purchase_id = pur.id 
              JOIN stores s ON pur.store_id = s.id
              WHERE pi.product_id = p.id 
              ORDER BY pur.purchase_date DESC LIMIT 1) as latest_store_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
    `;

    const params = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex} OR p.model ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(Number(categoryId));
      paramIndex++;
    }

    if (brandId) {
      query += ` AND p.brand_id = $${paramIndex}`;
      params.push(Number(brandId));
      paramIndex++;
    }

    query += ` ORDER BY p.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  }

  static async count(userId, { search = '', categoryId, brandId } = {}) {
    let query = `
      SELECT COUNT(*)::int as count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
    `;
    const params = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex} OR p.model ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(Number(categoryId));
      paramIndex++;
    }

    if (brandId) {
      query += ` AND p.brand_id = $${paramIndex}`;
      params.push(Number(brandId));
      paramIndex++;
    }

    const { rows } = await db.query(query, params);
    return rows[0]?.count || 0;
  }

  static async getPriceReference(productId, userId) {
    const query = `
      SELECT 
        s.id as store_id,
        s.name as store_name,
        s.store_type,
        s.address as store_address,
        l.city,
        l.province,
        l.latitude,
        l.longitude,
        pi.unit_price::float as unit_price,
        pi.quantity::int as quantity,
        pur.id as purchase_id,
        pur.purchase_date,
        pur.invoice_number
      FROM purchase_items pi
      JOIN purchases pur ON pi.purchase_id = pur.id
      JOIN stores s ON pur.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE pi.product_id = $1 AND (pur.user_id = $2 OR pur.user_id IS NULL)
      ORDER BY pur.purchase_date DESC
    `;

    const { rows: records } = await db.query(query, [productId, userId]);
    const product = await this.findById(productId);

    if (!records.length) {
      return {
        product,
        stores: [],
        min_price: 0,
        max_price: 0,
        avg_price: 0,
        total_records: 0
      };
    }

    const storeMap = new Map();
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalPriceSum = 0;

    records.forEach(row => {
      const price = parseFloat(row.unit_price);
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
      totalPriceSum += price;

      if (!storeMap.has(row.store_id)) {
        storeMap.set(row.store_id, {
          store_id: row.store_id,
          store_name: row.store_name,
          store_type: row.store_type,
          store_address: row.store_address,
          city: row.city || 'Tidak diketahui',
          province: row.province,
          latitude: row.latitude,
          longitude: row.longitude,
          latest_price: price,
          latest_date: row.purchase_date,
          purchase_count: 1,
          price_history: [
            {
              purchase_id: row.purchase_id,
              date: row.purchase_date,
              price: price,
              quantity: row.quantity
            }
          ]
        });
      } else {
        const storeData = storeMap.get(row.store_id);
        storeData.purchase_count += 1;
        storeData.price_history.push({
          purchase_id: row.purchase_id,
          date: row.purchase_date,
          price: price,
          quantity: row.quantity
        });
      }
    });

    const storeList = Array.from(storeMap.values()).map(store => ({
      ...store,
      is_lowest: store.latest_price === minPrice,
      is_highest: store.latest_price === maxPrice && minPrice !== maxPrice
    }));

    return {
      product,
      stores: storeList,
      min_price: minPrice === Infinity ? 0 : minPrice,
      max_price: maxPrice === -Infinity ? 0 : maxPrice,
      avg_price: Math.round(totalPriceSum / records.length),
      total_records: records.length
    };
  }

  static async getPriceHistory(productId, userId) {
    const query = `
      SELECT 
        ph.*,
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

  static async update(id, userId, { name, brandId, categoryId, model, description, photoUrl }, client = null) {
    const queryExecutor = client || db;
    const query = `
      UPDATE products
      SET name = COALESCE($1, name),
          brand_id = COALESCE($2, brand_id),
          category_id = COALESCE($3, category_id),
          model = COALESCE($4, model),
          description = COALESCE($5, description),
          photo_url = COALESCE($6, photo_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND (user_id = $8 OR user_id IS NULL)
      RETURNING *
    `;
    await queryExecutor.query(query, [name, brandId, categoryId, model, description, photoUrl, id, userId]);
    return this.findById(id, client);
  }

  static async delete(id, userId) {
    return db.query('DELETE FROM products WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}

module.exports = Product;
