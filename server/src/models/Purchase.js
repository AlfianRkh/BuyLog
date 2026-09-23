const db = require('../config/database');

class Purchase {
  static generateInvoiceNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INV/${dateStr}/${randomNum}`;
  }

  static async create({
    invoiceNumber,
    storeId = null,
    latitude = null,
    longitude = null,
    paymentMethod = 'Tunai',
    notes = null,
    totalAmount = 0,
    purchaseDate,
    userId
  }, client = null) {
    const queryExecutor = client || db;
    const inv = invoiceNumber || this.generateInvoiceNumber();
    const query = `
      INSERT INTO purchases (
        invoice_number, store_id, latitude, longitude, 
        payment_method, notes, total_amount, purchase_date, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const { rows } = await queryExecutor.query(query, [
      inv,
      storeId,
      latitude,
      longitude,
      paymentMethod,
      notes,
      totalAmount,
      purchaseDate || new Date().toISOString(),
      userId
    ]);
    return this.findById(rows[0].id, userId, client);
  }

  static async findById(id, userId, client = null) {
    const queryExecutor = client || db;
    const query = `
      SELECT 
        p.*,
        p.total_amount::float as total_amount,
        s.name as store_name,
        s.address as store_address,
        s.store_type,
        l.city,
        l.province,
        l.latitude as store_latitude,
        l.longitude as store_longitude
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE p.id = $1 AND (p.user_id = $2 OR p.user_id IS NULL)
    `;
    const { rows } = await queryExecutor.query(query, [id, userId]);
    return rows[0] || null;
  }

  static async findAll(userId, {
    search = '',
    period = 'all',
    month,
    year,
    startDate,
    endDate,
    categoryId,
    brandId,
    storeId,
    locationId,
    minPrice,
    maxPrice,
    sortBy = 'purchase_date',
    sortOrder = 'DESC',
    limit = 20,
    offset = 0
  } = {}) {
    let query = `
      SELECT 
        p.*,
        p.total_amount::float as total_amount,
        s.name as store_name,
        s.store_type,
        l.city,
        (SELECT COUNT(*)::int FROM purchase_items pi WHERE pi.purchase_id = p.id) as item_count,
        (SELECT STRING_AGG(prod.name, ', ') FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id) as product_names,
        (SELECT prod.photo_url FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id AND prod.photo_url IS NOT NULL 
         LIMIT 1) as thumbnail_url,
        (SELECT b.name FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         LEFT JOIN brands b ON prod.brand_id = b.id
         WHERE pi.purchase_id = p.id 
         LIMIT 1) as primary_brand,
        (SELECT c.name FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         LEFT JOIN categories c ON prod.category_id = c.id
         WHERE pi.purchase_id = p.id 
         LIMIT 1) as primary_category,
        (SELECT c.color FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         LEFT JOIN categories c ON prod.category_id = c.id
         WHERE pi.purchase_id = p.id 
         LIMIT 1) as primary_category_color
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
    `;

    const params = [userId];
    let paramIndex = 2;

    if (period === 'month' && month && year) {
      const monthPadded = String(month).padStart(2, '0');
      query += ` AND TO_CHAR(p.purchase_date, 'YYYY-MM') = $${paramIndex}`;
      params.push(`${year}-${monthPadded}`);
      paramIndex++;
    } else if (period === 'year' && year) {
      query += ` AND TO_CHAR(p.purchase_date, 'YYYY') = $${paramIndex}`;
      params.push(String(year));
      paramIndex++;
    } else if (startDate && endDate) {
      query += ` AND p.purchase_date::date BETWEEN $${paramIndex}::date AND $${paramIndex + 1}::date`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    if (search) {
      query += ` AND (
        p.invoice_number ILIKE $${paramIndex} 
        OR s.name ILIKE $${paramIndex} 
        OR l.city ILIKE $${paramIndex}
        OR EXISTS (
          SELECT 1 FROM purchase_items pi 
          JOIN products prod ON pi.product_id = prod.id 
          LEFT JOIN brands b ON prod.brand_id = b.id
          WHERE pi.purchase_id = p.id AND (prod.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex})
        )
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND EXISTS (
        SELECT 1 FROM purchase_items pi 
        JOIN products prod ON pi.product_id = prod.id 
        WHERE pi.purchase_id = p.id AND prod.category_id = $${paramIndex}
      )`;
      params.push(Number(categoryId));
      paramIndex++;
    }

    if (brandId) {
      query += ` AND EXISTS (
        SELECT 1 FROM purchase_items pi 
        JOIN products prod ON pi.product_id = prod.id 
        WHERE pi.purchase_id = p.id AND prod.brand_id = $${paramIndex}
      )`;
      params.push(Number(brandId));
      paramIndex++;
    }

    if (storeId) {
      query += ` AND p.store_id = $${paramIndex}`;
      params.push(Number(storeId));
      paramIndex++;
    }

    if (locationId) {
      query += ` AND s.location_id = $${paramIndex}`;
      params.push(Number(locationId));
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      query += ` AND p.total_amount >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      query += ` AND p.total_amount <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    const safeSortBy = ['purchase_date', 'total_amount', 'created_at'].includes(sortBy) ? sortBy : 'purchase_date';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${safeSortBy} ${safeSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  }

  static async count(userId, {
    search = '',
    period = 'all',
    month,
    year,
    startDate,
    endDate,
    categoryId,
    brandId,
    storeId,
    locationId,
    minPrice,
    maxPrice
  } = {}) {
    let query = `
      SELECT COUNT(*)::int as total
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
    `;

    const params = [userId];
    let paramIndex = 2;

    if (period === 'month' && month && year) {
      const monthPadded = String(month).padStart(2, '0');
      query += ` AND TO_CHAR(p.purchase_date, 'YYYY-MM') = $${paramIndex}`;
      params.push(`${year}-${monthPadded}`);
      paramIndex++;
    } else if (period === 'year' && year) {
      query += ` AND TO_CHAR(p.purchase_date, 'YYYY') = $${paramIndex}`;
      params.push(String(year));
      paramIndex++;
    } else if (startDate && endDate) {
      query += ` AND p.purchase_date::date BETWEEN $${paramIndex}::date AND $${paramIndex + 1}::date`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    if (search) {
      query += ` AND (
        p.invoice_number ILIKE $${paramIndex} 
        OR s.name ILIKE $${paramIndex} 
        OR l.city ILIKE $${paramIndex}
        OR EXISTS (
          SELECT 1 FROM purchase_items pi 
          JOIN products prod ON pi.product_id = prod.id 
          LEFT JOIN brands b ON prod.brand_id = b.id
          WHERE pi.purchase_id = p.id AND (prod.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex})
        )
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND EXISTS (
        SELECT 1 FROM purchase_items pi 
        JOIN products prod ON pi.product_id = prod.id 
        WHERE pi.purchase_id = p.id AND prod.category_id = $${paramIndex}
      )`;
      params.push(Number(categoryId));
      paramIndex++;
    }

    if (brandId) {
      query += ` AND EXISTS (
        SELECT 1 FROM purchase_items pi 
        JOIN products prod ON pi.product_id = prod.id 
        WHERE pi.purchase_id = p.id AND prod.brand_id = $${paramIndex}
      )`;
      params.push(Number(brandId));
      paramIndex++;
    }

    if (storeId) {
      query += ` AND p.store_id = $${paramIndex}`;
      params.push(Number(storeId));
      paramIndex++;
    }

    if (locationId) {
      query += ` AND s.location_id = $${paramIndex}`;
      params.push(Number(locationId));
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      query += ` AND p.total_amount >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      query += ` AND p.total_amount <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    const { rows } = await db.query(query, params);
    return rows[0]?.total || 0;
  }

  static async update(id, userId, {
    storeId,
    latitude,
    longitude,
    paymentMethod,
    notes,
    totalAmount,
    purchaseDate
  }) {
    const query = `
      UPDATE purchases
      SET store_id = COALESCE($1, store_id),
          latitude = COALESCE($2, latitude),
          longitude = COALESCE($3, longitude),
          payment_method = COALESCE($4, payment_method),
          notes = COALESCE($5, notes),
          total_amount = COALESCE($6, total_amount),
          purchase_date = COALESCE($7, purchase_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND (user_id = $9 OR user_id IS NULL)
      RETURNING *
    `;
    const { rows } = await db.query(query, [storeId, latitude, longitude, paymentMethod, notes, totalAmount, purchaseDate, id, userId]);
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    return db.query('DELETE FROM purchases WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
  }

  static async getAllLocations(userId) {
    const query = `
      SELECT 
        p.id as purchase_id,
        p.invoice_number,
        p.purchase_date,
        p.total_amount::float as total_amount,
        COALESCE(p.latitude, l.latitude, -7.2575) as latitude,
        COALESCE(p.longitude, l.longitude, 112.7521) as longitude,
        s.name as store_name,
        s.store_type,
        s.address as store_address,
        l.city,
        (SELECT prod.name FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id LIMIT 1) as sample_product_name,
        (SELECT prod.photo_url FROM purchase_items pi 
         JOIN products prod ON pi.product_id = prod.id 
         WHERE pi.purchase_id = p.id AND prod.photo_url IS NOT NULL LIMIT 1) as sample_product_photo
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      ORDER BY p.purchase_date DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }
}

module.exports = Purchase;
