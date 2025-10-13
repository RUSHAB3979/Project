import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const MAX_RESULTS = 10;
const MIN_CACHE_SIZE = 5;

const computeScore = (
  teachCategories: Set<string>,
  teachTags: Set<string>,
  learnCategories: Set<string>,
  learnTags: Set<string>,
  candidate: any
) => {
  let score = 0;
  const reasons: string[] = [];

  const candidateTeachCategories = new Set<string>(candidate.skillsTeaching.map((s: any) => s.category));
  const candidateTeachTags = new Set<string>(
    candidate.skillsTeaching.flatMap((s: any) => s.tags?.map((tag: any) => tag.name) ?? [])
  );
  const candidateLearnCategories = new Set<string>(candidate.skillsLearning.map((s: any) => s.category));
  const candidateLearnTags = new Set<string>(
    candidate.skillsLearning.flatMap((s: any) => s.tags?.map((tag: any) => tag.name) ?? [])
  );

  const teachesWhatYouNeed = [...candidateTeachCategories].filter((category) => learnCategories.has(category));
  const teachesTagMatches = [...candidateTeachTags].filter((tag) => learnTags.has(tag));
  const learnsWhatYouTeach = [...candidateLearnCategories].filter((category) => teachCategories.has(category));
  const learnsTagMatches = [...candidateLearnTags].filter((tag) => teachTags.has(tag));

  if (teachesWhatYouNeed.length) {
    score += teachesWhatYouNeed.length * 5;
    reasons.push(`Teaches ${teachesWhatYouNeed.join(', ')}`);
  }

  if (teachesTagMatches.length) {
    score += teachesTagMatches.length * 3;
    reasons.push(`Expertise in ${teachesTagMatches.slice(0, 3).join(', ')}`);
  }

  if (learnsWhatYouTeach.length) {
    score += learnsWhatYouTeach.length * 4;
    reasons.push(`Wants to learn ${learnsWhatYouTeach.join(', ')}`);
  }

  if (learnsTagMatches.length) {
    score += learnsTagMatches.length * 2;
    reasons.push(`Interested in ${learnsTagMatches.slice(0, 3).join(', ')}`);
  }

  if (candidate.availability === 'ONLINE') {
    score += 2;
  }

  if (candidate.subscriptionTier && candidate.subscriptionTier !== 'FREE') {
    score += 1.5;
    reasons.push('Premium member');
  }

  return { score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
};

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = req.user.id;

  try {
  const cached = await (prisma as any).skillMatch.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
      take: MAX_RESULTS,
      include: {
        matchUser: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImg: true,
            headline: true,
            availability: true,
            subscriptionTier: true,
            skillcoins: true,
          },
        },
      },
    } as any);

    if (cached.length >= MIN_CACHE_SIZE) {
      return res.json({ source: 'cache', items: cached });
    }

    const [teachSkills, learningSkills] = await Promise.all([
      prisma.skill.findMany({
        where: { teacherId: userId },
        select: { category: true, tags: { select: { name: true } } },
      }),
      prisma.skill.findMany({
        where: { learners: { some: { id: userId } } },
        select: { category: true, tags: { select: { name: true } } },
      }),
    ]);

    const teachCategories = new Set<string>(teachSkills.map((skill) => skill.category));
    const teachTags = new Set<string>(teachSkills.flatMap((skill) => skill.tags.map((tag) => tag.name)));
    const learnCategories = new Set<string>(learningSkills.map((skill) => skill.category));
    const learnTags = new Set<string>(learningSkills.flatMap((skill) => skill.tags.map((tag) => tag.name)));

    const candidates = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: {
        id: true,
        name: true,
        username: true,
        profileImg: true,
        headline: true,
        availability: true,
        subscriptionTier: true,
        skillcoins: true,
        skillsTeaching: {
          select: {
            id: true,
            category: true,
            tags: { select: { name: true } },
          },
        },
        skillsLearning: {
          select: {
            id: true,
            category: true,
            tags: { select: { name: true } },
          },
        },
      },
      take: 150,
    } as any);

    const ranked = candidates
      .map((candidate) => {
        const { score, reasons } = computeScore(
          teachCategories,
          teachTags,
          learnCategories,
          learnTags,
          candidate
        );

        return {
          id: `${userId}-${candidate.id}`,
          userId,
          matchUserId: candidate.id,
          score,
          reasons,
          metadata: {
            candidate,
          },
          matchUser: candidate,
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    if (ranked.length) {
      await prisma.$transaction([
        (prisma as any).skillMatch.deleteMany({ where: { userId } }),
        ...ranked.map((entry) =>
          (prisma as any).skillMatch.create({
            data: {
              userId,
              matchUserId: entry.matchUserId,
              score: entry.score,
              reasons: entry.reasons,
              metadata: entry.metadata,
            } as any,
          })
        ),
      ]);
    }

    return res.json({ source: 'generated', items: ranked });
  } catch (error) {
    console.error('Error building matches:', error);
    return res.status(500).json({ error: 'Failed to compute matches' });
  }
});

export default router;
