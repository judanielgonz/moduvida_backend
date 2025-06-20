const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  cedula: { type: String, required: false }, // Hacer cedula opcional
  apellido: { type: String, required: false } // Hacer apellido opcional
});

module.exports = mongoose.model('Cliente', clienteSchema);