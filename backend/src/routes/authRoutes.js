import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login); // URL: http://localhost:3000/api/auth/login

export default router;