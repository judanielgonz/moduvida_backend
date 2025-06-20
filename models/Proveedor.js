const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true },
  comentario: { type: String },
  tiempoEntregaEstimado: { type: Number }, // En días
  contactos: [{
    nombreContacto: { type: String, required: true },
    telefonoContacto: { type: String, required: true },
    emailContacto: { type: String, required: true },
    cargoContacto: { type: String, required: true }
  }],
  catalogo: [{ // Nuevo campo para el catálogo de materiales
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidadDisponible: { type: Number, required: true, min: 0 },
    unidadMedida: { type: String, default: 'unidad' }
  }]
});

module.exports = mongoose.model('Proveedor', proveedorSchema);