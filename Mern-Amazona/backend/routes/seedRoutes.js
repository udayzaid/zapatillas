import express from 'express';
import bcrypt from 'bcryptjs';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products);

  await User.deleteMany({});
  // Encripta las contraseñas de data.js antes de insertarlas
  const sampleUsers = data.users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 8),
  }));
  const createdUsers = await User.insertMany(sampleUsers);

  res.send({ createdProducts, createdUsers });
});

export default seedRouter;