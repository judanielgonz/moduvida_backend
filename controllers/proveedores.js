const Proveedor = require('../models/Proveedor');

exports.getProveedores = async (req, res, next) => {
  try {
    const proveedores = await Proveedor.find();
    res.status(200).json({ message: 'Proveedores obtenidos', data: proveedores });
  } catch (error) {
    next(error);
  }
};

exports.createProveedor = async (req, res, next) => {
  try {
    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    res.status(201).json({ message: 'Proveedor creado', data: proveedor });
  } catch (error) {
    next(error);
  }
};

exports.updateProveedor = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proveedor) {
      const error = new Error('Proveedor no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Proveedor actualizado', data: proveedor });
  } catch (error) {
    next(error);
  }
};

exports.deleteProveedor = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
    if (!proveedor) {
      const error = new Error('Proveedor no encontrado');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Proveedor eliminado' });
  } catch (error) {
    next(error);
  }
};