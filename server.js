require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/error');

// Configurar zona horaria
process.env.TZ = 'America/Caracas';

const app = express();

// Conectar a MongoDB
const connectToDatabase = async () => {
  try {
    await db.connect();
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

connectToDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para establecer idioma
app.use((req, res, next) => {
  res.locals.language = 'es';
  next();
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de Moduvida funcionando');
});

// Rutas
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de Moduvida corriendo en http://localhost:${PORT} (${new Date().toLocaleString('es-VE')})`);
});