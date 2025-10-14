import { Router } from 'express';
import { PrismaClient, SessionMode, SkillLevel } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;

const SKILL_VISIBILITY_VALUES = ['PUBLIC', 'FOLLOWERS', 'SUBSCRIBERS', 'PRIVATE'] as const;
type SkillVisibilityValue = (typeof SKILL_VISIBILITY_VALUES)[number];

const isSkillVisibility = (value: unknown): value is SkillVisibilityValue =>
  typeof value === 'string' && SKILL_VISIBILITY_VALUES.includes(value as SkillVisibilityValue);

const buildTagConnectOrCreate = (tags: string[]) =>
  tags.map((name) => ({
    where: { name },
    create: { name },
  }));

router.get('/', async (req, res) => {
  const {
    q,
    category,
    level,
    mode,
    visibility,
    page = '1',
    pageSize = `${PAGE_SIZE_DEFAULT}`,
  } = req.query as Record<string, string | undefined>;

  const take = Math.min(Number(pageSize) || PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
  const skip = ((Number(page) || 1) - 1) * take;

  const where: Record<string, unknown> = {};

  if (visibility && isSkillVisibility(visibility)) {
    where.visibility = visibility;
  } else {
    where.visibility = 'PUBLIC';
  }

  if (category) {
    where.category = category;
  }

  if (level && Object.prototype.hasOwnProperty.call(SkillLevel, level)) {
    where.level = level as SkillLevel;
  }

  if (mode && Object.prototype.hasOwnProperty.call(SessionMode, mode)) {
    where.sessionMode = mode as SessionMode;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.skill.findMany({
        where: where as any,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImg: true,
              headline: true,
              availability: true,
            },
          },
          tags: true,
        } as any,
        orderBy: { featured: 'desc' } as any,
        skip,
        take,
      }),
      prisma.skill.count({ where: where as any }),
    ]);

    return res.json({ items, total, page: Number(page) || 1, pageSize: take });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return res.status(500).json({ error: 'Failed to load skills' });
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const {
    name,
    category,
    level,
    description,
    sessionMode,
    tags = [],
  visibility = 'PUBLIC',
    location,
    deliveryModes,
  } = req.body as {
    name: string;
    category: string;
    level: SkillLevel;
    description: string;
    sessionMode: SessionMode;
  tags?: string[];
  visibility?: SkillVisibilityValue;
    location?: string;
    deliveryModes?: unknown;
  };

  if (!name || !category || !level || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        level,
        description,
        sessionMode,
        visibility,
        location,
        deliveryModes,
        teacher: { connect: { id: req.user.id } },
        tags: {
          connectOrCreate: buildTagConnectOrCreate(tags),
        },
      } as any,
      include: {
        tags: true,
      },
    });

    return res.status(201).json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return res.status(500).json({ error: 'Failed to create skill listing' });
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        skillsTeaching: {
          include: {
            tags: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        skillsLearning: {
          include: {
            tags: true,
            teacher: {
              select: {
                id: true,
                name: true,
                username: true,
                profileImg: true,
                headline: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      teaching: currentUser.skillsTeaching,
      learning: currentUser.skillsLearning,
    });
  } catch (error) {
    console.error('Error loading user skills:', error);
    return res.status(500).json({ error: 'Failed to load user skills' });
  }
});

router.post('/:id/enroll', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params as { id: string };

  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        learners: {
          connect: { id: req.user.id },
        },
      },
      include: {
        learners: {
          select: { id: true },
        },
      },
    });

    return res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }

    console.error('Error enrolling in skill:', error);
    return res.status(500).json({ error: 'Failed to save skill to learning plan' });
  }
});

router.delete('/:id/enroll', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params as { id: string };

  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        learners: {
          disconnect: { id: req.user.id },
        },
      },
    });

    return res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }

    console.error('Error removing skill enrollment:', error);
    return res.status(500).json({ error: 'Failed to remove skill from learning plan' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params as { id: string };
  const {
    name,
    category,
    level,
    description,
    sessionMode,
    tags,
    visibility,
    location,
    deliveryModes,
    featured,
  } = req.body as Record<string, unknown>;

  try {
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (skill.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this skill' });
    }

    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (level !== undefined) data.level = level;
    if (description !== undefined) data.description = description;
    if (sessionMode !== undefined) data.sessionMode = sessionMode;
    if (visibility !== undefined) data.visibility = visibility;
    if (location !== undefined) data.location = location;
    if (deliveryModes !== undefined) data.deliveryModes = deliveryModes;
    if (featured !== undefined && req.user.role === 'ADMIN') data.featured = featured;

    const updated = await prisma.skill.update({
      where: { id },
      data: {
        ...data,
        ...(Array.isArray(tags)
          ? {
              tags: {
                set: [],
                connectOrCreate: buildTagConnectOrCreate(tags as string[]),
              },
            }
          : {}),
      } as any,
      include: { tags: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating skill:', error);
    return res.status(500).json({ error: 'Failed to update skill listing' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params as { id: string };

  try {
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (skill.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this skill' });
    }

    await prisma.skill.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({ error: 'Failed to delete skill' });
  }
});

router.get('/recommended', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const userId = req.user.id;

    const learningCategories = await prisma.skill.findMany({
      where: { learners: { some: { id: userId } } },
      select: { category: true },
    });

    const categories = learningCategories.map((item) => item.category);

    const where: Record<string, unknown> = {
      teacherId: { not: userId },
      visibility: 'PUBLIC',
    };

    if (categories.length) {
      where.OR = [
        { category: { in: categories } },
        { tags: { some: { name: { in: categories } } } },
      ];
    }

    const recommended = await prisma.skill.findMany({
      where: where as any,
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      take: 12,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImg: true,
            availability: true,
          },
        } as any,
        tags: true,
      },
    });

    if (!recommended.length) {
      const fallback = await prisma.skill.findMany({
        where: { visibility: 'PUBLIC' },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: 12,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImg: true,
              availability: true,
            },
          } as any,
          tags: true,
        },
      });

      return res.json({ items: fallback, source: 'fallback' });
    }

    return res.json({ items: recommended, source: 'personalized' });
  } catch (error) {
    console.error('Error fetching recommended skills:', error);
    return res.status(500).json({ error: 'Failed to load recommendations' });
  }
});

export default router;
