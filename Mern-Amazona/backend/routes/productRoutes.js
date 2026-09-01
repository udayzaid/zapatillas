import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';

const productRouter = express.Router();

// 1. Obtener todos los productos
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// 2. Buscar por Slug
productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Producto no encontrado' });
  }
});

// 3. Buscar por ID (validando que sea un ObjectId de MongoDB válido)
productRouter.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: 'ID de producto no válido' });
  }
  
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Producto no encontrado' });
  }
});

export default productRouter;