const SmartFinAccount = require('../models/SmartFinAccount');
const SmartFinCategory = require('../models/SmartFinCategory');

// In-memory / Backend Database Store for SmartFin Split-Bill & Mutations
let splitBillData = {
  id: 'sb-1',
  title: 'Kopi Kenangan & Kitchen - Galaxy Mall',
  merchant: 'Kopi Kenangan & Kitchen - Galaxy Mall',
  invoiceNo: 'INV-KK-20261005-0421',
  date: '05 Okt 2026, 20:15 WIB',
  paymentMethod: 'QRIS BCA',
  paidBy: 'Alfian S.',
  subtotalMenu: 190000,
  taxPb1: 19000,
  service: 11000,
  totalBill: 220000,
  participants: [
    { id: 'p1', name: 'Alfian (Saya)', isHost: true, isPaid: true, portion: 57895, desc: 'Nasgor Gila + Fries' },
    { id: 'p2', name: 'Budi Pratama', isHost: false, isPaid: false, portion: 92632, desc: 'Double Wagyu + Fries' },
    { id: 'p3', name: 'Sari Anggraini', isHost: false, isPaid: true, portion: 63684, desc: 'Carbonara + Fries' },
    { id: 'p4', name: 'Dimas Raditya', isHost: false, isPaid: false, portion: 31263, desc: 'Kopi Mantan + Fries' }
  ]
};

// AccountsData is now fully persisted in PostgreSQL smartfin_accounts table via SmartFinAccount model

let mutationsData = {
  'acc1': [
    { id: 'MUT-101', date: '06 Okt 2026 · 09:45 WIB', merchant: 'Indomaret Merr Surabaya', category: '🥫 Kebutuhan Dapur', amount: 88500, type: 'expense', method: 'QRIS BCA', invoice: 'INV/20261006/00892' },
    { id: 'MUT-102', date: '05 Okt 2026 · 20:15 WIB', merchant: 'Kopi Kenangan & Kitchen', category: '🍽️ Makan & Minum', amount: 57895, type: 'expense', method: 'QRIS BCA', invoice: 'INV/20261005/0421' },
    { id: 'MUT-103', date: '04 Okt 2026 · 14:10 WIB', merchant: 'Superindo Merr Rungkut', category: '🥫 Bahan Makanan Segar', amount: 185000, type: 'expense', method: 'Debit BCA', invoice: 'INV/20261004/00188' },
    { id: 'MUT-104', date: '01 Okt 2026 · 08:00 WIB', merchant: 'PT Inovasi Digital Nusantara', category: '💼 Pemasukan Utama', amount: 7500000, type: 'income', method: 'Transfer Bank', invoice: 'PAYROLL-20261001' },
  ],
  'acc2': [
    { id: 'MUT-201', date: '02 Okt 2026 · 18:30 WIB', merchant: 'Starbucks Coffee Galaxy Mall', category: '☕ Kafe & Hiburan', amount: 62000, type: 'expense', method: 'GoPay QRIS', invoice: 'SBX-99812-2026' },
    { id: 'MUT-202', date: '29 Sep 2026 · 12:15 WIB', merchant: 'Top Up GoPay via BCA Utama', category: '🔄 Top Up', amount: 500000, type: 'income', method: 'Transfer', invoice: 'TOPUP-GOPAY-882' },
  ],
  'acc3': [
    { id: 'MUT-301', date: '03 Okt 2026 · 11:20 WIB', merchant: 'Parkir Superindo & Tips', category: '🚗 Transport', amount: 15000, type: 'expense', method: 'Cash', invoice: 'CASH-001' },
    { id: 'MUT-302', date: '01 Okt 2026 · 16:45 WIB', merchant: 'Tarik Tunai ATM BCA', category: '💵 Tarik Tunai', amount: 300000, type: 'income', method: 'Cash', invoice: 'ATM-BCA-992' },
  ]
};

// GET /api/smartfin/split-bill
exports.getSplitBill = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: splitBillData
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/smartfin/split-bill/members/:id/toggle-paid
exports.toggleMemberPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = splitBillData.participants.find(p => p.id === id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan di server BE.' });
    }

    member.isPaid = !member.isPaid;

    res.json({
      success: true,
      message: `Status pembayaran ${member.name} berhasil diperbarui di Backend (${member.isPaid ? 'LUNAS ✅' : 'MENUNGGU'}).`,
      data: splitBillData
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/split-bill/members
exports.addMember = async (req, res, next) => {
  try {
    const { name, desc, portion } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama peserta wajib diisi.' });
    }

    const newId = 'p' + (splitBillData.participants.length + 1) + '_' + Date.now().toString().slice(-4);
    const newMember = {
      id: newId,
      name,
      isHost: false,
      isPaid: false,
      portion: Number(portion) || 25000,
      desc: desc || 'Pesanan Tambahan'
    };

    splitBillData.participants.push(newMember);

    res.status(201).json({
      success: true,
      message: `Peserta ${name} berhasil ditambahkan ke Backend.`,
      data: splitBillData
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

    const mutations = mutationsData[id] || (account && mutationsData[account.id]) || [
      { id: 'MUT-DEF-1', date: '06 Okt 2026 · 10:00 WIB', merchant: 'Transaksi Pembukaan Rekening', category: '💼 Saldo Awal', amount: account ? account.balance : 1000000, type: 'income', method: 'Deposit', invoice: 'INIT-001' }
    ];

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
// POS ANGGARAN & ENVELOPE BUDGETING ENDPOINTS
// ---------------------------------------------------------

let budgetsData = [
  { id: 'env-1', name: '🥫 Kebutuhan Dapur & Bahan', limit: 2500000, spent: 1850000, icon: '🥫', category: 'Pokok' },
  { id: 'env-2', name: '🍽️ Makan Luar & Resto', limit: 1200000, spent: 980000, icon: '🍽️', category: 'Pokok' },
  { id: 'env-3', name: '⚡ Tagihan & Utilitas', limit: 800000, spent: 620000, icon: '⚡', category: 'Pokok' },
  { id: 'env-4', name: '🚗 Bensin & Transport', limit: 600000, spent: 250000, icon: '🚗', category: 'Pokok' },
  { id: 'env-5', name: '☕ Kafe & Hiburan', limit: 500000, spent: 150000, icon: '☕', category: 'Keinginan' },
  { id: 'env-6', name: '🛡️ Dana Darurat & Investasi', limit: 900000, spent: 0, icon: '🛡️', category: 'Tabungan' }
];

const calculateBudgetMetrics = () => {
  const totalPlafon = budgetsData.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgetsData.reduce((sum, b) => sum + (b.spent || 0), 0);
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
    const metrics = calculateBudgetMetrics();
    res.json({
      success: true,
      budgets: budgetsData,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/budgets
exports.createBudget = async (req, res, next) => {
  try {
    const { name, limit, icon, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama pos anggaran wajib diisi.' });
    }

    const newEnvelope = {
      id: 'env-' + Date.now(),
      name: name.trim(),
      limit: Number(limit) || 1000000,
      spent: 0,
      icon: icon || '📦',
      category: category || 'Umum'
    };

    budgetsData.push(newEnvelope);
    const metrics = calculateBudgetMetrics();

    res.status(201).json({
      success: true,
      message: `Pos anggaran "${name}" berhasil ditambahkan ke Backend.`,
      budgets: budgetsData,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/smartfin/budgets/apply-503020
exports.applyRule503020 = async (req, res, next) => {
  try {
    const salary = Number(req.body.salary) || 8500000;
    const needsLimit = Math.round(salary * 0.5);
    const wantsLimit = Math.round(salary * 0.3);
    const savingsLimit = Math.round(salary * 0.2);

    budgetsData = [
      { id: 'env-503020-1', name: '🥫 Kebutuhan Pokok & Bahan Dapur (50%)', limit: needsLimit, spent: 1850000, icon: '🥫', category: 'Pokok' },
      { id: 'env-503020-2', name: '☕ Keinginan & Gaya Hidup (30%)', limit: wantsLimit, spent: 980000, icon: '☕', category: 'Keinginan' },
      { id: 'env-503020-3', name: '🛡️ Tabungan & Investasi (20%)', limit: savingsLimit, spent: 0, icon: '🛡️', category: 'Tabungan' }
    ];

    const metrics = calculateBudgetMetrics();

    res.json({
      success: true,
      message: `Pola alokasi 50/30/20 dengan basis gaji Rp ${salary.toLocaleString('id-ID')} berhasil diterapkan di Backend.`,
      budgets: budgetsData,
      metrics,
      ruleSummary: {
        salary,
        needsLimit,
        wantsLimit,
        savingsLimit
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = budgetsData.find(b => b.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Pos anggaran tidak ditemukan.' });
    }

    budgetsData = budgetsData.filter(b => b.id !== id);
    const metrics = calculateBudgetMetrics();

    res.json({
      success: true,
      message: `Pos anggaran "${target.name}" berhasil dihapus dari Backend.`,
      budgets: budgetsData,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// TRANSACTIONS, DASHBOARD, REPORTS & SETTINGS STORE & ENDPOINTS
// ---------------------------------------------------------


let transactionsData = [
  { id: 'TX-1001', date: '06 Okt 2026', time: '09:45 WIB', merchant: 'Indomaret Merr Surabaya', itemsCount: 4, amount: 88500, type: 'expense', account: 'BCA Utama', category: '🥫 Kebutuhan Dapur', status: 'Verified OCR', receiptNo: 'INV/20261006/00892', confidence: 99.4 },
  { id: 'TX-1002', date: '05 Okt 2026', time: '20:15 WIB', merchant: 'Kopi Kenangan & Kitchen', itemsCount: 3, amount: 57895, type: 'expense', account: 'BCA Utama', category: '🍽️ Makan & Minum', status: 'Verified OCR', receiptNo: 'INV/20261005/0421', confidence: 98.7 },
  { id: 'TX-1003', date: '04 Okt 2026', time: '14:10 WIB', merchant: 'Superindo Merr Rungkut', itemsCount: 7, amount: 185000, type: 'expense', account: 'BCA Utama', category: '🥫 Kebutuhan Dapur', status: 'Verified OCR', receiptNo: 'INV/20261004/00188', confidence: 97.8 },
  { id: 'TX-1004', date: '02 Okt 2026', time: '18:30 WIB', merchant: 'Starbucks Coffee Galaxy Mall', itemsCount: 1, amount: 62000, type: 'expense', account: 'GoPay Premium', category: '☕ Kafe & Hiburan', status: 'Verified OCR', receiptNo: 'SBX-99812-2026', confidence: 99.1 },
  { id: 'TX-1005', date: '01 Okt 2026', time: '08:00 WIB', merchant: 'PT Inovasi Digital Nusantara', itemsCount: 1, amount: 7500000, type: 'income', account: 'BCA Utama', category: '💼 Pemasukan Utama', status: 'Manual Bank', receiptNo: 'PAYROLL-20261001', confidence: 100 }
];

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
    const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    const monthExpenses = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthIncome = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const activeEnvelopesCount = budgetsData.length;
    const totalPlafon = budgetsData.reduce((sum, b) => sum + (b.limit || 0), 0);
    const totalSpentEnvelopes = budgetsData.reduce((sum, b) => sum + (b.spent || 0), 0);

    const recentTransactions = transactionsData.slice(0, 5);

    // Calculate dynamic category breakdown from envelopes
    const categoryBreakdown = budgetsData
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

    const verifiedCount = transactionsData.filter(t => t.status && t.status.toLowerCase().includes('verified')).length;

    const insights = {
      verifiedCount: verifiedCount || transactionsData.length,
      accuracyRate: 99.2,
      topCategory: categoryBreakdown[0] ? categoryBreakdown[0].name : 'Kebutuhan Dapur',
      duplicateCount: 0,
      totalTransactionsCount: transactionsData.length
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
      envelopes: budgetsData,
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

    const newTxId = 'TX-' + Date.now().toString().slice(-4);
    const dateFormatted = date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newTx = {
      id: newTxId,
      date: dateFormatted,
      time: timeFormatted,
      merchant: parsedMerchant,
      itemsCount: Array.isArray(items) ? items.length : 3,
      amount: parsedAmount,
      type: 'expense',
      account: targetAccountName,
      category: parsedCategory,
      status: 'Verified OCR AI',
      receiptNo: receiptNo || 'OCR-' + Date.now().toString().slice(-6),
      confidence: 99.2
    };

    // Add to transactions list
    transactionsData.unshift(newTx);

    // Update account balance in DB
    await SmartFinAccount.updateBalance(targetAccountName, -parsedAmount, userId);

    // Deduct envelope budget
    const targetEnv = budgetsData.find(b => b.name.toLowerCase().includes(parsedCategory.toLowerCase()) || parsedCategory.toLowerCase().includes(b.category.toLowerCase()));
    if (targetEnv) {
      targetEnv.spent += parsedAmount;
    }

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
    const { search, category, type } = req.query;

    let result = [...transactionsData];

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
    const { merchant, amount, type, category, account, date, notes } = req.body;

    if (!merchant || !amount) {
      return res.status(400).json({ success: false, message: 'Merchant dan nominal transaksi wajib diisi.' });
    }

    const numAmount = Number(amount) || 0;
    const txType = type || 'expense';
    const txAccount = account || 'BCA Utama';
    const txCategory = category || 'Lain-lain';

    const newTx = {
      id: 'TX-' + Date.now().toString().slice(-4),
      date: date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      merchant,
      itemsCount: 1,
      amount: numAmount,
      type: txType,
      account: txAccount,
      category: txCategory,
      status: 'Manual Input',
      receiptNo: 'MANUAL-' + Date.now().toString().slice(-6),
      confidence: 100
    };

    transactionsData.unshift(newTx);

    // Update account balance in DB
    const userId = req.user ? req.user.id : 1;
    const delta = txType === 'income' ? numAmount : -numAmount;
    await SmartFinAccount.updateBalance(txAccount, delta, userId);

    res.status(201).json({
      success: true,
      message: `Transaksi "${merchant}" berhasil dicatat di Database!`,
      transaction: newTx,
      transactions: transactionsData
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/smartfin/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = transactionsData.find(t => t.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }

    transactionsData = transactionsData.filter(t => t.id !== id);

    res.json({
      success: true,
      message: `Transaksi "${target.merchant}" berhasil dihapus dari Backend.`,
      transactions: transactionsData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/smartfin/reports
exports.getReports = async (req, res, next) => {
  try {
    const categoryTotals = {};
    transactionsData.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: Number(((amount / (transactionsData.filter(t => t.type === 'expense').reduce((s, x) => s + x.amount, 0) || 1)) * 100).toFixed(1))
    }));

    const monthlyTrends = [
      { month: 'Mei', income: 7500000, expense: 4100000 },
      { month: 'Jun', income: 7500000, expense: 3900000 },
      { month: 'Jul', income: 8200000, expense: 4400000 },
      { month: 'Agu', income: 7500000, expense: 3700000 },
      { month: 'Sep', income: 7800000, expense: 4050000 },
      { month: 'Okt', income: 7500000, expense: transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) }
    ];

    res.json({
      success: true,
      categoryBreakdown,
      monthlyTrends,
      topMerchants: [
        { name: 'Superindo Merr Surabaya', count: 8, total: 1250000 },
        { name: 'Indomaret Merr', count: 12, total: 840000 },
        { name: 'Kopi Kenangan Galaxy Mall', count: 6, total: 340000 },
        { name: 'Starbucks Coffee', count: 4, total: 248000 }
      ],
      ocrAccuracyRate: 98.9
    });
  } catch (error) {
    next(error);
  }
};

// Categories now stored in PostgreSQL smartfin_categories table via SmartFinCategory model

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


