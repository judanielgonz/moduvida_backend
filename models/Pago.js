const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  fechaPago: { type: Date, required: true },
  monto: { type: Number, required: true },
  metodoPago: { type: String, required: true },
});

module.exports = mongoose.model('Pago', pagoSchema);