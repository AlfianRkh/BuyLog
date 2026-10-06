const express = require('express');
const router = express.Router();
const stockPantryController = require('../controllers/stockPantryController');

// GET dashboard & all data
router.get('/dashboard', stockPantryController.getDashboard);

// GET pantry items
router.get('/items', stockPantryController.getItems);

// POST create pantry item
router.post('/items', stockPantryController.createItem);

// PUT update pantry item
router.put('/items/:id', stockPantryController.updateItem);

// DELETE pantry item
router.delete('/items/:id', stockPantryController.deleteItem);

// POST consume item quantity
router.post('/items/:id/consume', stockPantryController.consumeItem);

// POST add shopping list item
router.post('/shopping', stockPantryController.addShoppingItem);

// PUT toggle shopping list item checked state
router.put('/shopping/:id/toggle', stockPantryController.toggleShoppingCheck);

// POST commit restock
router.post('/shopping/commit-restock', stockPantryController.commitRestock);

// POST add new storage zone
router.post('/zones', stockPantryController.createZone);

module.exports = router;
