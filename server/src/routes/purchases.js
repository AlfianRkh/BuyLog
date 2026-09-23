const express = require('express');
const { body } = require('express-validator');
const PurchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// Get all purchases with filters
router.get('/', PurchaseController.getAll);

// Get purchase locations for map
router.get('/locations-map', PurchaseController.getLocations);

// Get single purchase by ID
router.get('/:id', PurchaseController.getById);

// Create purchase (with auto-register product & price history)
router.post(
  '/',
  [
    body('purchase_date').notEmpty().withMessage('Tanggal pembelian wajib diisi'),
    validate
  ],
  PurchaseController.create
);

// Update purchase
router.put('/:id', PurchaseController.update);

// Delete purchase
router.delete('/:id', PurchaseController.delete);

module.exports = router;
