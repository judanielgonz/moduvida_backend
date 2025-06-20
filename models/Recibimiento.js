const mongoose = require('mongoose');

const recibimientoSchema = new mongoose.Schema({
  ordenCompra: { type: mongoose.Schema.Types.ObjectId, ref: 'OrdenCompra', required: true },
  materialesRecibidos: [{
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true },
    unidadMedida: { type: String, default: 'unidad' }
  }],
  fechaRecibimiento: { type: Date, required: true },
  estado: { type: String, required: true, enum: ['Pendiente', 'Recibido'], default: 'Pendiente' }
});

module.exports = mongoose.model('Recibimiento', recibimientoSchema);