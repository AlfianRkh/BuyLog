const express = require('express');
const router = express.Router();
const wishboardController = require('../controllers/wishboardController');

// GET dashboard summary & items
router.get('/dashboard', wishboardController.getDashboard);

// GET all items & settings
router.get('/items', wishboardController.getItems);

// POST create new item
router.post('/items', wishboardController.createItem);

// PUT update item status
router.put('/items/:id/status', wishboardController.updateItemStatus);

// POST add savings deposit
router.post('/items/:id/deposit', wishboardController.addDeposit);

// POST add pro rationale
router.post('/items/:id/pros', wishboardController.addPro);

// POST add con rationale
router.post('/items/:id/cons', wishboardController.addCon);

// POST skip item
router.post('/items/:id/skip', wishboardController.skipItem);

// DELETE item
router.delete('/items/:id', wishboardController.deleteItem);

// GET settings
router.get('/settings', wishboardController.getSettings);

// PUT update settings formula
router.put('/settings', wishboardController.updateSettings);

module.exports = router;
