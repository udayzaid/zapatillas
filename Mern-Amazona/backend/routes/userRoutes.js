import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const userRouter = express.Router();

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    // Busca si existe el usuario por correo
    const user = await User.findOne({ email: req.body.email });
    
    if (user) {
      // Si el usuario existe, responde con sus datos
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      return;
    }
    
    // Si no existe en la base de datos, permite la sesión por defecto con admin
    if (req.body.email === 'admin@example.com' && req.body.password === '123456') {
      res.send({
        _id: '1',
        name: 'Admin',
        email: 'admin@example.com',
        isAdmin: true,
      });
      return;
    }

    res.status(401).send({ message: 'Correo o contraseña incorrectos' });
  })
);

export default userRouter;