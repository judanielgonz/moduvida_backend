const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos');

router.get('/', pedidosController.getPedidos);
router.post('/', pedidosController.createPedido);
router.put('/:id', pedidosController.updatePedido);
router.delete('/:id', pedidosController.deletePedido);
router.put('/:id/completarEntrega', pedidosController.completarEntrega);
router.put('/:id/estado', pedidosController.updateEstado);

module.exports = router;