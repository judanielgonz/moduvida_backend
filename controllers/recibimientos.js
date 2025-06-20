const Recibimiento = require('../models/Recibimiento');
const OrdenCompra = require('../models/OrdenCompra');
const Stock = require('../models/Stock');

exports.getRecibimientos = async (req, res, next) => {
  try {
    const recibimientos = await Recibimiento.find().populate({
      path: 'ordenCompra',
      populate: { path: 'proveedor' } // Poblar el campo 'proveedor' dentro de 'ordenCompra'
    });
    res.status(200).json({ message: 'Recibimientos obtenidos', data: recibimientos });
  } catch (error) {
    next(error);
  }
};

exports.createRecibimiento = async (req, res, next) => {
  try {
    const { ordenCompra, materialesRecibidos, fechaRecibimiento } = req.body;

    const orden = await OrdenCompra.findById(ordenCompra).populate('proveedor');
    if (!orden) {
      const error = new Error('Orden de compra no encontrada');
      error.status = 404;
      throw error;
    }

    const recibimiento = new Recibimiento({
      ordenCompra,
      materialesRecibidos,
      fechaRecibimiento,
      estado: 'Pendiente'
    });

    await recibimiento.save();
    res.status(201).json({ message: 'Recibimiento creado', data: recibimiento });
  } catch (error) {
    next(error);
  }
};

exports.confirmarRecibimiento = async (req, res, next) => {
  try {
    const recibimiento = await Recibimiento.findById(req.params.id).populate({
      path: 'ordenCompra',
      populate: { path: 'proveedor' }
    });
    if (!recibimiento) {
      const error = new Error('Recibimiento no encontrado');
      error.status = 404;
      throw error;
    }

    if (recibimiento.estado === 'Recibido') {
      const error = new Error('El recibimiento ya fue confirmado');
      error.status = 400;
      throw error;
    }

    // Actualizar stock para cada material recibido
    for (const material of recibimiento.materialesRecibidos) {
      let stock = await Stock.findOne({ 'material.nombre': material.nombre });
      if (stock) {
        stock.cantidadDisponible += material.cantidad;
      } else {
        stock = new Stock({
          material: {
            nombre: material.nombre,
            unidadMedida: material.unidadMedida
          },
          cantidadDisponible: material.cantidad,
          cantidadReservada: 0
        });
      }
      await stock.save();
    }

    recibimiento.estado = 'Recibido';
    await recibimiento.save();
    const recibimientoActualizado = await Recibimiento.findById(recibimiento._id).populate({
      path: 'ordenCompra',
      populate: { path: 'proveedor' }
    });
    res.status(200).json({ message: 'Recibimiento confirmado', data: recibimientoActualizado });
  } catch (error) {
    next(error);
  }
};