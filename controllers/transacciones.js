const Transaccion = require('../models/Transaccion');
const Stock = require('../models/Stock');

exports.createTransaccion = async (req, res, next) => {
  try {
    const { modelo, tipoTransaccion, cantidad, nota } = req.body;

    // Verificar stock si es una salida
    if (tipoTransaccion === 'Salida') {
      const stock = await Stock.findOne({ modelo });
      if (!stock || stock.cantidadDisponible < cantidad) {
        const error = new Error('Stock insuficiente');
        error.status = 400;
        throw error;
      }
    }

    // Actualizar stock
    let stock = await Stock.findOne({ modelo });
    if (stock) {
      if (tipoTransaccion === 'Entrada') {
        stock.cantidadDisponible += cantidad;
      } else if (tipoTransaccion === 'Salida') {
        stock.cantidadDisponible -= cantidad;
      }
      await stock.save();
    } else {
      stock = new Stock({
        modelo,
        cantidadDisponible: tipoTransaccion === 'Entrada' ? cantidad : 0,
        cantidadReservada: 0,
      });
      await stock.save();
    }

    const transaccion = new Transaccion({ modelo, tipoTransaccion, cantidad, nota });
    await transaccion.save();

    res.status(201).json({ message: 'Transacción creada', data: transaccion });
  } catch (error) {
    next(error);
  }
};

exports.getTransacciones = async (req, res, next) => {
  try {
    const transacciones = await Transaccion.find().populate('modelo');
    res.status(200).json({ message: 'Transacciones obtenidas', data: transacciones });
  } catch (error) {
    next(error);
  }
};