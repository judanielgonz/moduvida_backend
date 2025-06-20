const mongoose = require('mongoose');

const ordenCompraSchema = new mongoose.Schema({
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  fecha: { type: Date, required: true },
  estado: { type: String, required: true, enum: ['Pendiente', 'En proceso', 'Recibida'] },
  detalles: [{
    nombre: { type: String, required: true }, // Nombre del material del catálogo
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true },
    unidadMedida: { type: String, default: 'unidad' },
    contacto: { type: String } // ID del contacto asociado
  }],
  precioTotal: { type: Number, required: true }
});

module.exports = mongoose.model('OrdenCompra', ordenCompraSchema);