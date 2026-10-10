const db = require('../config/database');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function getDashboard(userId) {
  // Seed default watchlist items if 0 exist for user in PostgreSQL database
  const countAll = await db.query(
    `SELECT COUNT(*) as count FROM price_radar_watchlist WHERE user_id = $1 OR user_id IS NULL`,
    [userId]
  );

  // if (parseInt(countAll.rows[0]?.count || 0) === 0) {
  //   await db.query(`
  //     INSERT INTO price_radar_watchlist 
  //       (user_id, title, slug, brand, category, image_url, current_price, target_price, store_name, deal_score, status, is_atl, min_price, max_price, notes, url)
  //     VALUES
  //       ($1, 'Logitech G Pro X 2 Lightspeed', 'logitech-g-pro-x-2', 'Logitech', 'Elektronik', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80', 2890000, 3000000, 'Tokopedia Official', 9.6, 'hit', true, 2890000, 3200000, 'All Time Low deal', 'https://tokopedia.com'),
  //       ($1, 'Bimoli Minyak Goreng 2L (Isi 2)', 'bimoli-2l-isi-2', 'Bimoli', 'Groceries', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80', 68500, 72000, 'Indomaret Klik', 8.8, 'hit', false, 68500, 75000, 'Promo bulanan', 'https://klikindomaret.com'),
  //       ($1, 'Sony WH-1000XM5 ANC', 'sony-wh-1000xm5', 'Sony', 'Elektronik', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', 4599000, 4600000, 'Shopee Mall', 9.2, 'hit', false, 4599000, 4999000, 'Hit target', 'https://shopee.co.id'),
  //       ($1, 'Samsung Galaxy S24 Ultra 512GB', 'samsung-s24-ultra', 'Samsung', 'Elektronik', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80', 18900000, 17500000, 'Tokopedia Official', 6.8, 'watching', false, 18500000, 21990000, 'Menunggu diskon 11.11', 'https://tokopedia.com')
  //   `, [userId]);
  // }

  // Top KPIs
  const totalWatchRes = await db.query(
    `SELECT COUNT(*) as count FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) AND status != 'canceled'`,
    [userId]
  );
  const targetHitsRes = await db.query(
    `SELECT COUNT(*) as count FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) AND status = 'hit'`,
    [userId]
  );
  const avgScoreRes = await db.query(
    `SELECT AVG(deal_score) as avg_score FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) AND status != 'canceled'`,
    [userId]
  );
  const potentialSavingsRes = await db.query(
    `SELECT SUM(GREATEST(0, target_price - current_price)) as savings FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) AND status = 'hit'`,
    [userId]
  );

  // Target Hit Products
  const targetHitProductsRes = await db.query(
    `SELECT * FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) AND status = 'hit' ORDER BY updated_at DESC LIMIT 3`,
    [userId]
  );

  // Deals Bagus Hari Ini (Score >= 7.5)
  const topDealsRes = await db.query(
    `SELECT * FROM price_radar_watchlist WHERE (user_id = $1 OR user_id IS NULL) ORDER BY deal_score DESC LIMIT 3`,
    [userId]
  );

  // Pergerakan Harga Terbaru
  const priceMovementsRes = await db.query(
    `SELECT l.*, w.title as product_title, COALESCE(w.slug, w.id::text) as slug 
     FROM price_radar_logs l
     JOIN price_radar_watchlist w ON l.watchlist_id = w.id
     WHERE l.user_id = $1
     ORDER BY l.recorded_at DESC LIMIT 4`,
    [userId]
  );

  // Platform rankings
  const platformRankingsRes = await db.query(
    `SELECT name, win_rate, price_logs_count, activity_status 
     FROM price_radar_sources WHERE user_id = $1 ORDER BY win_rate DESC LIMIT 4`,
    [userId]
  );

  return {
    kpis: {
      totalWatching: parseInt(totalWatchRes.rows[0]?.count || 0),
      targetHits: parseInt(targetHitsRes.rows[0]?.count || 0),
      avgDealScore: parseFloat(avgScoreRes.rows[0]?.avg_score || 0).toFixed(1),
      potentialSavings: parseInt(potentialSavingsRes.rows[0]?.savings || 0)
    },
    targetHitProducts: targetHitProductsRes.rows,
    topDeals: topDealsRes.rows,
    priceMovements: priceMovementsRes.rows,
    platformRankings: platformRankingsRes.rows
  };
}

async function getWatchlist(userId, { status, category, search, sort }) {
  let query = `SELECT w.*, 
    (SELECT COUNT(*) FROM price_radar_logs l WHERE l.watchlist_id = w.id) as logs_count
    FROM price_radar_watchlist w WHERE w.user_id = $1`;
  const params = [userId];

  if (status && status !== 'all') {
    params.push(status);
    query += ` AND w.status = $${params.length}`;
  }

  if (category && category !== 'all') {
    params.push(category);
    query += ` AND LOWER(w.category) = LOWER($${params.length})`;
  }

  if (search && search.trim() !== '') {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(w.title) LIKE $${params.length} OR LOWER(w.brand) LIKE $${params.length} OR LOWER(w.category) LIKE $${params.length})`;
  }

  if (sort === 'score_desc') {
    query += ` ORDER BY w.deal_score DESC`;
  } else if (sort === 'price_asc') {
    query += ` ORDER BY w.current_price ASC`;
  } else if (sort === 'savings_desc') {
    query += ` ORDER BY (w.target_price - w.current_price) DESC`;
  } else {
    query += ` ORDER BY w.updated_at DESC`;
  }

  const res = await db.query(query, params);
  return res.rows;
}

async function createWatchlist(userId, data) {
  const { title, brand, category, edition, image_url, current_price, target_price, store_name, notes, url } = data;
  const slug = slugify(title) + '-' + Date.now().toString(36);
  const currP = parseFloat(current_price) || 0;
  const targP = parseFloat(target_price) || 0;
  const isHit = currP <= targP && currP > 0;
  const status = isHit ? 'hit' : 'watching';

  // Calculate score
  let score = 7.0;
  if (targP > 0) {
    const ratio = (targP - currP) / targP;
    score = Math.min(10, Math.max(1, (7.0 + ratio * 10).toFixed(1)));
  }

  const res = await db.query(
    `INSERT INTO price_radar_watchlist 
      (user_id, title, slug, brand, category, edition, image_url, current_price, target_price, store_name, deal_score, status, is_atl, min_price, max_price, notes, url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [userId, title, slug, brand || '', category || 'Elektronik', edition || '', image_url || '', currP, targP, store_name || 'Tokopedia', score, status, false, currP, currP, notes || '', url || '']
  );

  // Also insert an initial price log
  if (currP > 0) {
    await db.query(
      `INSERT INTO price_radar_logs (watchlist_id, user_id, platform_name, price, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [res.rows[0].id, userId, store_name || 'Tokopedia', currP, 'Baseline awal']
    );
  }

  return res.rows[0];
}

async function getProductDetail(userId, idOrSlug) {
  let query = `SELECT * FROM price_radar_watchlist WHERE user_id = $1 AND (id::text = $2 OR slug = $2)`;
  let res = await db.query(query, [userId, idOrSlug]);

  if (res.rows.length === 0) {
    // If not found, try without user_id limit if global demo or return null
    res = await db.query(`SELECT * FROM price_radar_watchlist WHERE id::text = $1 OR slug = $1 LIMIT 1`, [idOrSlug]);
    if (res.rows.length === 0) return null;
  }

  const product = res.rows[0];

  // Fetch logs
  const logsRes = await db.query(
    `SELECT * FROM price_radar_logs WHERE watchlist_id = $1 ORDER BY recorded_at DESC`,
    [product.id]
  );

  // Cross platform comparison simulated or fetched
  const platformComparison = [
    { platform: 'Tokopedia Official', price: product.current_price, delta: 'BEST DEAL', status: 'Segar', isBest: true, url: 'https://tokopedia.com' },
    { platform: 'Shopee Mall', price: Math.round(product.current_price * 1.05), delta: `+Rp ${Math.round(product.current_price * 0.05).toLocaleString('id-ID')}`, status: 'Aktif', isBest: false, url: 'https://shopee.co.id' },
    { platform: 'Blibli Official', price: Math.round(product.current_price * 1.08), delta: `+Rp ${Math.round(product.current_price * 0.08).toLocaleString('id-ID')}`, status: 'Aktif', isBest: false, url: 'https://blibli.com' },
    { platform: 'Offline Store', price: Math.round(product.current_price * 1.15), delta: `+Rp ${Math.round(product.current_price * 0.15).toLocaleString('id-ID')}`, status: 'Perlu Cek', isBest: false, url: '#' }
  ];

  return {
    ...product,
    logs: logsRes.rows,
    platformComparison
  };
}

async function updateWatchlist(userId, id, data) {
  const { title, brand, category, edition, target_price, current_price, status, notes } = data;
  const currP = parseFloat(current_price);
  const targP = parseFloat(target_price);

  let setClause = [];
  let params = [userId, id];

  if (title !== undefined) { params.push(title); setClause.push(`title = $${params.length}`); }
  if (brand !== undefined) { params.push(brand); setClause.push(`brand = $${params.length}`); }
  if (category !== undefined) { params.push(category); setClause.push(`category = $${params.length}`); }
  if (edition !== undefined) { params.push(edition); setClause.push(`edition = $${params.length}`); }
  if (notes !== undefined) { params.push(notes); setClause.push(`notes = $${params.length}`); }

  if (!isNaN(targP)) { params.push(targP); setClause.push(`target_price = $${params.length}`); }
  if (!isNaN(currP)) {
    params.push(currP); setClause.push(`current_price = $${params.length}`);
    const newStatus = currP <= (targP || 0) ? 'hit' : 'watching';
    params.push(newStatus); setClause.push(`status = $${params.length}`);
  } else if (status) {
    params.push(status); setClause.push(`status = $${params.length}`);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);

  const res = await db.query(
    `UPDATE price_radar_watchlist SET ${setClause.join(', ')} WHERE user_id = $1 AND id = $2 RETURNING *`,
    params
  );
  return res.rows[0];
}

async function deleteWatchlist(userId, id) {
  await db.query(`DELETE FROM price_radar_logs WHERE watchlist_id = $1 AND user_id = $2`, [id, userId]);
  const res = await db.query(`DELETE FROM price_radar_watchlist WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId]);
  return res.rows[0];
}

async function recordLog(userId, { watchlist_id, platform_name, price, notes, proof_url }) {
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) throw new Error('Invalid price');

  // Insert log
  const logRes = await db.query(
    `INSERT INTO price_radar_logs (watchlist_id, user_id, platform_name, price, notes, proof_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [watchlist_id, userId, platform_name || 'Tokopedia', parsedPrice, notes || '', proof_url || '']
  );

  // Update watchlist statistics & current price
  if (watchlist_id) {
    const wRes = await db.query(`SELECT * FROM price_radar_watchlist WHERE id = $1`, [watchlist_id]);
    if (wRes.rows.length > 0) {
      const item = wRes.rows[0];
      const newMin = Math.min(parseFloat(item.min_price || parsedPrice), parsedPrice);
      const newMax = Math.max(parseFloat(item.max_price || parsedPrice), parsedPrice);
      const isATL = parsedPrice <= newMin;
      const targetP = parseFloat(item.target_price || 0);
      const newStatus = targetP > 0 && parsedPrice <= targetP ? 'hit' : 'watching';

      let score = 7.0;
      if (targetP > 0) {
        const ratio = (targetP - parsedPrice) / targetP;
        score = Math.min(9.9, Math.max(1.0, parseFloat((7.5 + ratio * 10).toFixed(1))));
      }

      await db.query(
        `UPDATE price_radar_watchlist 
         SET current_price = $1, min_price = $2, max_price = $3, is_atl = $4, status = $5, deal_score = $6, store_name = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [parsedPrice, newMin, newMax, isATL, newStatus, score, platform_name || item.store_name, watchlist_id]
      );
    }
  }

  return logRes.rows[0];
}

async function getSources(userId, categoryFilter) {
  let query = `SELECT * FROM price_radar_sources WHERE (user_id = $1 OR user_id IS NULL)`;
  const params = [userId];

  if (categoryFilter && categoryFilter !== 'all') {
    params.push(categoryFilter);
    query += ` AND type = $${params.length}`;
  }

  query += ` ORDER BY id ASC`;
  const res = await db.query(query, params);
  return res.rows;
}

async function createSource(userId, data) {
  const { name, type, url, notes } = data;
  const res = await db.query(
    `INSERT INTO price_radar_sources (user_id, name, type, url, win_rate, price_logs_count, activity_status, is_stale)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, name, type || 'MARKETPLACE', url || '', 20, 1, 'Aktif', false]
  );
  return res.rows[0];
}

async function updateSource(userId, id, data) {
  const { name, type, url } = data;
  const res = await db.query(
    `UPDATE price_radar_sources
     SET name = COALESCE($1, name),
         type = COALESCE($2, type),
         url = COALESCE($3, url)
     WHERE id = $4 AND (user_id = $5 OR user_id IS NULL)
     RETURNING *`,
    [name, type, url, id, userId]
  );
  return res.rows[0];
}

async function getStats(userId, timeFilter) {
  let dateClause = '';
  if (timeFilter) {
    if (/^\d{4}$/.test(timeFilter)) {
      dateClause = ` AND EXTRACT(YEAR FROM updated_at) = ${parseInt(timeFilter)}`;
    } else if (timeFilter === 'year') {
      dateClause = ` AND EXTRACT(YEAR FROM updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)`;
    } else if (timeFilter === '3m') {
      dateClause = ` AND updated_at >= CURRENT_DATE - INTERVAL '3 months'`;
    } else if (timeFilter === '1m') {
      dateClause = ` AND updated_at >= CURRENT_DATE - INTERVAL '1 month'`;
    }
  }

  const totalSavingsRes = await db.query(
    `SELECT SUM(GREATEST(0, max_price - current_price)) as realized_savings FROM price_radar_watchlist WHERE user_id = $1 AND status = 'hit'${dateClause}`,
    [userId]
  );
  const targetAchievedRes = await db.query(
    `SELECT COUNT(*) as hit_count, (SELECT COUNT(*) FROM price_radar_watchlist WHERE user_id = $1${dateClause}) as total_count FROM price_radar_watchlist WHERE user_id = $1 AND status = 'hit'${dateClause}`,
    [userId]
  );
  const avgScoreRes = await db.query(
    `SELECT AVG(deal_score) as avg_score FROM price_radar_watchlist WHERE user_id = $1${dateClause}`,
    [userId]
  );

  const categoryBreakdownRes = await db.query(
    `SELECT 
       COALESCE(NULLIF(category, ''), 'Lainnya') as category,
       SUM(GREATEST(0, max_price - current_price)) as savings,
       COUNT(*) as count
     FROM price_radar_watchlist 
     WHERE user_id = $1${dateClause}
     GROUP BY category
     ORDER BY savings DESC`,
    [userId]
  );

  const realizedSavings = parseInt(totalSavingsRes.rows[0]?.realized_savings || 0);
  const targetHitCount = parseInt(targetAchievedRes.rows[0]?.hit_count || 0);
  const totalCount = parseInt(targetAchievedRes.rows[0]?.total_count || 0);
  const avgDealScoreVal = parseFloat(avgScoreRes.rows[0]?.avg_score || 0);
  const savingsVelocity = Math.round(realizedSavings / 12);
  const yearlyEstimate = savingsVelocity * 12;

  const catTotalSavings = categoryBreakdownRes.rows.reduce((sum, row) => sum + parseInt(row.savings || 0), 0);
  const categoryBreakdown = categoryBreakdownRes.rows.map(row => {
    const savings = parseInt(row.savings || 0);
    const percentage = catTotalSavings > 0 ? Math.round((savings / catTotalSavings) * 100) : 0;
    return {
      category: row.category,
      savings,
      percentage
    };
  });

  const impulseRestraintPercent = totalCount > 0 ? Math.round((targetHitCount / totalCount) * 100) : 0;
  const disciplineScore = Math.min(100, Math.round(avgDealScoreVal * 10));

  let hunterLevel = "BEGINNER HUNTER";
  if (disciplineScore >= 80) hunterLevel = "PRO HUNTER LEVEL 4";
  else if (disciplineScore >= 60) hunterLevel = "ADVANCED HUNTER LEVEL 3";
  else if (disciplineScore >= 40) hunterLevel = "HUNTER LEVEL 2";
  else if (disciplineScore > 0) hunterLevel = "NOVICE HUNTER LEVEL 1";

  return {
    realizedSavings,
    targetHitCount,
    totalCount,
    avgDealScore: avgDealScoreVal.toFixed(1),
    savingsVelocity,
    yearlyEstimate,
    categoryBreakdown,
    impulseRestraintPercent,
    disciplineScore,
    hunterLevel
  };
}

module.exports = {
  getDashboard,
  getWatchlist,
  createWatchlist,
  getProductDetail,
  updateWatchlist,
  deleteWatchlist,
  recordLog,
  getSources,
  createSource,
  updateSource,
  getStats
};
