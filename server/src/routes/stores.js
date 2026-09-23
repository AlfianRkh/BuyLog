const express = require('express');
const StoreController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', StoreController.getAll);
router.get('/:id', StoreController.getById);
router.post('/', StoreController.create);
router.put('/:id', StoreController.update);
router.delete('/:id', StoreController.delete);

module.exports = router;
