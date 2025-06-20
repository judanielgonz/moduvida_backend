const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  fechaEntrega: { type: Date, required: true },
  estadoPago: { type: String, required: true, enum: ['Pendiente', 'Completado'] },
  estadoEntrega: { type: String, required: true, enum: ['Pendiente', 'Entregado'] },
  modelos: [{
    modelo: { type: mongoose.Schema.Types.ObjectId, ref: 'Modelo', required: true },
    cantidad: { type: Number, required: true },
  }],
  metodoPago: { type: String, enum: ['Efectivo', 'Tarjeta'], required: true },
  conFactura: { type: Boolean, default: false },
  precioTotal: { type: Number, required: true },
});

module.exports = mongoose.model('Pedido', pedidoSchema);