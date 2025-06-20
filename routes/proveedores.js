const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedores');

router.get('/', proveedoresController.getProveedores);
router.post('/', proveedoresController.createProveedor);
router.put('/:id', proveedoresController.updateProveedor);
router.delete('/:id', proveedoresController.deleteProveedor);

module.exports = router;