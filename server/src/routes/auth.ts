
import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const router = Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

const generateUsername = async (email: string) => {
  const localPart = email?.split('@')[0] ?? '';
  const sanitized = localPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const base = sanitized || 'user';
  let candidate = base;
  let suffix = 0;

  // Loop until we find a unique username
  // Limit iterations to avoid runaway (should not happen often)
  while (suffix < 1000) {
  const existing = await prisma.user.findFirst({ where: { username: candidate } as any });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return `${base}${crypto.randomUUID().slice(0, 6)}`;
};

router.post('/signup', async (req: Request, res: Response) => {
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

  const username = await generateUsername(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash: hashedPassword,
    } as any,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      profileImg: true,
      availability: true,
      role: true,
      subscriptionTier: true,
      skillcoins: true,
    } as any,
  });

  return res.status(201).json({ user });
});

router.post('/login', async (req: Request, res: Response) => {
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

  const passwordMatch = await bcrypt.compare(password, (user as any).passwordHash ?? (user as any).password_hash);

  if (!passwordMatch) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });

  return res.json({ token });
});

router.post('/logout', async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true });
});

export default router;
