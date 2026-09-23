const express = require('express');
const LocationController = require('../controllers/locationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', LocationController.getAll);
router.post('/', LocationController.create);

module.exports = router;
