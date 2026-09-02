import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { generateToken, isAuth, isAdmin } from '../utils.js';

const userRouter = express.Router();

// ===============================
// REGISTRAR USUARIO
// ===============================
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).send({
        message: 'El correo electrónico ya está registrado',
      });
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    const createdUser = await user.save();

    // Iniciar sesión automáticamente
    res.status(201).send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
  })
);

// ===============================
// INICIAR SESIÓN
// ===============================
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).send({
        message: 'Correo o contraseña incorrectos',
      });
      return;
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      res.status(401).send({
        message: 'Correo o contraseña incorrectos',
      });
      return;
    }

    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

// ===============================
// OBTENER TODOS LOS USUARIOS
// ===============================
userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

// ===============================
// ELIMINAR USUARIO
// ===============================
userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({
        message: 'Usuario no encontrado',
      });
      return;
    }

    await user.deleteOne();

    res.send({
      message: 'Usuario eliminado correctamente',
    });
  })
);

// ===============================
// OBTENER USUARIO POR ID
// ===============================
userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.send(user);
  })
);

// ===============================
// ACTUALIZAR USUARIO
// ===============================
userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({
        message: 'Usuario no encontrado',
      });
      return;
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  })
);

export default userRouter;