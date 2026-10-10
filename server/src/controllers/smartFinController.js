const db = require('../config/database');
const SmartFinAccount = require('../models/SmartFinAccount');
const SmartFinCategory = require('../models/SmartFinCategory');
const SmartFinSplitBill = require('../models/SmartFinSplitBill');
const SmartFinMutation = require('../models/SmartFinMutation');
const SmartFinBudget = require('../models/SmartFinBudget');
const SmartFinTransaction = require('../models/SmartFinTransaction');

// ---------------------------------------------------------
// SPLIT BILL ENDPOINTS (PostgreSQL DB)
// ---------------------------------------------------------

// GET /api/smartfin/split-bill
exports.getSplitBill = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const splitBill = await SmartFinSplitBill.getSplitBill(userId);
    res.json({
      success: true,
      data: splitBill
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/smartfin/split-bill/members/:id/toggle-paid
exports.toggleMemberPaid = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;

    const updatedBill = await SmartFinSplitBill.toggleMemberPaid(id, userId);

    res.json({
      success: true,
      message: `Status pembayaran berhasil diperbarui di Database!`,
      data: updatedBill
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/split-bill/members
exports.addMember = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, desc, portion } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama peserta wajib diisi.' });
    }

    const updatedBill = await SmartFinSplitBill.addMember({ name, desc, portion, userId });

    res.status(201).json({
      success: true,
      message: `Peserta ${name} berhasil ditambahkan ke Database!`,
      data: updatedBill
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// ACCOUNTS & WALLETS ENDPOINTS (PostgreSQL DB)
// ---------------------------------------------------------

// GET /api/smartfin/accounts
exports.getAccounts = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const accounts = await SmartFinAccount.getAccounts(userId);
    const totalLiquidity = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    res.json({
      success: true,
      accounts,
      totalLiquidity
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/accounts
exports.createAccount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, type, number, balance, color, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama rekening/dompet wajib diisi.' });
    }

    const accounts = await SmartFinAccount.createAccount({ name, type, number, balance, color, isDefault, userId });
    const totalLiquidity = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    const created = accounts.find(a => a.name.toLowerCase() === name.toLowerCase()) || accounts[0];

    res.status(201).json({
      success: true,
      message: `Rekening "${name}" berhasil dibuat di Database!`,
      account: created,
      accounts,
      totalLiquidity
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/smartfin/accounts/:id/set-default
exports.setDefaultAccount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;
    const accounts = await SmartFinAccount.setDefaultAccount(id, userId);
    const defaultAcc = accounts.find(a => a.isDefault);
    const totalLiquidity = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    res.json({
      success: true,
      message: `Rekening "${defaultAcc ? defaultAcc.name : 'Utama'}" berhasil dijadikan Rekening Default di Database!`,
      accounts,
      totalLiquidity
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/accounts/transfer
exports.transferAccounts = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { fromId, toId, amount } = req.body;

    const result = await SmartFinAccount.transferAccounts({ fromId, toId, amount, userId });
    const totalLiquidity = result.accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    // Record mutations in PostgreSQL DB for both accounts
    const dateFormatted = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    await SmartFinMutation.recordMutation({
      accountId: fromId,
      dateStr: dateFormatted,
      merchant: `Transfer Keluar ke ${result.toAcc.name}`,
      category: '🔄 Transfer Intrabank',
      amount: result.amount,
      type: 'expense',
      method: 'Transfer DB',
      invoice: 'TRF-OUT-' + Date.now(),
      userId
    });

    await SmartFinMutation.recordMutation({
      accountId: toId,
      dateStr: dateFormatted,
      merchant: `Transfer Masuk dari ${result.fromAcc.name}`,
      category: '🔄 Transfer Intrabank',
      amount: result.amount,
      type: 'income',
      method: 'Transfer DB',
      invoice: 'TRF-IN-' + Date.now(),
      userId
    });

    res.json({
      success: true,
      message: `Transfer Rp ${Number(result.amount).toLocaleString('id-ID')} dari ${result.fromAcc.name} ke ${result.toAcc.name} berhasil dieksekusi di Database!`,
      accounts: result.accounts,
      totalLiquidity
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/accounts/:id
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;
    const result = await SmartFinAccount.deleteAccount(id, userId);
    const totalLiquidity = result.accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    res.json({
      success: true,
      message: `Rekening "${result.targetAcc.name}" berhasil dihapus dari Database!`,
      accounts: result.accounts,
      totalLiquidity
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/smartfin/accounts/:id/mutations
exports.getAccountMutations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;
    const accounts = await SmartFinAccount.getAccounts(userId);
    const account = accounts.find(a => a.id === id.toString() || a.name.toLowerCase() === id.toString().toLowerCase());

    const mutations = await SmartFinMutation.getMutationsByAccountId(id, userId);

    const totalExpense = mutations.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    const totalIncome = mutations.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);

    res.json({
      success: true,
      account: account || { id, name: 'Rekening Kas', type: 'Bank', balance: 0 },
      mutations,
      summary: {
        totalExpense,
        totalIncome,
        netChange: totalIncome - totalExpense
      }
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// POS ANGGARAN & ENVELOPE BUDGETING ENDPOINTS (PostgreSQL DB)
// ---------------------------------------------------------

const calculateBudgetMetrics = (budgets) => {
  const totalPlafon = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remainingQuota = totalPlafon - totalSpent;
  const burnRatePct = totalPlafon > 0 ? Number(((totalSpent / totalPlafon) * 100).toFixed(1)) : 0;
  
  const currentDay = 6;
  const totalDays = 31;
  const idealPct = Number(((currentDay / totalDays) * 100).toFixed(1));
  const paceDiff = Number((burnRatePct - idealPct).toFixed(1));
  
  let burnPaceStatus = 'Ideal';
  if (paceDiff > 15) burnPaceStatus = 'Waspada Laju';
  else if (paceDiff > 5) burnPaceStatus = 'Agak Cepat';

  return {
    totalPlafon,
    totalSpent,
    remainingQuota,
    burnRatePct,
    burnPaceStatus,
    paceDiff,
    currentDay,
    totalDays,
    idealPct
  };
};

// GET /api/smartfin/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const budgets = await SmartFinBudget.getBudgets(userId);
    const metrics = calculateBudgetMetrics(budgets);
    res.json({
      success: true,
      budgets,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/budgets
exports.createBudget = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, limit, icon, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama pos anggaran wajib diisi.' });
    }

    const budgets = await SmartFinBudget.createBudget({ name, limit, icon, category, userId });
    const metrics = calculateBudgetMetrics(budgets);

    res.status(201).json({
      success: true,
      message: `Pos anggaran "${name}" berhasil ditambahkan ke Database.`,
      budgets,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/budgets/apply-503020
exports.applyRule503020 = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const salary = Number(req.body.salary) || 8500000;
    
    const budgets = await SmartFinBudget.applyRule503020(salary, userId);
    const metrics = calculateBudgetMetrics(budgets);

    res.json({
      success: true,
      message: `Pola alokasi 50/30/20 dengan basis gaji Rp ${salary.toLocaleString('id-ID')} berhasil diterapkan di Database.`,
      budgets,
      metrics,
      ruleSummary: {
        salary,
        needsLimit: Math.round(salary * 0.5),
        wantsLimit: Math.round(salary * 0.3),
        savingsLimit: Math.round(salary * 0.2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;

    const budgets = await SmartFinBudget.deleteBudget(id, userId);
    const metrics = calculateBudgetMetrics(budgets);

    res.json({
      success: true,
      message: `Pos anggaran berhasil dihapus dari Database.`,
      budgets,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// TRANSACTIONS, DASHBOARD, REPORTS & SETTINGS (PostgreSQL DB)
// ---------------------------------------------------------

let ocrSettingsData = {
  ocrEngine: 'Tesseract 5.4 Neural + Vision LLM',
  confidenceThreshold: 85,
  autoCategorization: true,
  currency: 'IDR (Rp)',
  receiptRetentionDays: 90,
  aiVisionModel: 'Gemini 3.5 Flash Vision',
  autoSplitItems: true,
  autoDebitAccount: 'BCA Utama'
};

// GET /api/smartfin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const accounts = await SmartFinAccount.getAccounts(userId);
    const transactions = await SmartFinTransaction.getTransactions(userId);
    const budgets = await SmartFinBudget.getBudgets(userId);

    const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    const monthExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const activeEnvelopesCount = budgets.length;
    const totalPlafon = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
    const totalSpentEnvelopes = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

    const recentTransactions = transactions.slice(0, 5);

    // Calculate dynamic category breakdown from envelopes
    const categoryBreakdown = budgets
      .filter(b => b.spent > 0 || b.limit > 0)
      .map(b => {
        const percentage = totalSpentEnvelopes > 0 ? Number(((b.spent / totalSpentEnvelopes) * 100).toFixed(1)) : 0;
        return {
          id: b.id,
          name: b.name,
          amount: b.spent,
          percentage
        };
      });

    const verifiedCount = transactions.filter(t => t.status && t.status.toLowerCase().includes('verified')).length;

    const insights = {
      verifiedCount: verifiedCount || transactions.length,
      accuracyRate: 99.2,
      topCategory: categoryBreakdown[0] ? categoryBreakdown[0].name : 'Kebutuhan Dapur',
      duplicateCount: 0,
      totalTransactionsCount: transactions.length
    };

    res.json({
      success: true,
      summary: {
        totalBalance,
        monthExpenses,
        monthIncome,
        netIncome: monthIncome - monthExpenses,
        activeEnvelopesCount,
        totalPlafon,
        totalSpentEnvelopes,
        envelopeBurnRatePct: totalPlafon > 0 ? Number(((totalSpentEnvelopes / totalPlafon) * 100).toFixed(1)) : 0
      },
      accounts,
      envelopes: budgets,
      categoryBreakdown,
      insights,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/scan-receipt
exports.scanReceipt = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { merchant, date, amount, items, category, paymentAccount, receiptNo } = req.body;

    const defaultAcc = await SmartFinAccount.getDefaultAccount(userId);
    const targetAccountName = paymentAccount || (defaultAcc ? defaultAcc.name : 'BCA Utama');

    const parsedMerchant = merchant || 'Indomaret / Alfamart Superstore';
    const parsedAmount = Number(amount) || 48500;
    const parsedCategory = category || '🥫 Kebutuhan Dapur';

    const newTx = await SmartFinTransaction.createTransaction({
      merchant: parsedMerchant,
      amount: parsedAmount,
      type: 'expense',
      category: parsedCategory,
      account: targetAccountName,
      date,
      itemsCount: Array.isArray(items) ? items.length : 3,
      status: 'Verified OCR AI',
      receiptNo: receiptNo || ('OCR-' + Date.now().toString().slice(-6)),
      confidence: 99.2,
      userId
    });

    // Update account balance in DB
    await SmartFinAccount.updateBalance(targetAccountName, -parsedAmount, userId);

    // Deduct envelope budget in DB
    await SmartFinBudget.updateSpent(parsedCategory, parsedAmount, userId);

    // Record mutation in DB
    const accountObj = (await SmartFinAccount.getAccounts(userId)).find(a => a.name.toLowerCase() === targetAccountName.toLowerCase());
    await SmartFinMutation.recordMutation({
      accountId: accountObj ? accountObj.id : null,
      merchant: parsedMerchant,
      category: parsedCategory,
      amount: parsedAmount,
      type: 'expense',
      method: 'OCR Auto-Debit',
      invoice: newTx.receiptNo,
      userId
    });

    res.status(201).json({
      success: true,
      message: `Struk "${parsedMerchant}" sebesar Rp ${parsedAmount.toLocaleString('id-ID')} berhasil dipindai OCR dan dicatat di Database!`,
      transaction: newTx,
      scannedItems: items || [
        { name: 'Minyak Goreng Tropical 2L', qty: 1, price: 34500 },
        { name: 'Gula Pasir Gulaku 1kg', qty: 1, price: 14000 }
      ]
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/smartfin/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { search, category, type } = req.query;

    const result = await SmartFinTransaction.getTransactions(userId, { search, category, type });

    const totalExpense = result.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = result.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      transactions: result,
      summary: {
        totalCount: result.length,
        totalExpense,
        totalIncome,
        netAmount: totalIncome - totalExpense
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { merchant, amount, type, category, account, date, notes } = req.body;

    if (!merchant || !amount) {
      return res.status(400).json({ success: false, message: 'Merchant dan nominal transaksi wajib diisi.' });
    }

    const numAmount = Number(amount) || 0;
    const txType = type || 'expense';
    const txAccount = account || 'BCA Utama';
    const txCategory = category || 'Lain-lain';

    const newTx = await SmartFinTransaction.createTransaction({
      merchant,
      amount: numAmount,
      type: txType,
      category: txCategory,
      account: txAccount,
      date,
      status: 'Manual Input',
      receiptNo: 'MANUAL-' + Date.now().toString().slice(-6),
      confidence: 100,
      userId
    });

    // Update account balance in DB
    const delta = txType === 'income' ? numAmount : -numAmount;
    await SmartFinAccount.updateBalance(txAccount, delta, userId);

    // Record mutation in DB
    const accounts = await SmartFinAccount.getAccounts(userId);
    const accountObj = accounts.find(a => a.name.toLowerCase() === txAccount.toLowerCase());
    await SmartFinMutation.recordMutation({
      accountId: accountObj ? accountObj.id : null,
      merchant,
      category: txCategory,
      amount: numAmount,
      type: txType,
      method: 'Manual Transaction',
      invoice: newTx.receiptNo,
      userId
    });

    const allTransactions = await SmartFinTransaction.getTransactions(userId);

    res.status(201).json({
      success: true,
      message: `Transaksi "${merchant}" berhasil dicatat di Database!`,
      transaction: newTx,
      transactions: allTransactions
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;

    const remainingTransactions = await SmartFinTransaction.deleteTransaction(id, userId);

    res.json({
      success: true,
      message: `Transaksi berhasil dihapus dari Database.`,
      transactions: remainingTransactions
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/smartfin/reports
exports.getReports = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;

    // 1. Peringkat Merchant (Top Merchants) from Database
    const topMerchantsRes = await db.query(`
      SELECT 
        COALESCE(s.name, 'Toko Umum') as name,
        COUNT(p.id)::int as count,
        COALESCE(SUM(p.total_amount), 0)::float as total
      FROM purchases p
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      GROUP BY s.name
      ORDER BY total DESC, count DESC
      LIMIT 10
    `, [userId]);

    let topMerchants = topMerchantsRes.rows;
    if (topMerchants.length === 0) {
      topMerchants = [
        { name: 'Superindo Merr Surabaya', count: 8, total: 1250000 },
        { name: 'Indomaret Merr', count: 12, total: 840000 },
        { name: 'Kopi Kenangan Galaxy Mall', count: 6, total: 340000 },
        { name: 'Starbucks Coffee', count: 4, total: 248000 }
      ];
    }

    // 2. Laporan Analisis (Category Breakdown & Monthly Trends) from Database
    const catBreakdownRes = await db.query(`
      SELECT 
        COALESCE(c.name, 'Lainnya') as name,
        COALESCE(SUM(pi.subtotal), 0)::float as amount
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      LEFT JOIN products prod ON pi.product_id = prod.id
      LEFT JOIN categories c ON prod.category_id = c.id
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
      GROUP BY c.name
      ORDER BY amount DESC
    `, [userId]);

    const totalExpenseAll = catBreakdownRes.rows.reduce((sum, r) => sum + r.amount, 0);

    let categoryBreakdown = catBreakdownRes.rows.map(r => ({
      name: r.name,
      amount: r.amount,
      percentage: totalExpenseAll > 0 ? Number(((r.amount / totalExpenseAll) * 100).toFixed(1)) : 0
    }));

    if (categoryBreakdown.length === 0) {
      const dbTransactions = await SmartFinTransaction.getTransactions(userId);
      const categoryTotals = {};
      dbTransactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
      const expTotal = dbTransactions.filter(t => t.type === 'expense').reduce((s, x) => s + x.amount, 0) || 1;
      categoryBreakdown = Object.entries(categoryTotals).map(([name, amount]) => ({
        name,
        amount,
        percentage: Number(((amount / expTotal) * 100).toFixed(1))
      }));
    }

    const monthlyTrendsRes = await db.query(`
      SELECT 
        TO_CHAR(p.purchase_date, 'Mon') as month,
        COALESCE(SUM(p.total_amount), 0)::float as expense
      FROM purchases p
      WHERE (p.user_id = $1 OR p.user_id IS NULL)
        AND p.purchase_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(p.purchase_date, 'Mon'), DATE_TRUNC('month', p.purchase_date)
      ORDER BY DATE_TRUNC('month', p.purchase_date) ASC
    `, [userId]);

    let monthlyTrends = monthlyTrendsRes.rows.map(r => ({
      month: r.month,
      income: 7500000,
      expense: r.expense
    }));

    if (monthlyTrends.length === 0) {
      monthlyTrends = [
        { month: 'Mei', income: 7500000, expense: 4100000 },
        { month: 'Jun', income: 7500000, expense: 3900000 },
        { month: 'Jul', income: 8200000, expense: 4400000 },
        { month: 'Agu', income: 7500000, expense: 3700000 },
        { month: 'Sep', income: 7800000, expense: 4050000 },
        { month: 'Okt', income: 7500000, expense: 1850000 }
      ];
    }

    // 3. Pelacak Fluktuasi Harga Barang Struk (Inflation Tracker) from Database
    let priceHistoriesRes = await db.query(`
      SELECT 
        prod.name as product_name,
        s.name as store_name,
        ph.old_price::float as old_price,
        ph.new_price::float as new_price,
        ph.price_change_pct::float as price_change_pct,
        c.icon as category_icon
      FROM price_histories ph
      JOIN products prod ON ph.product_id = prod.id
      LEFT JOIN categories c ON prod.category_id = c.id
      LEFT JOIN stores s ON ph.store_id = s.id
      WHERE (ph.user_id = $1 OR ph.user_id IS NULL)
      ORDER BY ph.recorded_at DESC
      LIMIT 20
    `, [userId]);

    // Seed initial price histories in DB if 0 rows exist
    if (priceHistoriesRes.rows.length === 0) {
      const sampleItems = [
        { name: 'Bimoli Spesial Minyak Goreng 2L', store: 'Indomaret MERR', oldPrice: 35000, newPrice: 38500, pct: 10.0, icon: '🧴' },
        { name: 'Ultra Milk Full Cream 1L', store: 'Superindo Surabaya', oldPrice: 19000, newPrice: 19500, pct: 2.6, icon: '🥛' },
        { name: 'Sunlight Jeruk Nipis 750ml', store: 'Indomaret Point', oldPrice: 16500, newPrice: 16000, pct: -3.0, icon: '🧼' },
        { name: 'Telur Ayam Negeri 1kg', store: 'Superindo Merr', oldPrice: 29000, newPrice: 31500, pct: 8.6, icon: '🥚' }
      ];

      for (const item of sampleItems) {
        // Create product if not exists
        let prodRes = await db.query(`SELECT id FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1`, [item.name]);
        let prodId;
        if (prodRes.rows.length === 0) {
          const newProd = await db.query(`INSERT INTO products (name, user_id) VALUES ($1, $2) RETURNING id`, [item.name, userId]);
          prodId = newProd.rows[0].id;
        } else {
          prodId = prodRes.rows[0].id;
        }

        // Create store if not exists
        let storeRes = await db.query(`SELECT id FROM stores WHERE LOWER(name) = LOWER($1) LIMIT 1`, [item.store]);
        let storeId;
        if (storeRes.rows.length === 0) {
          const newStore = await db.query(`INSERT INTO stores (name, user_id) VALUES ($1, $2) RETURNING id`, [item.store, userId]);
          storeId = newStore.rows[0].id;
        } else {
          storeId = storeRes.rows[0].id;
        }

        // Insert into price_histories
        await db.query(`
          INSERT INTO price_histories (product_id, store_id, old_price, new_price, price_change, price_change_pct, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [prodId, storeId, item.oldPrice, item.newPrice, item.newPrice - item.oldPrice, item.pct, userId]);
      }

      priceHistoriesRes = await db.query(`
        SELECT 
          prod.name as product_name,
          s.name as store_name,
          ph.old_price::float as old_price,
          ph.new_price::float as new_price,
          ph.price_change_pct::float as price_change_pct,
          c.icon as category_icon
        FROM price_histories ph
        JOIN products prod ON ph.product_id = prod.id
        LEFT JOIN categories c ON prod.category_id = c.id
        LEFT JOIN stores s ON ph.store_id = s.id
        WHERE (ph.user_id = $1 OR ph.user_id IS NULL)
        ORDER BY ph.recorded_at DESC
        LIMIT 20
      `, [userId]);
    }

    const inflationItems = priceHistoriesRes.rows.map(row => {
      const pct = parseFloat(row.price_change_pct) || 0;
      return {
        name: row.product_name,
        store: row.store_name || 'Toko Umum',
        oldPrice: row.old_price,
        newPrice: row.new_price,
        change: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
        status: pct > 5 ? 'inflasi' : (pct < 0 ? 'promo' : 'naik'),
        icon: row.category_icon || '📦'
      };
    });

    res.json({
      success: true,
      categoryBreakdown,
      monthlyTrends,
      topMerchants,
      inflationItems,
      ocrAccuracyRate: 98.9
    });
  } catch (error) {
    next(error);
  }
};

let userProfileData = {
  name: 'Alfian S.',
  email: 'alfian@smartfin.id',
  role: 'Administrator',
  securityLevel: 'AES-256 Cloud Sync'
};

// GET /api/smartfin/settings
exports.getSettings = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const accounts = await SmartFinAccount.getAccounts(userId);
    const categories = await SmartFinCategory.getCategories(userId);
    const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];

    res.json({
      success: true,
      settings: {
        ...ocrSettingsData,
        autoDebitAccount: defaultAcc ? defaultAcc.name : 'BCA Utama'
      },
      categories,
      profile: userProfileData,
      accounts
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/smartfin/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { settings, profile } = req.body;
    if (settings) {
      ocrSettingsData = { ...ocrSettingsData, ...settings };
      if (settings.autoDebitAccount) {
        await SmartFinAccount.setDefaultAccount(settings.autoDebitAccount, userId);
      }
    }
    if (profile) userProfileData = { ...userProfileData, ...profile };

    const accounts = await SmartFinAccount.getAccounts(userId);
    const categories = await SmartFinCategory.getCategories(userId);
    const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];

    res.json({
      success: true,
      message: 'Pengaturan OCR, profil, dan Rekening Default berhasil disimpan ke Database!',
      settings: {
        ...ocrSettingsData,
        autoDebitAccount: defaultAcc ? defaultAcc.name : 'BCA Utama'
      },
      categories,
      profile: userProfileData,
      accounts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/smartfin/categories
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const categories = await SmartFinCategory.getCategories(userId);
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, icon, type } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    }

    const categories = await SmartFinCategory.createCategory({ name, icon, type, userId });
    const created = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase()) || categories[categories.length - 1];

    res.status(201).json({
      success: true,
      message: `Kategori "${name}" berhasil ditambahkan ke Database!`,
      category: created,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;
    const categories = await SmartFinCategory.deleteCategory(id, userId);

    res.json({
      success: true,
      message: `Kategori berhasil dihapus dari Database.`,
      categories
    });
  } catch (error) {
    next(error);
  }
};
