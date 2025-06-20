const mongoose = require('mongoose');

const modeloSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, required: true },
  material: { type: String },
  alto: { type: Number },
  ancho: { type: Number },
  precio: { type: Number, required: true },
  imagenUrl: { type: String },
  materiales: [{ // Cambiado de "articulos" a "materiales"
    nombre: { type: String, required: true }, // Nombre del material del stock
    cantidad: { type: Number, required: true, min: 1 }
  }],
  costoProduccion: { type: Number, default: 0 },
  precioVenta: { type: Number, required: true }
});

module.exports = mongoose.model('Modelo', modeloSchema);