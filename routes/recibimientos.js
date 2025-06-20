const express = require('express');
const router = express.Router();
const recibimientosController = require('../controllers/recibimientos');

router.get('/', recibimientosController.getRecibimientos);
router.post('/', recibimientosController.createRecibimiento);
router.post('/:id/confirmar', recibimientosController.confirmarRecibimiento);

module.exports = router;