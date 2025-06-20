const mongoose = require('mongoose');

class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.connection = null;
    Database.#instance = this;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async connect() {
    if (this.connection) {
      console.log('Reutilizando conexión existente a MongoDB');
      return this.connection;
    }
    try {
      const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/moduvida';
      this.connection = await mongoose.connect(uri);
      console.log('Conectado a MongoDB');
      return this.connection;
    } catch (error) {
      console.error('Error de conexión a MongoDB:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      Database.#instance = null;
      console.log('Desconectado de MongoDB');
    }
  }
}

const db = Database.getInstance();
module.exports = db;