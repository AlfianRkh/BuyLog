const express = require('express');
const upload = require('../middleware/upload');
const UploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Upload photo endpoint
router.post('/photo', authenticate, upload.single('photo'), UploadController.uploadPhoto);

module.exports = router;
