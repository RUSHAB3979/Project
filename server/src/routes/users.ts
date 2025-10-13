import { Router } from 'express';
import { PrismaClient, UserAvailability } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/:username', async (req, res) => {
  const { username } = req.params as { username: string };

  try {
    const user = await prisma.user.findFirst({
      where: { name: username },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        college: true,
        profile_img: true,
        skillcoins: true,
        availability: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to update this profile.' });
  }

  const { bio, college, availability } = req.body as {
    bio?: string;
    college?: string;
    availability?: boolean | UserAvailability;
  };

  const data: Record<string, unknown> = {};

  if (bio !== undefined) {
    data.bio = bio;
  }

  if (college !== undefined) {
    data.college = college;
  }

  if (availability !== undefined) {
    if (typeof availability === 'boolean') {
      data.availability = availability ? UserAvailability.ONLINE : UserAvailability.OFFLINE;
    } else if (Object.values(UserAvailability).includes(availability)) {
      data.availability = availability;
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        college: true,
        profile_img: true,
        skillcoins: true,
        availability: true,
        role: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
