const express = require('express');
const router = express.Router();
const modelosController = require('../controllers/modelos');

router.get('/', modelosController.getModelos);
router.post('/', modelosController.createModelo);
router.put('/:id', modelosController.updateModelo);
router.delete('/:id', modelosController.deleteModelo);

module.exports = router;