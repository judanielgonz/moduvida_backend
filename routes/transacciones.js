const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transacciones');

router.get('/', transaccionesController.getTransacciones);
router.post('/', transaccionesController.createTransaccion);

module.exports = router;