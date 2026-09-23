const express = require('express');
const authRoutes = require('./auth');
const purchaseRoutes = require('./purchases');
const productRoutes = require('./products');
const dashboardRoutes = require('./dashboard');
const reportRoutes = require('./reports');
const brandRoutes = require('./brands');
const categoryRoutes = require('./categories');
const storeRoutes = require('./stores');
const locationRoutes = require('./locations');
const uploadRoutes = require('./upload');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/products', productRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/stores', storeRoutes);
router.use('/locations', locationRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
