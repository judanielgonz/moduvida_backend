const Stock = require('../models/Stock');
const Modelo = require('../models/Modelo');

exports.getStock = async (req, res, next) => {
  try {
    const stock = await Stock.find().populate('modelo');
    res.status(200).json({ message: 'Stock obtenido', data: stock });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidadDisponible, cantidadReservada } = req.body;
    const stock = await Stock.findByIdAndUpdate(
      id,
      { cantidadDisponible, cantidadReservada },
      { new: true }
    ).populate('modelo');
    if (!stock) {
      const error = new Error('Stock no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Stock actualizado', data: stock });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    next(error);
  }
};

exports.deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      const error = new Error('Stock no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Stock eliminado' });
  } catch (error) {
    console.error('Error al eliminar stock:', error);
    next(error);
  }
};

exports.procesarTransaccion = async (req, res, next) => {
  try {
    const { modelo, tipoTransaccion, cantidad, nota } = req.body;

    // Validaciones básicas
    if (!modelo) {
      const error = new Error('Debe especificar un modelo.');
      error.status = 400;
      throw error;
    }
    if (!cantidad || cantidad < 1) {
      const error = new Error('La cantidad debe ser mayor a 0.');
      error.status = 400;
      throw error;
    }

    const modeloData = await Modelo.findById(modelo);
    if (!modeloData) {
      const error = new Error('Modelo no encontrado.');
      error.status = 404;
      throw error;
    }

    let stockModelo = await Stock.findOne({ modelo }).populate('modelo');

    if (tipoTransaccion === 'Salida') {
      if (!stockModelo || stockModelo.cantidadDisponible < cantidad) {
        const error = new Error('No hay suficiente stock disponible para esta salida.');
        error.status = 400;
        throw error;
      }
      stockModelo.cantidadDisponible -= cantidad;
    } else if (tipoTransaccion === 'Entrada') {
      const materialesRequeridos = modeloData.materiales || [];
      if (materialesRequeridos.length === 0) {
        const error = new Error('El modelo no tiene materiales asociados.');
        error.status = 400;
        throw error;
      }

      for (const reqMaterial of materialesRequeridos) {
        const cantidadNecesaria = reqMaterial.cantidad * cantidad;
        let stockMaterial = await Stock.findOne({ 'material.nombre': reqMaterial.nombre });
        if (!stockMaterial) {
          const error = new Error(`No hay stock registrado para el material "${reqMaterial.nombre}". Asegúrate de recibirlo primero.`);
          error.status = 400;
          throw error;
        }
        if (stockMaterial.cantidadDisponible < cantidadNecesaria) {
          const error = new Error(`No hay suficiente stock del material "${reqMaterial.nombre}" para producir ${cantidad} unidad(es) del modelo. Necesitas ${cantidadNecesaria}, pero hay ${stockMaterial.cantidadDisponible} disponible(s).`);
          error.status = 400;
          throw error;
        }
        stockMaterial.cantidadDisponible -= cantidadNecesaria;
        await stockMaterial.save();
      }
      if (!stockModelo) {
        stockModelo = new Stock({ modelo, cantidadDisponible: 0, cantidadReservada: 0 });
      }
      stockModelo.cantidadDisponible += cantidad;
    }

    await stockModelo.save();

    res.status(200).json({ message: 'Transacción procesada', data: stockModelo });
  } catch (error) {
    console.error('Error al procesar transacción:', error);
    next(error);
  }
};