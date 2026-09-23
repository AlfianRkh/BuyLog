const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get monthly dashboard data
router.get('/monthly', DashboardController.getMonthly);

module.exports = router;
