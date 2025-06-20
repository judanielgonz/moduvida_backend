const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  modelo: { type: mongoose.Schema.Types.ObjectId, ref: 'Modelo', required: true },
  tipoTransaccion: { type: String, required: true, enum: ['Entrada', 'Salida'] },
  cantidad: { type: Number, required: true },
  fechaTransaccion: { type: Date, default: Date.now },
  nota: { type: String },
});

module.exports = mongoose.model('Transaccion', transaccionSchema);