import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAdmin, isAuth } from '../utils.js';

const uploadRouter = express.Router();

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const upload = multer({
  storage,
});

uploadRouter.post(
  '/',
  isAuth,
  isAdmin,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send({
        message: 'No se seleccionó ninguna imagen',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.send({
      url: imageUrl,
      secure_url: imageUrl,
      filename: req.file.filename,
    });
  }
);

export default uploadRouter;