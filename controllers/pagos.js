const Pago = require('../models/Pago');

exports.getPagos = async (req, res, next) => {
  try {
    const pagos = await Pago.find().populate('pedido');
    res.status(200).json({ message: 'Pagos obtenidos', data: pagos });
  } catch (error) {
    next(error);
  }
};

exports.createPago = async (req, res, next) => {
  try {
    const pago = new Pago(req.body);
    await pago.save();
    res.status(201).json({ message: 'Pago creado', data: pago });
  } catch (error) {
    next(error);
  }
};

exports.updatePago = async (req, res, next) => {
  try {
    const pago = await Pago.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pago) {
      const error = new Error('Pago no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Pago actualizado', data: pago });
  } catch (error) {
    next(error);
  }
};

exports.deletePago = async (req, res, next) => {
  try {
    const pago = await Pago.findByIdAndDelete(req.params.id);
    if (!pago) {
      const error = new Error('Pago no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Pago eliminado' });
  } catch (error) {
    next(error);
  }
};