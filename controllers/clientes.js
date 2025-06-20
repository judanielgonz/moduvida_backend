const Cliente = require('../models/Cliente');

exports.getClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json({ message: 'Clientes obtenidos', data: clientes });
  } catch (error) {
    next(error);
  }
};

exports.createCliente = async (req, res, next) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json({ message: 'Cliente creado', data: cliente });
  } catch (error) {
    next(error);
  }
};

exports.updateCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) {
      const error = new Error('Cliente no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Cliente actualizado', data: cliente });
  } catch (error) {
    next(error);
  }
};

exports.deleteCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      const error = new Error('Cliente no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
};