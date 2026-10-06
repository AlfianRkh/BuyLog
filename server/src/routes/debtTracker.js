const express = require('express');
const router = express.Router();
const debtTrackerController = require('../controllers/debtTrackerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Contacts
router.get('/contacts', debtTrackerController.getContacts);
router.post('/contacts', debtTrackerController.createContact);
router.get('/contacts/:id/summary-text', debtTrackerController.getContactWASummary);

// Debts & Summary
router.get('/debts/summary', debtTrackerController.getDebtSummary);
router.get('/debts', debtTrackerController.getDebts);
router.post('/debts', debtTrackerController.createDebt);
router.get('/debts/:id', debtTrackerController.getDebtDetail);
router.post('/debts/:id/payments', debtTrackerController.recordPayment);
router.put('/debts/:id/cancel', debtTrackerController.cancelDebt);
router.delete('/debts/:id', debtTrackerController.deleteDebt);

// Reports & Settings
router.get('/reports/monthly', debtTrackerController.getMonthlyReport);
router.get('/settings', debtTrackerController.getSettings);
router.put('/settings', debtTrackerController.updateSettings);

module.exports = router;
