const Trabajador = require('../models/Trabajador');

exports.getTrabajadores = async (req, res, next) => {
  try {
    const trabajadores = await Trabajador.find();
    res.status(200).json({ message: 'Trabajadores obtenidos', data: trabajadores });
  } catch (error) {
    next(error);
  }
};

exports.createTrabajador = async (req, res, next) => {
  try {
    const trabajador = new Trabajador(req.body);
    await trabajador.save();
    res.status(201).json({ message: 'Trabajador creado', data: trabajador });
  } catch (error) {
    next(error);
  }
};

exports.updateTrabajador = async (req, res, next) => {
  try {
    const trabajador = await Trabajador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trabajador) {
      const error = new Error('Trabajador no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Trabajador actualizado', data: trabajador });
  } catch (error) {
    next(error);
  }
};

exports.deleteTrabajador = async (req, res, next) => {
  try {
    const trabajador = await Trabajador.findByIdAndDelete(req.params.id);
    if (!trabajador) {
      const error = new Error('Trabajador no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Trabajador eliminado' });
  } catch (error) {
    next(error);
  }
};