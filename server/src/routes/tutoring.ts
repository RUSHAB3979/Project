import { Router } from 'express';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all tutoring requests for the current user (both sent and received)
router.get('/my-requests', passport.authenticate('jwt', { session: false }), async (req: any, res) => {
  try {
    const requests = await prisma.skillRequest.findMany({
      where: {
        OR: [
          { student_id: req.user.id },
          { tutor_id: req.user.id }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true,
            college: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true,
            college: true
          }
        },
        skill: true
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tutoring requests' });
  }
});

// Create a new tutoring request
router.post('/request', passport.authenticate('jwt', { session: false }), async (req: any, res) => {
  const { tutorId, skillId, message, duration } = req.body;

  try {
    // Check if user has enough skillcoins
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { skillcoins: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate cost (1 skillcoin per minute)
    const cost = duration;

    if (user.skillcoins < cost) {
      return res.status(400).json({ error: 'Insufficient skillcoins' });
    }

    // Create the request
    const request = await prisma.skillRequest.create({
      data: {
        student: { connect: { id: req.user.id } },
        tutor: { connect: { id: tutorId } },
        skill: { connect: { id: skillId } },
        message,
        duration,
        cost,
        status: 'PENDING'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true
          }
        },
        skill: true
      }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tutoring request' });
  }
});

// Accept or reject a tutoring request
router.patch('/request/:id', passport.authenticate('jwt', { session: false }), async (req: any, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  try {
    const request = await prisma.skillRequest.findUnique({
      where: { id },
      include: { student: true, tutor: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.tutor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (status === 'ACCEPTED') {
      // Transfer skillcoins from student to tutor
      await prisma.$transaction([
        prisma.user.update({
          where: { id: request.student_id },
          data: { skillcoins: { decrement: request.cost } }
        }),
        prisma.user.update({
          where: { id: request.tutor_id },
          data: { skillcoins: { increment: request.cost } }
        }),
        prisma.skillRequest.update({
          where: { id },
          data: { status, tutor_message: message }
        })
      ]);
    } else {
      await prisma.skillRequest.update({
        where: { id },
        data: { status, tutor_message: message }
      });
    }

    const updatedRequest = await prisma.skillRequest.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_img: true
          }
        },
        skill: true
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tutoring request' });
  }
});

export default router;