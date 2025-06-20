const Pedido = require('../models/Pedido');
const Modelo = require('../models/Modelo');
const Stock = require('../models/Stock');

class PedidoBuilder {
  constructor() {
    this.pedidoData = {
      cliente: null,
      fechaEntrega: null,
      estadoPago: 'Pendiente',
      estadoEntrega: 'Pendiente',
      modelos: [],
      metodoPago: 'Efectivo',
      conFactura: false,
      precioTotal: 0,
    };
    this.errors = [];
  }

  setCliente(clienteId) {
    if (!clienteId) {
      this.errors.push('El ID del cliente es requerido');
    }
    this.pedidoData.cliente = clienteId;
    return this;
  }

  setFechaEntrega(fecha) {
    if (!fecha || isNaN(new Date(fecha).getTime())) {
      this.errors.push('Fecha de entrega inválida');
    }
    this.pedidoData.fechaEntrega = fecha;
    return this;
  }

  setEstadoPago(estado) {
    if (estado && !['Pendiente', 'Completado'].includes(estado)) {
      this.errors.push('Estado de pago inválido');
    }
    if (estado) {
      this.pedidoData.estadoPago = estado;
    }
    return this;
  }

  setEstadoEntrega(estado) {
    if (estado && !['Pendiente', 'Entregado'].includes(estado)) {
      this.errors.push('Estado de entrega inválido');
    }
    if (estado) {
      this.pedidoData.estadoEntrega = estado;
    }
    return this;
  }

  setMetodoPago(metodo) {
    if (metodo && !['Efectivo', 'Tarjeta'].includes(metodo)) {
      this.errors.push('Método de pago inválido');
    }
    if (metodo) {
      this.pedidoData.metodoPago = metodo;
    }
    return this;
  }

  setConFactura(conFactura) {
    this.pedidoData.conFactura = !!conFactura;
    return this;
  }

  addModelo(modeloId, cantidad) {
    if (!modeloId || !cantidad || typeof cantidad !== 'number' || cantidad <= 0) {
      this.errors.push(`Modelo ${modeloId} tiene ID o cantidad inválida`);
    }
    this.pedidoData.modelos.push({ modelo: modeloId, cantidad });
    return this;
  }

  async validateAndCalculate() {
    if (this.pedidoData.modelos.length === 0) {
      this.errors.push('Debe incluir al menos un modelo en el pedido');
    }

    if (this.errors.length > 0) {
      throw new Error(this.errors.join('; '));
    }

    // Calcular precio total y verificar stock
    this.pedidoData.precioTotal = 0;
    for (const item of this.pedidoData.modelos) {
      const modeloData = await Modelo.findById(item.modelo);
      if (!modeloData) {
        this.errors.push(`Modelo no encontrado: ${item.modelo}`);
        continue;
      }

      const stock = await Stock.findOne({ modelo: item.modelo });
      if (!stock || stock.cantidadDisponible < item.cantidad) {
        this.errors.push(`Stock insuficiente para el modelo: ${modeloData.nombre}`);
        continue;
      }

      let precioBase = modeloData.precioVenta * item.cantidad;
      // Ajuste por factura (ejemplo: +10% si no hay factura)
      if (!this.pedidoData.conFactura) {
        precioBase *= 1.10;
      }
      // Ajuste por método de pago (ejemplo: +5% con tarjeta)
      if (this.pedidoData.metodoPago === 'Tarjeta') {
        precioBase *= 1.05;
      }
      this.pedidoData.precioTotal += precioBase;
    }

    if (this.errors.length > 0) {
      throw new Error(this.errors.join('; '));
    }

    return this;
  }

  async updateStock() {
    for (const item of this.pedidoData.modelos) {
      const stock = await Stock.findOne({ modelo: item.modelo });
      stock.cantidadDisponible -= item.cantidad;
      stock.cantidadReservada += item.cantidad;
      await stock.save();
    }
    return this;
  }

  async build() {
    if (this.errors.length > 0) {
      throw new Error(this.errors.join('; '));
    }

    const pedido = new Pedido(this.pedidoData);
    return await pedido.save();
  }
}

module.exports = PedidoBuilder;