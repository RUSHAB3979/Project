import { Router } from 'express';
import { PrismaClient, UserAvailability } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

type RoadmapPreferences = {
  skillIds: string[];
  title?: string;
  savedAt?: string;
};

const sanitizeRoadmap = (value: unknown): RoadmapPreferences => {
  if (!value || typeof value !== 'object') {
    return { skillIds: [] };
  }

  const maybeRoadmap = value as Record<string, unknown>;
  const rawSkillIds = Array.isArray(maybeRoadmap.skillIds)
    ? maybeRoadmap.skillIds.filter((item): item is string => typeof item === 'string')
    : [];

  const roadmap: RoadmapPreferences = {
    skillIds: rawSkillIds,
  };

  if (typeof maybeRoadmap.title === 'string') {
    roadmap.title = maybeRoadmap.title;
  }

  if (typeof maybeRoadmap.savedAt === 'string') {
    roadmap.savedAt = maybeRoadmap.savedAt;
  }

  return roadmap;
};

router.get('/me/roadmap', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        searchPreferences: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const preferences = (user.searchPreferences ?? {}) as Record<string, unknown>;
    const roadmap = sanitizeRoadmap(preferences.roadmap);

    let skills: unknown[] = [];

    if (roadmap.skillIds.length) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: roadmap.skillIds } },
        select: {
          id: true,
          name: true,
          category: true,
          level: true,
          teacher: {
            select: {
              id: true,
              name: true,
              username: true,
              headline: true,
            },
          },
        },
      });

      const orderMap = new Map(roadmap.skillIds.map((skillId, index) => [skillId, index]));
      skills = foundSkills
        .filter((item) => orderMap.has(item.id))
        .sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));
    }

    return res.json({
      roadmap,
      skills,
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return res.status(500).json({ error: 'Failed to load roadmap.' });
  }
});

router.post('/me/roadmap', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { skillIds = [], title } = (req.body ?? {}) as {
    skillIds?: unknown;
    title?: unknown;
  };

  if (!Array.isArray(skillIds)) {
    return res.status(400).json({ error: 'skillIds must be an array of strings.' });
  }

  const cleanedIds = Array.from(
    new Set(skillIds.filter((item): item is string => typeof item === 'string'))
  ).slice(0, 20);

  if (!cleanedIds.length) {
    return res.status(400).json({ error: 'At least one skill must be provided.' });
  }

  const trimmedTitle = typeof title === 'string' && title.trim().length ? title.trim() : undefined;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { searchPreferences: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const existingPreferences = (user.searchPreferences ?? {}) as Record<string, unknown>;

    const roadmap: RoadmapPreferences = {
      skillIds: cleanedIds,
      savedAt: new Date().toISOString(),
    };

    if (trimmedTitle) {
      roadmap.title = trimmedTitle;
    }

    const nextPreferences = {
      ...existingPreferences,
      roadmap,
    };

    await prisma.user.update({
      where: { id: req.user.id },
      data: { searchPreferences: nextPreferences as any },
    });

    return res.status(201).json({ roadmap });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    return res.status(500).json({ error: 'Failed to save roadmap.' });
  }
});

router.get('/:username', async (req, res) => {
  const { username } = req.params as { username: string };

  try {
    const user = await prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        college: true,
        profileImg: true,
        headline: true,
        availability: true,
        skillcoins: true,
        role: true,
      },
    } as any);

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

  const { bio, college, availability, headline } = req.body as {
    bio?: string;
    college?: string;
    availability?: boolean | UserAvailability;
    headline?: string;
  };

  const data: Record<string, unknown> = {};

  if (bio !== undefined) {
    data.bio = bio;
  }

  if (college !== undefined) {
    data.college = college;
  }

  if (headline !== undefined) {
    data.headline = headline;
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
      data: data as any,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        college: true,
        headline: true,
        profileImg: true,
        skillcoins: true,
        availability: true,
        role: true,
      },
    } as any);

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
