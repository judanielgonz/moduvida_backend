const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  modelo: { type: mongoose.Schema.Types.ObjectId, ref: 'Modelo', default: null },
  material: { // Nuevo campo para manejar materiales
    nombre: { type: String },
    unidadMedida: { type: String, default: 'unidad' }
  },
  cantidadDisponible: { type: Number, required: true, default: 0, min: 0 },
  cantidadReservada: { type: Number, required: true, default: 0, min: 0 }
});

// Asegurar que cada registro tenga solo un modelo o un material, pero no ambos ni ninguno
stockSchema.index({ modelo: 1, 'material.nombre': 1 }, { unique: true, partialFilterExpression: { $or: [{ 'modelo': { $exists: true } }, { 'material.nombre': { $exists: true } }] } });
stockSchema.pre('validate', function(next) {
  if ((this.modelo && this.material?.nombre) || (!this.modelo && !this.material?.nombre)) {
    next(new Error('Un registro de stock debe tener exactamente un modelo o un material.'));
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);