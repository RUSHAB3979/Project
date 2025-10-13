
import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';



const router = Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

router.post('/signup', async (req: any, res: any) => {
  const { name, email, password } = req.body as SignupRequestBody;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
    },
  });

  res.status(201).json({ user });
});

import jwt from 'jsonwebtoken';

router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });

  res.json({ token });
});

export default router;
