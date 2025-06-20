const Modelo = require('../models/Modelo');
const Stock = require('../models/Stock');

exports.getModelos = async (req, res, next) => {
  try {
    const modelos = await Modelo.find();
    res.status(200).json({ message: 'Modelos obtenidos', data: modelos });
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    next(error);
  }
};

exports.createModelo = async (req, res, next) => {
  try {
    const { materiales, precioVenta, ...rest } = req.body;

    let costoProduccion = 0;
    if (materiales && materiales.length > 0) {
      for (const item of materiales) {
        const stockMaterial = await Stock.findOne({ 'material.nombre': item.nombre });
        if (!stockMaterial) {
          const error = new Error(`Material no encontrado en el stock: ${item.nombre}`);
          error.status = 400;
          throw error;
        }
        const precioUnitario = stockMaterial.cantidadDisponible > 0 ? (await calculateMaterialPrice(item.nombre)) : 0;
        costoProduccion += precioUnitario * item.cantidad;
      }
    }

    const modelo = new Modelo({
      ...rest,
      materiales: materiales || [],
      costoProduccion,
      precioVenta
    });
    await modelo.save();
    res.status(201).json({ message: 'Modelo creado', data: modelo });
  } catch (error) {
    console.error('Error al crear modelo:', error);
    if (error.code === 11000 && error.keyPattern.nombre) {
      const customError = new Error('Ya existe un modelo con este nombre');
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

exports.updateModelo = async (req, res, next) => {
  try {
    const { materiales, precioVenta, ...rest } = req.body;

    let costoProduccion = 0;
    if (materiales && materiales.length > 0) {
      for (const item of materiales) {
        const stockMaterial = await Stock.findOne({ 'material.nombre': item.nombre });
        if (!stockMaterial) {
          const error = new Error(`Material no encontrado en el stock: ${item.nombre}`);
          error.status = 400;
          throw error;
        }
        const precioUnitario = stockMaterial.cantidadDisponible > 0 ? (await calculateMaterialPrice(item.nombre)) : 0;
        costoProduccion += precioUnitario * item.cantidad;
      }
    }

    const modelo = await Modelo.findByIdAndUpdate(
      req.params.id,
      { ...rest, materiales: materiales || [], costoProduccion, precioVenta },
      { new: true }
    );
    if (!modelo) {
      const error = new Error('Modelo no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Modelo actualizado', data: modelo });
  } catch (error) {
    console.error('Error al actualizar modelo:', error);
    if (error.code === 11000 && error.keyPattern.nombre) {
      const customError = new Error('Ya existe un modelo con este nombre');
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

exports.deleteModelo = async (req, res, next) => {
  try {
    const modelo = await Modelo.findByIdAndDelete(req.params.id);
    if (!modelo) {
      const error = new Error('Modelo no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Modelo eliminado' });
  } catch (error) {
    console.error('Error al eliminar modelo:', error);
    next(error);
  }
};

// Función auxiliar para calcular el precio promedio de un material
async function calculateMaterialPrice(nombre) {
  const recibimientos = await Recibimiento.find({ 'materialesRecibidos.nombre': nombre });
  if (recibimientos.length === 0) return 0;
  let totalPrecio = 0;
  let totalCantidad = 0;
  recibimientos.forEach(r => {
    r.materialesRecibidos.forEach(m => {
      if (m.nombre === nombre) {
        totalPrecio += m.precioUnitario * m.cantidad;
        totalCantidad += m.cantidad;
      }
    });
  });
  return totalCantidad > 0 ? totalPrecio / totalCantidad : 0;
}