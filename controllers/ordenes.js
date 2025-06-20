const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Recibimiento = require('../models/Recibimiento');

exports.getOrdenes = async (req, res, next) => {
  try {
    const ordenes = await OrdenCompra.find().populate('proveedor');
    res.status(200).json({ data: ordenes });
  } catch (error) {
    next(error);
  }
};

exports.createOrden = async (req, res, next) => {
  try {
    const { proveedor, fecha, estado, detalles } = req.body;

    const proveedorDoc = await Proveedor.findById(proveedor);
    if (!proveedorDoc) {
      const error = new Error('Proveedor no encontrado');
      error.status = 404;
      throw error;
    }

    let precioTotal = 0;
    for (const detalle of detalles) {
      const material = proveedorDoc.catalogo.find(m => m.nombre === detalle.nombre);
      if (!material) {
        const error = new Error(`Material no encontrado en el catálogo del proveedor: ${detalle.nombre}`);
        error.status = 400;
        throw error;
      }
      if (material.cantidadDisponible < detalle.cantidad) {
        const error = new Error(`Cantidad insuficiente para el material ${detalle.nombre}. Disponible: ${material.cantidadDisponible}, Solicitado: ${detalle.cantidad}`);
        error.status = 400;
        throw error;
      }
      detalle.precioUnitario = material.precio;
      detalle.unidadMedida = material.unidadMedida;
      detalle.contacto = proveedorDoc.contactos[0]?._id.toString() || null;
      precioTotal += material.precio * detalle.cantidad;
    }

    const orden = new OrdenCompra({ proveedor, fecha, estado, detalles, precioTotal });
    const ordenGuardada = await orden.save();
    await ordenGuardada.populate('proveedor');

    if (ordenGuardada.estado === 'Recibida') {
      const recibimientoExistente = await Recibimiento.findOne({ ordenCompra: ordenGuardada._id });
      if (!recibimientoExistente) {
        const recibimiento = new Recibimiento({
          ordenCompra: ordenGuardada._id,
          materialesRecibidos: ordenGuardada.detalles.map(detalle => ({
            nombre: detalle.nombre,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            unidadMedida: detalle.unidadMedida
          })),
          fechaRecibimiento: new Date(),
          estado: 'Pendiente'
        });
        await recibimiento.save();
      }
    }

    res.status(201).json({ data: ordenGuardada });
  } catch (error) {
    next(error);
  }
};

exports.updateOrden = async (req, res, next) => {
  try {
    const { proveedor, fecha, estado, detalles } = req.body;

    const ordenActual = await OrdenCompra.findById(req.params.id);
    if (!ordenActual) {
      const error = new Error('Orden no encontrada');
      error.status = 404;
      throw error;
    }

    const proveedorIdToUse = proveedor || ordenActual.proveedor;
    const proveedorDoc = await Proveedor.findById(proveedorIdToUse);
    if (!proveedorDoc) {
      console.warn(`Proveedor no encontrado para la orden ${req.params.id}. Continuando con la actualización sin validar catálogo.`);
    }

    let precioTotal = 0;
    for (const detalle of detalles || ordenActual.detalles || []) {
      if (proveedorDoc) {
        const material = proveedorDoc.catalogo.find(m => m.nombre === detalle.nombre);
        if (!material && detalle.nombre) {
          const error = new Error(`Material no encontrado en el catálogo del proveedor: ${detalle.nombre}`);
          error.status = 400;
          throw error;
        }
        if (material && material.cantidadDisponible < (detalle.cantidad || 0)) {
          const error = new Error(`Cantidad insuficiente para el material ${detalle.nombre}. Disponible: ${material.cantidadDisponible}, Solicitado: ${detalle.cantidad}`);
          error.status = 400;
          throw error;
        }
        detalle.precioUnitario = material ? material.precio : (detalle.precioUnitario || 0);
        detalle.unidadMedida = material ? material.unidadMedida : (detalle.unidadMedida || 'unidad');
        detalle.contacto = proveedorDoc.contactos[0]?._id.toString() || null;
        precioTotal += (material ? material.precio : (detalle.precioUnitario || 0)) * (detalle.cantidad || 0);
      } else {
        // Si no hay proveedor, usamos los valores existentes del detalle
        precioTotal += (detalle.precioUnitario || 0) * (detalle.cantidad || 0);
      }
    }

    const orden = await OrdenCompra.findByIdAndUpdate(
      req.params.id,
      { proveedor: proveedorIdToUse, fecha, estado, detalles: detalles || ordenActual.detalles, precioTotal },
      { new: true }
    ).populate('proveedor');
    if (!orden) {
      const error = new Error('Orden no encontrada');
      error.status = 404;
      throw error;
    }

    if (estado === 'Recibida' && ordenActual.estado !== 'Recibida') {
      const recibimientoExistente = await Recibimiento.findOne({ ordenCompra: orden._id });
      if (!recibimientoExistente) {
        const recibimiento = new Recibimiento({
          ordenCompra: orden._id,
          materialesRecibidos: orden.detalles.map(detalle => ({
            nombre: detalle.nombre,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            unidadMedida: detalle.unidadMedida
          })),
          fechaRecibimiento: new Date(),
          estado: 'Pendiente'
        });
        await recibimiento.save();
      }
    }

    res.status(200).json({ data: orden });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrden = async (req, res, next) => {
  try {
    const orden = await OrdenCompra.findByIdAndDelete(req.params.id);
    if (!orden) {
      const error = new Error('Orden no encontrada');
      error.status = 404;
      throw error;
    }
    await Recibimiento.deleteOne({ ordenCompra: orden._id });
    res.status(200).json({ message: 'Orden eliminada' });
  } catch (error) {
    next(error);
  }
};