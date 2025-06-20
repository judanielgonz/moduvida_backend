const express = require('express');
const router = express.Router();

router.use('/proveedores', require('./proveedores'));
router.use('/clientes', require('./clientes'));
router.use('/modelos', require('./modelos'));
router.use('/stock', require('./stock'));
router.use('/ordenes', require('./ordenes'));
router.use('/pedidos', require('./pedidos'));
router.use('/pagos', require('./pagos'));
router.use('/trabajadores', require('./trabajadores'));
router.use('/transacciones', require('./transacciones'));
router.use('/recibimientos', require('./recibimientos')); // Nueva ruta
router.use('/informes', require('./informes'));
router.use('/estadisticas', require('./estadisticas'));

module.exports = router;