const Pedido = require('../models/Pedido');
const Stock = require('../models/Stock');

exports.generarInformeVentas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const query = {
      estadoPago: 'Completado',
      estadoEntrega: 'Entregado',
    };
    if (fechaInicio && fechaFin) {
      query.fechaEntrega = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59.999Z'),
      };
    }

    const pedidosCompletados = await Pedido.find(query).populate('cliente modelos.modelo');

    let totalIngresos = 0;
    const numeroVentas = pedidosCompletados.length;
    const productosVendidos = {};

    pedidosCompletados.forEach(pedido => {
      totalIngresos += pedido.precioTotal;
      pedido.modelos.forEach(item => {
        const modeloNombre = item.modelo ? item.modelo.nombre : 'Desconocido';
        const cantidad = item.cantidad;
        let precioBase = item.modelo ? item.modelo.precioVenta : 0;
        let subtotal = precioBase * cantidad;
        if (!pedido.conFactura) {
          subtotal *= 1.10;
        }
        if (pedido.metodoPago === 'Tarjeta') {
          subtotal *= 1.05;
        }

        if (productosVendidos[modeloNombre]) {
          productosVendidos[modeloNombre].cantidad += cantidad;
          productosVendidos[modeloNombre].subtotal += subtotal;
        } else {
          productosVendidos[modeloNombre] = {
            cantidad,
            subtotal,
          };
        }
      });
    });

    const detalleProductos = Object.keys(productosVendidos).map(nombre => ({
      modelo: nombre,
      cantidad: productosVendidos[nombre].cantidad,
      subtotal: productosVendidos[nombre].subtotal,
    }));

    const informe = {
      totalIngresos,
      numeroVentas,
      productosVendidos: detalleProductos,
      pedidos: pedidosCompletados.map(pedido => ({
        ...pedido.toObject(),
        metodoPago: pedido.metodoPago,
        conFactura: pedido.conFactura,
      })),
    };

    res.status(200).json({ message: 'Informe de ventas generado', data: informe });
  } catch (error) {
    console.error('Error generating sales report:', error);
    next(error);
  }
};

exports.generarInformeInventario = async (req, res, next) => {
  try {
    const stock = await Stock.find().populate('modelo');

    if (!stock || stock.length === 0) {
      return res.status(200).json({
        message: 'No hay stock registrado',
        data: {
          valorTotalInventario: 0,
          numeroProductos: 0,
          inventario: [],
        },
      });
    }

    let valorTotalInventario = 0;
    const inventarioDetallado = stock.map(item => {
      if (item.modelo) {
        const precio = item.modelo.precioVenta || 0;
        const valor = precio * item.cantidadDisponible;
        valorTotalInventario += valor;
        return {
          tipo: 'Modelo',
          nombre: item.modelo.nombre,
          cantidadDisponible: item.cantidadDisponible || 0,
          cantidadReservada: item.cantidadReservada || 0,
          valor: valor || 0,
        };
      } else {
        const precio = calculateMaterialPrice(item.material.nombre);
        const valor = precio * item.cantidadDisponible;
        valorTotalInventario += valor;
        return {
          tipo: 'Material',
          nombre: item.material.nombre,
          cantidadDisponible: item.cantidadDisponible || 0,
          cantidadReservada: item.cantidadReservada || 0,
          valor: valor || 0,
        };
      }
    });

    const informe = {
      valorTotalInventario,
      numeroProductos: stock.length,
      inventario: inventarioDetallado,
    };

    res.status(200).json({ message: 'Informe de inventario generado', data: informe });
  } catch (error) {
    console.error('Error generating inventory report:', error);
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