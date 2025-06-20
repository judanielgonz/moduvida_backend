const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

router.get('/ordenes-pendientes', estadisticasController.getOrdenesPendientes);
router.get('/stock-bajo', estadisticasController.getStockBajo);
router.get('/ingresos-mes', estadisticasController.getIngresosMes);
router.get('/ventas-por-modelo', estadisticasController.getVentasPorModelo);
router.get('/actividad-reciente', estadisticasController.getActividadReciente);

module.exports = router;