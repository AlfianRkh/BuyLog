const express = require('express');
const ReportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get monthly reports and statistics
router.get('/monthly', ReportController.getMonthlyReports);

module.exports = router;
