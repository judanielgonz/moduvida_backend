const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores');

router.get('/', trabajadoresController.getTrabajadores);
router.post('/', trabajadoresController.createTrabajador);
router.put('/:id', trabajadoresController.updateTrabajador);
router.delete('/:id', trabajadoresController.deleteTrabajador);

module.exports = router;