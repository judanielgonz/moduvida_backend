const Pedido = require('../models/Pedido');
const Stock = require('../models/Stock');
const Transaccion = require('../models/Transaccion');
const Cliente = require('../models/Cliente');
const Trabajador = require('../models/Trabajador');

exports.getOrdenesPendientes = async (req, res, next) => {
  try {
    const ordenes = await Pedido.countDocuments({ estadoEntrega: 'Pendiente' });
    res.status(200).json({ message: 'Órdenes pendientes obtenidas', data: ordenes });
  } catch (error) {
    console.error('Error al obtener órdenes pendientes:', error);
    next(error);
  }
};

exports.getStockBajo = async (req, res, next) => {
  try {
    const stockBajo = await Stock.countDocuments({ cantidadDisponible: { $lt: 10 } });
    res.status(200).json({ message: 'Stock bajo obtenido', data: stockBajo });
  } catch (error) {
    console.error('Error al obtener stock bajo:', error);
    next(error);
  }
};

exports.getIngresosMes = async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const pedidos = await Pedido.find({
      estadoPago: 'Completado',
      estadoEntrega: 'Entregado',
      fechaEntrega: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const ingresos = pedidos.reduce((total, pedido) => total + pedido.precioTotal, 0);
    res.status(200).json({ message: 'Ingresos del mes obtenidos', data: ingresos });
  } catch (error) {
    console.error('Error al obtener ingresos del mes:', error);
    next(error);
  }
};

exports.getVentasPorModelo = async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const pedidos = await Pedido.find({
      estadoPago: 'Completado',
      estadoEntrega: 'Entregado',
      fechaEntrega: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('modelos.modelo');

    const ventasPorModelo = {};
    pedidos.forEach(pedido => {
      pedido.modelos.forEach(item => {
        const modeloNombre = item.modelo ? item.modelo.nombre : 'Desconocido';
        const cantidad = item.cantidad;
        if (ventasPorModelo[modeloNombre]) {
          ventasPorModelo[modeloNombre] += cantidad;
        } else {
          ventasPorModelo[modeloNombre] = cantidad;
        }
      });
    });

    const ventas = Object.keys(ventasPorModelo).map(nombre => ({
      modelo: nombre,
      cantidad: ventasPorModelo[nombre]
    }));

    res.status(200).json({ message: 'Ventas por modelo obtenidas', data: ventas });
  } catch (error) {
    console.error('Error al obtener ventas por modelo:', error);
    next(error);
  }
};

exports.getActividadReciente = async (req, res, next) => {
  try {
    const pedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('cliente')
      .select('cliente createdAt estadoEntrega');
    
    const transacciones = await Transaccion.find()
      .sort({ fechaTransaccion: -1 })
      .limit(5)
      .populate('modelo')
      .select('modelo tipoTransaccion cantidad fechaTransaccion');
    
    const clientes = await Cliente.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre createdAt');
    
    const trabajadores = await Trabajador.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre apellido cargo createdAt');

    const actividad = [
      ...pedidos.map(p => ({
        tipo: 'Pedido',
        descripcion: `Pedido creado para ${p.cliente?.nombre || 'Desconocido'} (${p.estadoEntrega})`,
        fecha: p.createdAt
      })),
      ...transacciones.map(t => ({
        tipo: 'Transacción',
        descripcion: `${t.tipoTransaccion} de ${t.cantidad} unidades de ${t.modelo?.nombre || 'Desconocido'}`,
        fecha: t.fechaTransaccion
      })),
      ...clientes.map(c => ({
        tipo: 'Cliente',
        descripcion: `Cliente ${c.nombre} registrado`,
        fecha: c.createdAt
      })),
      ...trabajadores.map(t => ({
        tipo: 'Trabajador',
        descripcion: `Trabajador ${t.nombre} ${t.apellido} (${t.cargo}) registrado`,
        fecha: t.createdAt
      }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

    res.status(200).json({ message: 'Actividad reciente obtenida', data: actividad });
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    next(error);
  }
};