const express = require('express');
const { body } = require('express-validator');
const ProductController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// Get all products
router.get('/', ProductController.getAll);

// Check if product exists by name & brand (Requirement #3 auto-check)
router.get('/check-existence', ProductController.checkExistence);

// Get product price reference across stores (Requirement #5)
router.get('/:id/price-reference', ProductController.getPriceReference);

// Get product price history (Requirement #4)
router.get('/:id/price-history', ProductController.getPriceHistory);

// Get single product
router.get('/:id', ProductController.getById);

// Create product
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nama produk wajib diisi'),
    validate
  ],
  ProductController.create
);

// Update product
router.put('/:id', ProductController.update);

// Delete product
router.delete('/:id', ProductController.delete);

module.exports = router;
