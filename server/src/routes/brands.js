const express = require('express');
const BrandController = require('../controllers/brandController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', BrandController.getAll);
router.post('/', BrandController.create);
router.put('/:id', BrandController.update);
router.delete('/:id', BrandController.delete);

module.exports = router;
