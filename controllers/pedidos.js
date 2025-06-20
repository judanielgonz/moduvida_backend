// pedidiosController.js
const Pedido = require('../models/Pedido');
const PedidoBuilder = require('../builders/pedidoBuilder');
const Stock = require('../models/Stock');
const Modelo = require('../models/Modelo');

exports.getPedidos = async (req, res, next) => {
  try {
    const pedidos = await Pedido.find().populate('cliente modelos.modelo');
    res.status(200).json({ message: 'Pedidos obtenidos', data: pedidos });
  } catch (error) {
    next(error);
  }
};

exports.createPedido = async (req, res, next) => {
  try {
    const { cliente, fechaEntrega, estadoPago, estadoEntrega, modelos, metodoPago, conFactura } = req.body;

    if (!metodoPago || !['Efectivo', 'Tarjeta'].includes(metodoPago)) {
      const error = new Error('Debe especificar un método de pago válido (Efectivo o Tarjeta)');
      error.status = 400;
      throw error;
    }

    const builder = new PedidoBuilder()
      .setCliente(cliente)
      .setFechaEntrega(fechaEntrega)
      .setEstadoPago(estadoPago)
      .setEstadoEntrega(estadoEntrega)
      .setMetodoPago(metodoPago)
      .setConFactura(conFactura);

    for (const item of modelos) {
      builder.addModelo(item.modelo, item.cantidad);
    }

    await builder.validateAndCalculate();
    await builder.updateStock();
    const pedidoGuardado = await builder.build();

    const pedidoPoblado = await Pedido.findById(pedidoGuardado._id)
      .populate('cliente')
      .populate('modelos.modelo');
    res.status(201).json({ message: 'Pedido creado', data: pedidoPoblado });
  } catch (error) {
    next(error);
  }
};

exports.updatePedido = async (req, res, next) => {
  try {
    const { cliente, fechaEntrega, estadoPago, estadoEntrega, modelos, metodoPago, conFactura } = req.body;

    if (!Array.isArray(modelos)) {
      const error = new Error('El campo "modelos" debe ser un array');
      error.status = 400;
      throw error;
    }

    if (modelos.length === 0) {
      const error = new Error('Debe incluir al menos un modelo en el pedido');
      error.status = 400;
      throw error;
    }

    for (const item of modelos) {
      if (!item.modelo || !item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        const error = new Error('Cada modelo debe tener un ID válido y una cantidad mayor a 0');
        error.status = 400;
        throw error;
      }
    }

    const pedidoActual = await Pedido.findById(req.params.id);
    if (!pedidoActual) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    for (const item of pedidoActual.modelos) {
      const stock = await Stock.findOne({ modelo: item.modelo });
      if (stock) {
        stock.cantidadReservada -= item.cantidad;
        stock.cantidadDisponible += item.cantidad;
        await stock.save();
      }
    }

    const builder = new PedidoBuilder()
      .setCliente(cliente)
      .setFechaEntrega(fechaEntrega)
      .setEstadoPago(estadoPago)
      .setEstadoEntrega(estadoEntrega)
      .setMetodoPago(metodoPago)
      .setConFactura(conFactura);

    for (const item of modelos) {
      builder.addModelo(item.modelo, item.cantidad);
    }

    await builder.validateAndCalculate();
    await builder.updateStock();

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      {
        cliente,
        fechaEntrega,
        estadoPago,
        estadoEntrega,
        modelos,
        metodoPago,
        conFactura,
        precioTotal: builder.pedidoData.precioTotal,
      },
      { new: true }
    ).populate('cliente').populate('modelos.modelo');

    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    res.status(200).json({ message: 'Pedido actualizado', data: pedido });
  } catch (error) {
    next(error);
  }
};

exports.deletePedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    for (const item of pedido.modelos) {
      const stock = await Stock.findOne({ modelo: item.modelo });
      if (stock) {
        stock.cantidadReservada -= item.cantidad;
        stock.cantidadDisponible += item.cantidad;
        await stock.save();
      }
    }

    await Pedido.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pedido eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.completarEntrega = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('modelos.modelo');
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    if (pedido.estadoEntrega === 'Entregado') {
      const error = new Error('El pedido ya fue entregado');
      error.status = 400;
      throw error;
    }

    for (const modelo of pedido.modelos) {
      const stock = await Stock.findOne({ modelo: modelo.modelo });
      if (!stock) {
        const error = new Error(`No hay stock disponible para el modelo ${modelo.modelo._id}`);
        error.status = 400;
        throw error;
      }
      if (stock.cantidadReservada < modelo.cantidad) {
        const error = new Error(`Cantidad reservada insuficiente para el modelo ${modelo.modelo.nombre}: ${stock.cantidadReservada} reservadas, se necesitan ${modelo.cantidad}`);
        error.status = 400;
        throw error;
      }
      const cantidadReservadaAntes = stock.cantidadReservada;
      stock.cantidadReservada -= modelo.cantidad;
      await stock.save();
      console.log(`Stock reservado del modelo ${modelo.modelo.nombre} reducido de ${cantidadReservadaAntes} a ${stock.cantidadReservada}`);
    }

    pedido.estadoEntrega = 'Entregado';
    const pedidoActualizado = await pedido.save();

    const pedidoPoblado = await Pedido.findById(pedidoActualizado._id)
      .populate('cliente')
      .populate('modelos.modelo');
    res.status(200).json({ message: 'Entrega completada', data: pedidoPoblado });
  } catch (error) {
    next(error);
  }
};

exports.updateEstado = async (req, res, next) => {
  try {
    const { estadoPago, estadoEntrega, metodoPago, conFactura } = req.body;
    if (!estadoPago && !estadoEntrega && !metodoPago && conFactura === undefined) {
      const error = new Error('Debe especificar al menos un estado para actualizar');
      error.status = 400;
      throw error;
    }

    const pedido = await Pedido.findById(req.params.id).populate('modelos.modelo');
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    let needsPriceRecalculation = false;

    // Manejar cambio a "Entregado"
    if (estadoEntrega && estadoEntrega === 'Entregado' && pedido.estadoEntrega !== 'Entregado') {
      for (const modelo of pedido.modelos) {
        const stock = await Stock.findOne({ modelo: modelo.modelo });
        if (!stock) {
          const error = new Error(`No hay stock disponible para el modelo ${modelo.modelo._id}`);
          error.status = 400;
          throw error;
        }
        if (stock.cantidadReservada < modelo.cantidad) {
          const error = new Error(`Cantidad reservada insuficiente para el modelo ${modelo.modelo.nombre}: ${stock.cantidadReservada} reservadas, se necesitan ${modelo.cantidad}`);
          error.status = 400;
          throw error;
        }
        const cantidadReservadaAntes = stock.cantidadReservada;
        stock.cantidadReservada -= modelo.cantidad;
        await stock.save();
        console.log(`Stock reservado del modelo ${modelo.modelo.nombre} reducido de ${cantidadReservadaAntes} a ${stock.cantidadReservada}`);
      }
    }

    // Manejar cambio de "Entregado" a "Pendiente" (revertir la liberación del stock)
    if (estadoEntrega && estadoEntrega === 'Pendiente' && pedido.estadoEntrega === 'Entregado') {
      for (const modelo of pedido.modelos) {
        const stock = await Stock.findOne({ modelo: modelo.modelo });
        if (!stock) {
          const error = new Error(`No hay stock disponible para el modelo ${modelo.modelo._id}`);
          error.status = 400;
          throw error;
        }
        if (stock.cantidadDisponible < modelo.cantidad) {
          const error = new Error(`No hay suficiente stock disponible para el modelo ${modelo.modelo.nombre}: ${stock.cantidadDisponible} disponibles, se necesitan ${modelo.cantidad}`);
          error.status = 400;
          throw error;
        }
        stock.cantidadReservada += modelo.cantidad;
        stock.cantidadDisponible -= modelo.cantidad;
        await stock.save();
        console.log(`Stock reservado del modelo ${modelo.modelo.nombre} aumentado a ${stock.cantidadReservada}`);
      }
    }

    if (estadoPago) {
      if (!['Pendiente', 'Completado'].includes(estadoPago)) {
        const error = new Error('Estado de pago inválido');
        error.status = 400;
        throw error;
      }
      pedido.estadoPago = estadoPago;
    }

    if (estadoEntrega) {
      if (!['Pendiente', 'Entregado'].includes(estadoEntrega)) {
        const error = new Error('Estado de entrega inválido');
        error.status = 400;
        throw error;
      }
      pedido.estadoEntrega = estadoEntrega;
    }

    if (metodoPago) {
      if (!['Efectivo', 'Tarjeta'].includes(metodoPago)) {
        const error = new Error('Método de pago inválido');
        error.status = 400;
        throw error;
      }
      pedido.metodoPago = metodoPago;
      needsPriceRecalculation = true;
    }

    if (conFactura !== undefined) {
      pedido.conFactura = !!conFactura;
      needsPriceRecalculation = true;
    }

    if (needsPriceRecalculation) {
      let precioTotal = 0;
      for (const item of pedido.modelos) {
        const modeloData = await Modelo.findById(item.modelo);
        if (!modeloData) {
          const error = new Error(`Modelo no encontrado: ${item.modelo}`);
          error.status = 404;
          throw error;
        }
        let precioBase = modeloData.precioVenta * item.cantidad;
        if (!pedido.conFactura) {
          precioBase *= 1.10;
        }
        if (pedido.metodoPago === 'Tarjeta') {
          precioBase *= 1.05;
        }
        precioTotal += precioBase;
      }
      pedido.precioTotal = precioTotal;
    }

    const pedidoActualizado = await pedido.save();
    const pedidoPoblado = await Pedido.findById(pedidoActualizado._id)
      .populate('cliente')
      .populate('modelos.modelo');
    res.status(200).json({ message: 'Estado actualizado', data: pedidoPoblado });
  } catch (error) {
    next(error);
  }
};