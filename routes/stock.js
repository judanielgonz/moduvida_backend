const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock');

router.get('/', stockController.getStock);
router.put('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);
router.post('/transacciones', stockController.procesarTransaccion);

module.exports = router;