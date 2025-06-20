const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos');

router.get('/', pagosController.getPagos);
router.post('/', pagosController.createPago);
router.put('/:id', pagosController.updatePago);
router.delete('/:id', pagosController.deletePago);

module.exports = router;