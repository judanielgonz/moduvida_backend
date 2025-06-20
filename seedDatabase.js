const mongoose = require('mongoose');
const Cliente = require('./models/Cliente');
const Proveedor = require('./models/Proveedor');
const Modelo = require('./models/Modelo');
const Stock = require('./models/Stock');
const Pedido = require('./models/Pedido');
const OrdenCompra = require('./models/OrdenCompra');
const Recibimiento = require('./models/Recibimiento');
const Pago = require('./models/Pago');
const Trabajador = require('./models/Trabajador');
const Transaccion = require('./models/Transaccion');
const db = require('./config/db');

// Definición de arrays para datos específicos
const barriosSantaCruz = ['Equipetrol', 'Urubó', 'Centro', 'Tercer Anillo', 'Quinta'];

// Listas para nombres únicos y realistas
const nombresEmpresasProveedores = [
  'Muebles Santa Cruz', 'El Roble Maderero', 'Arte en Madera', 'Maderas del Oriente',
  'Muebles Coloniales', 'Casa de Madera', 'Rústico Boliviano', 'Elegancia en Madera',
  'Muebles del Chaco', 'Diseños de Santa Cruz', 'Muebles del Sol', 'Carpintería Andina',
  'Estilo Tropical', 'Maderas Finas', 'Hogar y Madera', 'Muebles del Valle',
  'Decoraciones Orientales', 'Muebles Modernos', 'La Madera Noble', 'Estilo Rústico',
  'Muebles del Altiplano', 'Carpintería del Este', 'Muebles Étnicos', 'Maderas Exóticas',
  'Diseños del Trópico'
];
const nombresPersonas = [
  'Ana', 'Carlos', 'María', 'José', 'Laura', 'Pedro', 'Sofía', 'Luis', 'Carmen', 'Diego',
  'Valentina', 'Miguel', 'Lucía', 'Juan', 'Elena', 'Andrés', 'Camila', 'Gabriel', 'Fernanda', 'Raúl',
  'Isabel', 'Pablo', 'Clara', 'David', 'Julia', 'Ricardo', 'Natalia', 'Sebastián', 'Martina', 'Felipe',
  'Daniela', 'Tomás', 'Victoria', 'Emilio', 'Sara', 'Javier', 'Renata', 'Matías', 'Alejandra', 'Ignacio',
  'Catalina', 'Esteban', 'Paula', 'Rodrigo', 'Valeria', 'Santiago', 'Constanza', 'Alonso', 'Macarena', 'Gonzalo'
];
const apellidos = [
  'García', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 'Díaz', 'Fernández', 'Torres',
  'Ramírez', 'Vásquez', 'Rojas', 'Morales', 'Jiménez', 'Castro', 'Ortiz', 'Silva', 'Mendoza', 'Cruz',
  'Reyes', 'Aguilar', 'Flores', 'Espinoza', 'Herrera', 'Navarro', 'Vega', 'Campos', 'Soto', 'Guerrero',
  'Ramos', 'Medina', 'Cabrera', 'Paredes', 'Luna', 'Molina', 'Suárez', 'Chávez', 'Villanueva', 'Peña',
  'Blanco', 'Salazar', 'Ríos', 'Montes', 'Delgado', 'Valdez', 'Cordero', 'Pinto', 'Bautista', 'Calderón'
];
const nombresMateriales = [
  'Madera de Roble', 'Madera de Pino', 'Madera de Cedro', 'Tela de Lino', 'Tela de Algodón', 'Tela de Terciopelo',
  'Pintura Mate', 'Pintura Brillante', 'Pintura al Óleo', 'Clavos de Acero', 'Clavos de Bronce', 'Tornillos Galvanizados',
  'Barniz Natural', 'Barniz Mate', 'Barniz Brillante', 'Pegamento para Madera', 'Lija Fina', 'Lija Gruesa',
  'Cuero Genuino', 'Cuero Sintético', 'Espuma de Alta Densidad', 'Espuma Media', 'Tapiz Floral', 'Tapiz Liso',
  'Madera de Caoba', 'Madera de Nogal', 'Madera de Cerezo', 'Tela Impermeable', 'Tela Antimanchas', 'Pintura Acrílica',
  'Clavos Decorativos', 'Tornillos de Cabeza Plana', 'Barniz Marino', 'Pegamento Industrial', 'Lija Media',
  'Cuero Texturizado', 'Espuma Suave', 'Tapiz Geométrico', 'Tapiz Clásico', 'Madera de Teca', 'Madera de Ébano',
  'Tela de Seda', 'Pintura Satinada', 'Clavos Antideslizantes', 'Tornillos de Seguridad', 'Barniz Protector',
  'Pegamento Rápido', 'Lija Ultrafina', 'Cuero Grabado', 'Espuma Firme', 'Tapiz Moderno'
];
const nombresMuebles = [
  'Silla Clásica', 'Silla Moderna', 'Silla Rústica', 'Silla Ergonómica', 'Silla Colonial',
  'Mesa de Comedor', 'Mesa de Centro', 'Mesa Auxiliar', 'Mesa de Trabajo', 'Mesa Plegable',
  'Armario Doble', 'Armario Minimalista', 'Armario con Espejo', 'Armario Vintage', 'Armario Modular',
  'Sofá de Cuero', 'Sofá Reclinable', 'Sofá Cama', 'Sofá de Esquina', 'Sofá Moderno',
  'Silla de Oficina', 'Mesa de Noche', 'Armario Compacto', 'Sofá Individual', 'Silla de Jardín',
  'Mesa Redonda', 'Armario Esquinero', 'Sofá Clásico', 'Silla Alta', 'Mesa de Estudio',
  'Armario Abierto', 'Sofá Doble', 'Silla Plegable', 'Mesa de Exterior', 'Armario de Pared',
  'Sofá con Reposapiés', 'Silla de Comedor', 'Mesa Rectangular', 'Armario Elegante'
];

// Función para generar fechas aleatorias entre dos fechas
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Función para conectar a la base de datos
const connectDB = async () => {
  await db.connect();
};

// Función para dividir un array en lotes
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

// Función para insertar datos de ejemplo
const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Limpiar colecciones existentes
    await Promise.all([
      Cliente.deleteMany({}),
      Proveedor.deleteMany({}),
      Modelo.deleteMany({}),
      Stock.deleteMany({}),
      Pedido.deleteMany({}),
      OrdenCompra.deleteMany({}),
      Recibimiento.deleteMany({}),
      Pago.deleteMany({}),
      Trabajador.deleteMany({}),
      Transaccion.deleteMany({}),
    ]);
    console.log('Colecciones limpiadas');

    // Definir rango de fechas
    const startDate = new Date('2024-12-01');
    const endDate = new Date('2025-06-06');
    const juneStart = new Date('2025-06-01');
    const juneEnd = new Date('2025-06-06');

    // 1. Insertar Proveedores (25) con catálogo
    const proveedoresData = nombresEmpresasProveedores.slice(0, 25).map((nombre, i) => {
      const numMateriales = Math.floor(Math.random() * 5) + 3;
      const catalogo = nombresMateriales.slice(i * 5, i * 5 + numMateriales).map((materialNombre, j) => ({
        nombre: materialNombre || 'Material Desconocido',
        precio: 10 + Math.floor(Math.random() * 190),
        cantidadDisponible: Math.floor(Math.random() * 500) + 100,
        unidadMedida: ['unidad', 'metro', 'litro'][j % 3]
      }));
      return {
        nombre,
        direccion: `${barriosSantaCruz[i % barriosSantaCruz.length]} #${i + 1}, Santa Cruz, Bolivia`,
        telefono: `+591 3 3345${i.toString().padStart(4, '0')}`,
        email: `ventas@${nombre.toLowerCase().replace(/ /g, '')}.com`,
        tiempoEntregaEstimado: 5 + Math.floor(Math.random() * 10),
        contactos: [
          {
            nombreContacto: `Contacto ${nombre.split(' ')[0]}`,
            telefonoContacto: `+591 7 6543${i.toString().padStart(4, '0')}`,
            emailContacto: `contacto@${nombre.toLowerCase().replace(/ /g, '')}.com`,
            cargoContacto: Math.random() > 0.5 ? 'Gerente de Ventas' : 'Coordinador de Logística'
          }
        ],
        catalogo
      };
    });
    const proveedores = await Proveedor.insertMany(proveedoresData);
    console.log('Proveedores insertados:', proveedores.length);

    // 2. Insertar Clientes (250)
    const clientesData = Array.from({ length: 250 }, (_, i) => {
      const nombre = nombresPersonas[i % nombresPersonas.length];
      const apellido = apellidos[i % apellidos.length];
      return {
        nombre: `${nombre} ${apellido}`,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@example.com`,
        telefono: `+591 3 3456${i.toString().padStart(4, '0')}`,
        cedula: `V${10000000 + i}`,
        direccion: `${barriosSantaCruz[i % barriosSantaCruz.length]} #${i + 1}, Santa Cruz, Bolivia`
      };
    });
    const clientesChunks = chunkArray(clientesData, 50);
    const clientes = [];
    for (const chunk of clientesChunks) {
      const inserted = await Cliente.insertMany(chunk);
      clientes.push(...inserted);
    }
    console.log('Clientes insertados:', clientes.length);

    // 3. Insertar Órdenes de Compra (50)
    const ordenesCompraData = Array.from({ length: 50 }, (_, i) => {
      const proveedor = proveedores[i % proveedores.length];
      const numDetalles = Math.floor(Math.random() * 4) + 1;
      const detalles = Array.from({ length: numDetalles }, () => {
        const materialIndex = Math.floor(Math.random() * proveedor.catalogo.length);
        const material = proveedor.catalogo[materialIndex] || {
          nombre: 'Material Desconocido',
          precio: 10,
          unidadMedida: 'unidad'
        };
        return {
          nombre: material.nombre,
          cantidad: Math.floor(Math.random() * 50) + 10,
          precioUnitario: material.precio || 10,
          unidadMedida: material.unidadMedida || 'unidad',
          contacto: proveedor.contactos[0]?.nombreContacto || 'Sin contacto'
        };
      });
      const precioTotal = detalles.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
      return {
        proveedor: proveedor._id,
        fecha: randomDate(startDate, endDate),
        estado: ['Pendiente', 'En proceso', 'Recibida'][Math.floor(Math.random() * 3)],
        detalles,
        precioTotal
      };
    });
    const insertedOrdenes = await OrdenCompra.insertMany(ordenesCompraData);
    console.log('Órdenes de compra insertadas:', insertedOrdenes.length);

    // 4. Insertar Recibimientos (para órdenes en estado "Recibida")
    const recibimientosData = [];
    for (let i = 0; i < ordenesCompraData.length; i++) {
      const orden = ordenesCompraData[i];
      if (orden.estado !== 'Recibida') continue;

      const materialesRecibidos = orden.detalles.map((detalle) => ({
        nombre: detalle.nombre,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        unidadMedida: detalle.unidadMedida
      }));
      recibimientosData.push({
        ordenCompra: insertedOrdenes[i]._id,
        materialesRecibidos,
        fechaRecibimiento: randomDate(startDate, endDate),
        estado: 'Pendiente'
      });
    }
    const recibimientos = await Recibimiento.insertMany(recibimientosData);
    console.log('Recibimientos insertados:', recibimientos.length);

    // 5. Confirmar algunos recibimientos y actualizar stock
    const recibimientosConfirmados = recibimientos.slice(0, Math.floor(recibimientos.length * 0.7));
    for (const recibimiento of recibimientosConfirmados) {
      for (const material of recibimiento.materialesRecibidos) {
        let stock = await Stock.findOne({ 'material.nombre': material.nombre });
        if (stock) {
          stock.cantidadDisponible += material.cantidad;
          await stock.save();
        } else {
          stock = new Stock({
            material: {
              nombre: material.nombre,
              unidadMedida: material.unidadMedida
            },
            cantidadDisponible: material.cantidad,
            cantidadReservada: 0
          });
          await stock.save();
        }
      }
      recibimiento.estado = 'Recibido';
      await recibimiento.save();
    }
    console.log('Recibimientos confirmados y stock actualizado:', recibimientosConfirmados.length);

    // 6. Insertar Modelos (37)
    const categorias = ['Sillas', 'Mesas', 'Armarios', 'Sofás'];
    const materialesBase = ['Madera de Roble', 'Madera de Pino', 'Cuero', 'Tela Santa Cruz'];
    const modelosData = nombresMuebles.slice(0, 37).map((nombre, i) => {
      const numMateriales = Math.floor(Math.random() * 4) + 1;
      const materialesModelo = Array.from({ length: numMateriales }, () => {
        const materialNombre = nombresMateriales[Math.floor(Math.random() * nombresMateriales.length)];
        return {
          nombre: materialNombre,
          cantidad: Math.floor(Math.random() * 5) + 1
        };
      });
      const costoProduccion = materialesModelo.reduce((total, item) => {
        const proveedorMaterial = proveedores
          .flatMap(p => p.catalogo)
          .find(m => m.nombre === item.nombre);
        const precioUnitario = proveedorMaterial ? proveedorMaterial.precio : 10;
        return total + (precioUnitario * item.cantidad);
      }, 0);
      const costoProduccionCapped = Math.min(costoProduccion, 500);
      const precioVenta = costoProduccionCapped * (1.5 + Math.random() * 0.5);
      const precioVentaCapped = Math.min(precioVenta, 1000);
      return {
        nombre,
        descripcion: `Descripción de ${nombre.toLowerCase()}`,
        categoria: categorias[i % categorias.length],
        material: materialesBase[i % materialesBase.length],
        alto: 50 + Math.random() * 100,
        ancho: 30 + Math.random() * 50,
        precio: costoProduccionCapped * 1.2,
        precioVenta: precioVentaCapped,
        costoProduccion: costoProduccionCapped,
        materiales: materialesModelo
      };
    });
    const modelosChunks = chunkArray(modelosData, 12);
    const modelos = [];
    for (const chunk of modelosChunks) {
      const inserted = await Modelo.insertMany(chunk);
      modelos.push(...inserted);
    }
    console.log('Modelos insertados:', modelos.length);

    // 7. Insertar Stock de Modelos (37)
    const stockModelosData = modelos.map((modelo) => ({
      modelo: modelo._id,
      cantidadDisponible: Math.floor(Math.random() * 200) + 20,
      cantidadReservada: Math.floor(Math.random() * 50)
    }));
    const stockChunks = chunkArray(stockModelosData, 25);
    const stock = [];
    for (const chunk of stockChunks) {
      const inserted = await Stock.insertMany(chunk);
      stock.push(...inserted);
    }
    console.log('Stock de modelos insertado:', stock.length);

    // 8. Insertar Pedidos (1250)
    const pedidosData = Array.from({ length: 1250 }, (_, i) => {
      const numModelos = Math.floor(Math.random() * 3) + 1;
      const modelosPedido = Array.from({ length: numModelos }, () => ({
        modelo: modelos[Math.floor(Math.random() * modelos.length)]._id,
        cantidad: Math.floor(Math.random() * 20) + 1
      }));
      const metodoPago = Math.random() > 0.5 ? 'Efectivo' : 'Tarjeta';
      const conFactura = Math.random() > 0.5;
      let precioTotal = modelosPedido.reduce((total, item) => {
        const modelo = modelos.find(m => m._id.toString() === item.modelo.toString());
        return total + (modelo ? modelo.precioVenta * item.cantidad : 0);
      }, 0);
      if (!conFactura) precioTotal *= 1.10;
      if (metodoPago === 'Tarjeta') precioTotal *= 1.05;
      const precioTotalCapped = Math.min(precioTotal, 1000);
      return {
        cliente: clientes[i % clientes.length]._id,
        fechaEntrega: i < 100 ? randomDate(juneStart, juneEnd) : randomDate(startDate, endDate),
        estadoPago: i < 100 ? 'Completado' : Math.random() > 0.3 ? 'Completado' : 'Pendiente',
        estadoEntrega: i < 100 ? 'Entregado' : Math.random() > 0.3 ? 'Entregado' : 'Pendiente',
        modelos: modelosPedido,
        metodoPago,
        conFactura,
        precioTotal: precioTotalCapped,
        createdAt: i < 100 ? randomDate(juneStart, juneEnd) : randomDate(startDate, endDate)
      };
    });
    const pedidosChunks = chunkArray(pedidosData, 125);
    const pedidos = [];
    for (const chunk of pedidosChunks) {
      const inserted = await Pedido.insertMany(chunk);
      pedidos.push(...inserted);
    }
    console.log('Pedidos insertados:', pedidos.length);

    // 9. Insertar Pagos (1000)
    const pedidosCompletados = pedidos.filter(p => p.estadoPago === 'Completado');
    const pagosData = Array.from({ length: 1000 }, (_, i) => ({
      pedido: pedidosCompletados[i % pedidosCompletados.length]._id,
      fechaPago: randomDate(startDate, endDate),
      monto: pedidosCompletados[i % pedidosCompletados.length].precioTotal,
      metodoPago: pedidosCompletados[i % pedidosCompletados.length].metodoPago
    }));
    const pagosChunks = chunkArray(pagosData, 125);
    const pagos = [];
    for (const chunk of pagosChunks) {
      const inserted = await Pago.insertMany(chunk);
      pagos.push(...inserted);
    }
    console.log('Pagos insertados:', pagos.length);

    // 10. Insertar Trabajadores (25)
    const cargos = ['Carpintero', 'Diseñador de Muebles', 'Vendedor', 'Administrador', 'Almacenista'];
    const trabajadoresData = Array.from({ length: 25 }, (_, i) => {
      const nombre = nombresPersonas[i];
      const apellido = apellidos[i];
      return {
        nombre,
        apellido,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@example.com`,
        cedula: `V${20000000 + i}`,
        telefono: `+591 7 6543${i.toString().padStart(4, '0')}`,
        cargo: cargos[i % cargos.length],
        fechaIngreso: randomDate(startDate, endDate),
        salario: 400 + Math.random() * 800
      };
    });
    const trabajadores = await Trabajador.insertMany(trabajadoresData);
    console.log('Trabajadores insertados:', trabajadores.length);

    // 11. Insertar Transacciones (250)
    const notasTransacciones = [
      'Entrada de Sillas Clásicas', 'Salida de Mesas de Comedor', 'Entrada de Armarios Dobles', 'Salida de Sofás de Cuero',
      'Entrada de Sillas Modernas', 'Salida de Mesas de Centro', 'Entrada de Armarios Minimalistas', 'Salida de Sofás Reclinables',
      'Entrada de Sillas Rústicas', 'Salida de Mesas Auxiliares', 'Entrada de Armarios con Espejo', 'Salida de Sofás Cama',
      'Entrada de Sillas Ergonómicas', 'Salida de Mesas de Trabajo', 'Entrada de Armarios Vintage', 'Salida de Sofás de Esquina',
      'Entrada de Sillas Coloniales', 'Salida de Mesas Plegables', 'Entrada de Armarios Modulares', 'Salida de Sofás Modernos',
      'Entrada de Sillas de Oficina', 'Salida de Mesas de Noche', 'Entrada de Armarios Compactos', 'Salida de Sofás Individuales',
      'Entrada de Sillas de Jardín', 'Salida de Mesas Redondas', 'Entrada de Armarios Esquineros', 'Salida de Sofás Clásicos',
      'Entrada de Sillas Altas', 'Salida de Mesas de Estudio', 'Entrada de Armarios Abiertos', 'Salida de Sofás Dobles',
      'Entrada de Sillas Plegables', 'Salida de Mesas de Exterior', 'Entrada de Armarios de Pared', 'Salida de Sofás con Reposapiés',
      'Entrada de Sillas de Comedor', 'Salida de Mesas Rectangulares', 'Entrada de Armarios Elegantes', 'Salida de Sofás Modernos'
    ];
    const transaccionesData = Array.from({ length: 250 }, (_, i) => ({
      modelo: modelos[i % modelos.length]._id,
      tipoTransaccion: Math.random() > 0.5 ? 'Entrada' : 'Salida',
      cantidad: Math.floor(Math.random() * 50) + 1,
      fechaTransaccion: randomDate(startDate, endDate),
      nota: notasTransacciones[i % notasTransacciones.length]
    }));
    const transaccionesChunks = chunkArray(transaccionesData, 50);
    const transacciones = [];
    for (const chunk of transaccionesChunks) {
      const inserted = await Transaccion.insertMany(chunk);
      transacciones.push(...inserted);
    }
    console.log('Transacciones insertadas:', transacciones.length);

    console.log('Base de datos poblada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error.message, error.stack);
    process.exit(1);
  }
};

// Ejecutar la función
seedDatabase();