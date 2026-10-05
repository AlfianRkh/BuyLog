const db = require('../config/database');

// Helper to format currency
const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

async function logActivity(userId, debtId, action, description, metadata = {}) {
  try {
    await db.query(`
      INSERT INTO debt_activity_log (user_id, debt_id, action, description, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, debtId, action, description, JSON.stringify(metadata)]);
  } catch (err) {
    console.error('Error logging debt activity:', err);
  }
}

async function updateOverdueDebts(userId) {
  const todayStr = new Date().toISOString().split('T')[0];
  await db.query(`
    UPDATE debts 
    SET status = 'overdue', updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = $1 AND status = 'active' AND due_date IS NOT NULL AND due_date < $2
  `, [userId, todayStr]);
}

async function recalculateContactTotals(userId, contactId) {
  if (!contactId) return;

  const res = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'hutang' AND status IN ('active', 'overdue') THEN remaining ELSE 0 END) as total_hutang,
      SUM(CASE WHEN type = 'piutang' AND status IN ('active', 'overdue') THEN remaining ELSE 0 END) as total_piutang,
      COUNT(CASE WHEN status IN ('active', 'overdue') THEN 1 END) as active_count
    FROM debts 
    WHERE user_id = $1 AND contact_id = $2
  `, [userId, contactId]);

  const row = res.rows[0] || {};
  const totalHutang = parseFloat(row.total_hutang || 0);
  const totalPiutang = parseFloat(row.total_piutang || 0);
  const activeCount = parseInt(row.active_count || 0);

  await db.query(`
    UPDATE contacts 
    SET total_hutang = $1, total_piutang = $2, active_debt_count = $3, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $4 AND user_id = $5
  `, [totalHutang, totalPiutang, activeCount, contactId, userId]);
}

async function getContacts(userId, search = '') {
  await updateOverdueDebts(userId);

  let query = `
    SELECT c.*, 
           COALESCE(c.total_piutang, 0) - COALESCE(c.total_hutang, 0) as net_balance
    FROM contacts c
    WHERE c.user_id = $1
  `;
  const params = [userId];

  if (search) {
    query += ` AND (c.name ILIKE $2 OR c.phone ILIKE $2 OR c.notes ILIKE $2)`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY c.name ASC`;
  const res = await db.query(query, params);
  return res.rows;
}

async function createContact(userId, data) {
  const { name, phone, notes } = data;
  if (!name) throw new Error('Nama kontak wajib diisi.');

  const res = await db.query(`
    INSERT INTO contacts (user_id, name, phone, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [userId, name, phone || null, notes || null]);

  return res.rows[0];
}

async function getDebts(userId, queryParams = {}) {
  await updateOverdueDebts(userId);

  let sql = `
    SELECT d.*, c.name as contact_name, c.phone as contact_phone
    FROM debts d
    LEFT JOIN contacts c ON d.contact_id = c.id
    WHERE d.user_id = $1
  `;
  const params = [userId];

  if (queryParams.type && (queryParams.type === 'hutang' || queryParams.type === 'piutang')) {
    params.push(queryParams.type);
    sql += ` AND d.type = $${params.length}`;
  }

  if (queryParams.status) {
    params.push(queryParams.status);
    sql += ` AND d.status = $${params.length}`;
  }

  if (queryParams.contact_id) {
    params.push(queryParams.contact_id);
    sql += ` AND d.contact_id = $${params.length}`;
  }

  if (queryParams.search) {
    params.push(`%${queryParams.search}%`);
    sql += ` AND (d.description ILIKE $${params.length} OR c.name ILIKE $${params.length} OR d.notes ILIKE $${params.length})`;
  }

  sql += ` ORDER BY d.created_at DESC`;

  const res = await db.query(sql, params);
  return res.rows;
}

async function getDebtById(userId, debtId) {
  await updateOverdueDebts(userId);

  const res = await db.query(`
    SELECT d.*, c.name as contact_name, c.phone as contact_phone
    FROM debts d
    LEFT JOIN contacts c ON d.contact_id = c.id
    WHERE d.id = $1 AND d.user_id = $2
  `, [debtId, userId]);

  if (res.rows.length === 0) return null;
  const debt = res.rows[0];

  // Fetch payments
  const paymentsRes = await db.query(`
    SELECT * FROM debt_payments WHERE debt_id = $1 ORDER BY payment_date DESC, created_at DESC
  `, [debtId]);

  // Fetch logs
  const logsRes = await db.query(`
    SELECT * FROM debt_activity_log WHERE debt_id = $1 ORDER BY created_at DESC
  `, [debtId]);

  return {
    ...debt,
    payments: paymentsRes.rows,
    logs: logsRes.rows
  };
}

async function getDebtSummary(userId) {
  await updateOverdueDebts(userId);

  const summaryRes = await db.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'hutang' AND status IN ('active', 'overdue') THEN remaining ELSE 0 END), 0) as total_hutang,
      COALESCE(SUM(CASE WHEN type = 'piutang' AND status IN ('active', 'overdue') THEN remaining ELSE 0 END), 0) as total_piutang,
      COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
      COUNT(CASE WHEN status IN ('active', 'overdue') THEN 1 END) as active_count,
      COUNT(CASE WHEN status = 'settled' THEN 1 END) as settled_count,
      COUNT(*) as total_count
    FROM debts
    WHERE user_id = $1
  `, [userId]);

  const row = summaryRes.rows[0];
  const totalHutang = parseFloat(row.total_hutang || 0);
  const totalPiutang = parseFloat(row.total_piutang || 0);
  const netBalance = totalPiutang - totalHutang;

  // Breakdown Piutang per Contact
  const piutangBreakdown = await db.query(`
    SELECT c.name, SUM(d.remaining) as amount
    FROM debts d
    JOIN contacts c ON d.contact_id = c.id
    WHERE d.user_id = $1 AND d.type = 'piutang' AND d.status IN ('active', 'overdue')
    GROUP BY c.id, c.name
    ORDER BY amount DESC
    LIMIT 5
  `, [userId]);

  // Breakdown Hutang per Contact
  const hutangBreakdown = await db.query(`
    SELECT c.name, SUM(d.remaining) as amount
    FROM debts d
    JOIN contacts c ON d.contact_id = c.id
    WHERE d.user_id = $1 AND d.type = 'hutang' AND d.status IN ('active', 'overdue')
    GROUP BY c.id, c.name
    ORDER BY amount DESC
    LIMIT 5
  `, [userId]);

  // Overdue List
  const overdueRes = await db.query(`
    SELECT d.*, c.name as contact_name
    FROM debts d
    LEFT JOIN contacts c ON d.contact_id = c.id
    WHERE d.user_id = $1 AND d.status = 'overdue'
    ORDER BY d.due_date ASC
    LIMIT 5
  `, [userId]);

  // Recent Activity
  const activityRes = await db.query(`
    SELECT * FROM debt_activity_log
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 10
  `, [userId]);

  return {
    summary: {
      total_hutang: totalHutang,
      total_piutang: totalPiutang,
      net_balance: netBalance,
      overdue_count: parseInt(row.overdue_count || 0),
      active_count: parseInt(row.active_count || 0),
      settled_count: parseInt(row.settled_count || 0),
      total_count: parseInt(row.total_count || 0)
    },
    breakdownPiutang: piutangBreakdown.rows.map(r => ({ name: r.name, amount: parseFloat(r.amount) })),
    breakdownHutang: hutangBreakdown.rows.map(r => ({ name: r.name, amount: parseFloat(r.amount) })),
    overdueList: overdueRes.rows,
    recentActivity: activityRes.rows
  };
}

async function createDebt(userId, data) {
  const { contact_id, contact_name, type, amount, description, debt_date, due_date, payment_method, proof_url, notes } = data;

  if (!type || !['hutang', 'piutang'].includes(type)) throw new Error('Tipe transaksi harus hutang atau piutang.');
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Nominal transaksi harus lebih dari 0.');

  let targetContactId = contact_id;

  // If no contact_id provided but contact_name provided, find or create
  if (!targetContactId && contact_name) {
    const existing = await db.query('SELECT id FROM contacts WHERE user_id = $1 AND name ILIKE $2', [userId, contact_name.trim()]);
    if (existing.rows.length > 0) {
      targetContactId = existing.rows[0].id;
    } else {
      const newContact = await createContact(userId, { name: contact_name.trim() });
      targetContactId = newContact.id;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const dDate = debt_date || todayStr;
  let status = 'active';
  if (due_date && due_date < todayStr) {
    status = 'overdue';
  }

  const res = await db.query(`
    INSERT INTO debts (user_id, contact_id, type, amount, remaining, description, debt_date, due_date, payment_method, status, proof_url, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    userId,
    targetContactId || null,
    type,
    numAmount,
    numAmount,
    description || `${type === 'piutang' ? 'Piutang kepada' : 'Hutang ke'} ${contact_name || 'Umum'}`,
    dDate,
    due_date || null,
    payment_method || 'Transfer Bank',
    status,
    proof_url || null,
    notes || null
  ]);

  const debt = res.rows[0];

  if (targetContactId) {
    await recalculateContactTotals(userId, targetContactId);
  }

  await logActivity(userId, debt.id, 'debt_created', `${type === 'piutang' ? 'Piutang baru' : 'Hutang baru'} ${formatRupiah(numAmount)} dicatat`);

  return debt;
}

async function recordPayment(userId, debtId, paymentData) {
  const { amount, payment_date, payment_method, proof_url, notes } = paymentData;
  const payNum = parseFloat(amount);
  if (isNaN(payNum) || payNum <= 0) throw new Error('Nominal pembayaran harus lebih dari 0.');

  const debtRes = await db.query('SELECT * FROM debts WHERE id = $1 AND user_id = $2', [debtId, userId]);
  if (debtRes.rows.length === 0) throw new Error('Transaksi tidak ditemukan.');
  const debt = debtRes.rows[0];

  if (debt.status === 'settled') throw new Error('Transaksi ini sudah lunas.');
  if (debt.status === 'cancelled') throw new Error('Transaksi ini sudah dibatalkan.');

  const remainingBefore = parseFloat(debt.remaining);
  let remainingAfter = remainingBefore - payNum;
  if (remainingAfter < 0) remainingAfter = 0;

  const isFullSettlement = remainingAfter === 0;
  const newStatus = isFullSettlement ? 'settled' : (debt.due_date && debt.due_date < (payment_date || new Date().toISOString().split('T')[0]) ? 'overdue' : 'active');

  const pDate = payment_date || new Date().toISOString().split('T')[0];

  // Insert payment
  await db.query(`
    INSERT INTO debt_payments (debt_id, amount, remaining_after, payment_date, payment_method, proof_url, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [debtId, payNum, remainingAfter, pDate, payment_method || 'Transfer Bank', proof_url || null, notes || null]);

  // Update debt
  await db.query(`
    UPDATE debts 
    SET remaining = $1, status = $2, settled_at = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4 AND user_id = $5
  `, [remainingAfter, newStatus, isFullSettlement ? new Date() : debt.settled_at, debtId, userId]);

  if (debt.contact_id) {
    await recalculateContactTotals(userId, debt.contact_id);
  }

  await logActivity(userId, debtId, isFullSettlement ? 'debt_settled' : 'payment_recorded', `Pembayaran ${formatRupiah(payNum)} dicatat. Sisa: ${formatRupiah(remainingAfter)}`);

  return {
    success: true,
    message: isFullSettlement ? `Transaksi LUNAS! Pembayaran ${formatRupiah(payNum)} berhasil.` : `Pembayaran ${formatRupiah(payNum)} berhasil dicatat.`,
    remaining: remainingAfter,
    status: newStatus
  };
}

async function cancelDebt(userId, debtId, reason) {
  const debtRes = await db.query('SELECT * FROM debts WHERE id = $1 AND user_id = $2', [debtId, userId]);
  if (debtRes.rows.length === 0) throw new Error('Transaksi tidak ditemukan.');
  const debt = debtRes.rows[0];

  await db.query(`
    UPDATE debts 
    SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, cancel_reason = $1, remaining = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3
  `, [reason || 'Dibatalkan oleh pengguna', debtId, userId]);

  if (debt.contact_id) {
    await recalculateContactTotals(userId, debt.contact_id);
  }

  await logActivity(userId, debtId, 'debt_cancelled', `Catatan dibatalkan: ${reason || 'Tanpa alasan'}`);

  return { success: true, message: 'Transaksi berhasil dibatalkan.' };
}

async function deleteDebt(userId, debtId) {
  const debtRes = await db.query('SELECT * FROM debts WHERE id = $1 AND user_id = $2', [debtId, userId]);
  if (debtRes.rows.length === 0) throw new Error('Transaksi tidak ditemukan.');
  const debt = debtRes.rows[0];

  await db.query('DELETE FROM debts WHERE id = $1 AND user_id = $2', [debtId, userId]);

  if (debt.contact_id) {
    await recalculateContactTotals(userId, debt.contact_id);
  }

  return { success: true, message: 'Transaksi berhasil dihapus.' };
}

async function getMonthlyReport(userId) {
  await updateOverdueDebts(userId);

  // Cash In / Cash Out from payments
  const paymentsRes = await db.query(`
    SELECT p.amount, p.payment_date, d.type
    FROM debt_payments p
    JOIN debts d ON p.debt_id = d.id
    WHERE d.user_id = $1
    ORDER BY p.payment_date ASC
  `, [userId]);

  let cashIn = 0;
  let cashInCount = 0;
  let cashOut = 0;
  let cashOutCount = 0;

  paymentsRes.rows.forEach(p => {
    const amt = parseFloat(p.amount);
    if (p.type === 'piutang') {
      cashIn += amt;
      cashInCount++;
    } else {
      cashOut += amt;
      cashOutCount++;
    }
  });

  const netMovement = cashIn - cashOut;

  // Debt stats
  const debtsRes = await db.query(`
    SELECT status, COUNT(*) as count
    FROM debts WHERE user_id = $1
    GROUP BY status
  `, [userId]);

  let totalCount = 0;
  let settledCount = 0;
  debtsRes.rows.forEach(r => {
    const cnt = parseInt(r.count);
    totalCount += cnt;
    if (r.status === 'settled') settledCount += cnt;
  });

  const settlementRate = totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 100;

  // Contact risk analysis
  const contactsRes = await db.query(`
    SELECT c.*,
      COALESCE(SUM(CASE WHEN d.type = 'piutang' THEN d.amount ELSE 0 END), 0) as total_loaned,
      COALESCE(SUM(CASE WHEN d.type = 'piutang' THEN d.amount - d.remaining ELSE 0 END), 0) as total_repaid,
      COALESCE(SUM(CASE WHEN d.type = 'piutang' AND d.status IN ('active', 'overdue') THEN d.remaining ELSE 0 END), 0) as remaining_piutang,
      COUNT(CASE WHEN d.type = 'piutang' AND d.status = 'overdue' THEN 1 END) as overdue_count
    FROM contacts c
    LEFT JOIN debts d ON c.id = d.contact_id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY remaining_piutang DESC
  `, [userId]);

  const contactsRisk = contactsRes.rows.map(c => {
    const overdueCnt = parseInt(c.overdue_count || 0);
    const rem = parseFloat(c.remaining_piutang || 0);
    let riskStatus = 'Lancar';
    let badgeClass = 'bg-success-50 text-success-600';

    if (overdueCnt > 0) {
      riskStatus = 'Perlu Perhatian';
      badgeClass = 'bg-danger-50 text-danger-600';
    } else if (rem > 5000000) {
      riskStatus = 'Eksposur Tinggi';
      badgeClass = 'bg-warning-50 text-warning-600';
    }

    return {
      id: c.id,
      name: c.name,
      total_loaned: parseFloat(c.total_loaned),
      total_repaid: parseFloat(c.total_repaid),
      remaining_piutang: rem,
      overdue_count: overdueCnt,
      riskStatus,
      badgeClass
    };
  });

  return {
    summary: {
      cash_in: cashIn,
      cash_in_count: cashInCount,
      cash_out: cashOut,
      cash_out_count: cashOutCount,
      net_movement: netMovement,
      settlement_rate: settlementRate,
      settled_count: settledCount,
      total_count: totalCount
    },
    contacts_risk: contactsRisk
  };
}

async function generateWASummary(userId, contactId) {
  const contactRes = await db.query('SELECT * FROM contacts WHERE id = $1 AND user_id = $2', [contactId, userId]);
  if (contactRes.rows.length === 0) throw new Error('Kontak tidak ditemukan.');
  const contact = contactRes.rows[0];

  const userRes = await db.query('SELECT name, wa_summary_template, bank_account_info FROM users WHERE id = $1', [userId]);
  const user = userRes.rows[0] || {};

  const debtsRes = await db.query(`
    SELECT * FROM debts 
    WHERE user_id = $1 AND contact_id = $2 AND status IN ('active', 'overdue')
    ORDER BY debt_date ASC
  `, [userId, contactId]);

  const piutangList = [];
  const hutangList = [];
  let piutangTotal = 0;
  let hutangTotal = 0;

  debtsRes.rows.forEach(d => {
    const rem = parseFloat(d.remaining);
    const line = `- ${d.description}: ${formatRupiah(rem)} (Sisa dari ${formatRupiah(d.amount)}${d.due_date ? `, Jatuh tempo: ${d.due_date}` : ''})`;
    if (d.type === 'piutang') {
      piutangList.push(line);
      piutangTotal += rem;
    } else {
      hutangList.push(line);
      hutangTotal += rem;
    }
  });

  const net = piutangTotal - hutangTotal;
  let netSummaryText = '';
  if (net > 0) {
    netSummaryText = `Total tagihan ke ${contact.name}: ${formatRupiah(net)}`;
  } else if (net < 0) {
    netSummaryText = `Total kewajiban ke ${contact.name}: ${formatRupiah(Math.abs(net))}`;
  } else {
    netSummaryText = `Posisi saldo seimbang (Rp 0)`;
  }

  const template = user.wa_summary_template || `Halo {contact_name}, berikut rincian pinjaman kita per {date}:\n\n📌 Piutang:\n{piutang_list}\n\n📌 Hutang:\n{hutang_list}\n\n💵 Saldo Bersih:\n{net_summary}\n\nInformasi Rekening:\n{bank_account}\n\nTerima kasih!`;

  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const formattedText = template
    .replace('{contact_name}', contact.name)
    .replace('{date}', dateStr)
    .replace('{piutang_list}', piutangList.length > 0 ? piutangList.join('\n') : '(Tidak ada piutang berjalan)')
    .replace('{hutang_list}', hutangList.length > 0 ? hutangList.join('\n') : '(Tidak ada hutang berjalan)')
    .replace('{net_summary}', netSummaryText)
    .replace('{bank_account}', user.bank_account_info || 'Nomor rekening dapat ditanyakan langsung.');

  return {
    contact,
    text: formattedText
  };
}

async function updateUserSettings(userId, data) {
  const { name, wa_summary_template, reminder_days_before, bank_account_info } = data;

  await db.query(`
    UPDATE users 
    SET name = COALESCE($1, name),
        wa_summary_template = COALESCE($2, wa_summary_template),
        reminder_days_before = COALESCE($3, reminder_days_before),
        bank_account_info = COALESCE($4, bank_account_info),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
  `, [name || null, wa_summary_template || null, reminder_days_before || null, bank_account_info || null, userId]);

  const res = await db.query('SELECT id, name, email, avatar, wa_summary_template, reminder_days_before, default_payment_method, bank_account_info FROM users WHERE id = $1', [userId]);
  return res.rows[0];
}

module.exports = {
  getContacts,
  createContact,
  getDebts,
  getDebtById,
  getDebtSummary,
  createDebt,
  recordPayment,
  cancelDebt,
  deleteDebt,
  getMonthlyReport,
  generateWASummary,
  updateUserSettings,
  recalculateContactTotals,
  logActivity
};
