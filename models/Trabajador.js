const mongoose = require('mongoose');

const trabajadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  cargo: { type: String, required: true },
  fechaIngreso: { type: Date, required: true },
  salario: { type: Number, required: true },
});

module.exports = mongoose.model('Trabajador', trabajadorSchema);