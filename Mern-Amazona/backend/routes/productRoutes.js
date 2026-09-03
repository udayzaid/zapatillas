import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router();

// =====================================================
// OBTENER TODOS LOS PRODUCTOS
// =====================================================
productRouter.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// =====================================================
// OBTENER CATEGORÍAS
// =====================================================
productRouter.get('/categories', async (req, res) => {
  try {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// =====================================================
// BUSCAR Y FILTRAR PRODUCTOS
// =====================================================
productRouter.get('/search', async (req, res) => {
  try {
    const pageSize = 9;
    const page = Number(req.query.page) || 1;
    const query = req.query.query || 'all';
    const category = req.query.category || 'all';
    const price = req.query.price || 'all';
    const rating = req.query.rating || 'all';
    const order = req.query.order || 'newest';

    const filter = {};

    if (query !== 'all' && query.trim() !== '') {
      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedQuery, $options: 'i' };
    }

    if (category !== 'all') {
      filter.category = category;
    }

    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      filter.price = { $gte: min, $lte: max };
    }

    if (rating !== 'all') {
      filter.rating = { $gte: Number(rating) };
    }

    let sort = {};
    if (order === 'lowest') sort = { price: 1 };
    else if (order === 'highest') sort = { price: -1 };
    else if (order === 'toprated') sort = { rating: -1 };
    else sort = { createdAt: -1, _id: -1 };

    const countProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.send({
      products,
      page,
      pages: Math.ceil(countProducts / pageSize),
      countProducts,
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).send({
      message: error.message,
    });
  }
});

// =====================================================
// BUSCAR PRODUCTO POR SLUG
// =====================================================
productRouter.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (product) {
      res.send(product);
    } else {
      res.status(404).send({
        message: 'Producto no encontrado',
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// =====================================================
// OBTENER PRODUCTOS PARA ADMINISTRACIÓN
// =====================================================
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  async (req, res) => {
    try {
      const pageSize = 10;
      const page = Number(req.query.page) || 1;

      const countProducts = await Product.countDocuments();

      const products = await Product.find()
        .skip(pageSize * (page - 1))
        .limit(pageSize);

      res.send({
        products,
        page,
        pages: Math.ceil(countProducts / pageSize),
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    }
  }
);

// =====================================================
// CREAR PRODUCTO
// =====================================================
productRouter.post(
  '/',
  isAuth,
  isAdmin,
  async (req, res) => {
    try {
      const timestamp = Date.now();

      const product = new Product({
        name: `Nuevo producto ${timestamp}`,
        slug: `nuevo-producto-${timestamp}`,
        image: 'https://via.placeholder.com/640x480',
        brand: 'Marca',
        category: 'Tenis',
        description: 'Descripción del producto',
        price: 0,
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        reviews: [],
      });

      const createdProduct = await product.save();

      res.status(201).send({
        message: 'Producto creado correctamente',
        product: createdProduct,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    }
  }
);

// =====================================================
// ACTUALIZAR PRODUCTO
// =====================================================
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).send({
          message: 'Producto no encontrado',
        });
      }

      product.name = req.body.name;
      product.slug = req.body.slug;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.description = req.body.description;
      product.price = Number(req.body.price);
      product.countInStock = Number(
        req.body.countInStock
      );

      const updatedProduct = await product.save();

      res.send({
        message: 'Producto actualizado correctamente',
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    }
  }
);

// =====================================================
// ELIMINAR PRODUCTO
// =====================================================
productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).send({
          message: 'Producto no encontrado',
        });
      }

      await product.deleteOne();

      res.send({
        message: 'Producto eliminado correctamente',
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    }
  }
);

// =====================================================
// CREAR RESEÑA
// IMPORTANTE: ESTA RUTA DEBE ESTAR ANTES DE /:id
// =====================================================
productRouter.post(
  '/:id/reviews',
  isAuth,
  async (req, res) => {
    try {
      const { rating, comment } = req.body;

      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).send({
          message: 'Producto no encontrado',
        });
      }

      if (!product.reviews) {
        product.reviews = [];
      }

      const alreadyReviewed =
        product.reviews.find(
          (review) =>
            review.user.toString() ===
            req.user._id.toString()
        );

      if (alreadyReviewed) {
        return res.status(400).send({
          message:
            'Ya has dejado una reseña para este producto',
        });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce(
          (sum, review) =>
            sum + Number(review.rating),
          0
        ) / product.reviews.length;

      await product.save();

      const newReview =
        product.reviews[
          product.reviews.length - 1
        ];

      res.status(201).send({
        message: 'Reseña creada correctamente',
        review: newReview,
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } catch (error) {
      console.error(
        'Error al crear reseña:',
        error
      );

      res.status(500).send({
        message: error.message,
      });
    }
  }
);

// =====================================================
// BUSCAR PRODUCTO POR ID
// ESTA RUTA VA AL FINAL
// =====================================================
productRouter.get(
  '/:id',
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).send({
          message: 'ID de producto no válido',
        });
      }

      const product = await Product.findById(
        req.params.id
      );

      if (product) {
        res.send(product);
      } else {
        res.status(404).send({
          message: 'Producto no encontrado',
        });
      }
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    }
  }
);

export default productRouter;