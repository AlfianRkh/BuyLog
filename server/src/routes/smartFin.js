const express = require('express');
const router = express.Router();
const smartFinController = require('../controllers/smartFinController');

// Split-Bill Endpoints
router.get('/split-bill', smartFinController.getSplitBill);
router.put('/split-bill/members/:id/toggle-paid', smartFinController.toggleMemberPaid);
router.post('/split-bill/members', smartFinController.addMember);

// Accounts & Wallet Endpoints
router.get('/accounts', smartFinController.getAccounts);
router.get('/accounts/:id/mutations', smartFinController.getAccountMutations);
router.post('/accounts', smartFinController.createAccount);
router.post('/accounts/transfer', smartFinController.transferAccounts);
router.put('/accounts/:id/set-default', smartFinController.setDefaultAccount);
router.delete('/accounts/:id', smartFinController.deleteAccount);

// Pos Anggaran / Budget Endpoints
router.get('/budgets', smartFinController.getBudgets);
router.post('/budgets', smartFinController.createBudget);
router.post('/budgets/apply-503020', smartFinController.applyRule503020);
router.delete('/budgets/:id', smartFinController.deleteBudget);

// Dashboard Endpoint
router.get('/dashboard', smartFinController.getDashboard);

// Scan OCR Struk Endpoint
router.post('/scan-receipt', smartFinController.scanReceipt);

// Transactions Endpoints
router.get('/transactions', smartFinController.getTransactions);
router.post('/transactions', smartFinController.createTransaction);
router.delete('/transactions/:id', smartFinController.deleteTransaction);

// Reports Analytics Endpoint
router.get('/reports', smartFinController.getReports);

// Settings OCR Endpoint
router.get('/settings', smartFinController.getSettings);
router.put('/settings', smartFinController.updateSettings);

// Master Kategori Endpoints
router.get('/categories', smartFinController.getCategories);
router.post('/categories', smartFinController.createCategory);
router.delete('/categories/:id', smartFinController.deleteCategory);

module.exports = router;



