const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenes');

router.get('/', ordenesController.getOrdenes);
router.post('/', ordenesController.createOrden);
router.put('/:id', ordenesController.updateOrden);
router.delete('/:id', ordenesController.deleteOrden);

module.exports = router;