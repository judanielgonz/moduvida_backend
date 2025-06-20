const express = require('express');
const router = express.Router();
const informesController = require('../controllers/informes');

router.get('/ventas', informesController.generarInformeVentas);
router.get('/inventario', informesController.generarInformeInventario);

module.exports = router;