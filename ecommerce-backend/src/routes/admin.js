import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);
router.use(requireAdmin);

const logAdminAction = async (adminId, action, entityType, entityId, details = null) => {
  try {
    await prisma.adminAction.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: String(entityId),
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

router.get('/actions', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const actions = await prisma.adminAction.findMany({
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.adminAction.count();

    res.json({
      message: 'Admin actions retrieved successfully',
      actions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({
      error: 'Internal server error while fetching admin actions',
    });
  }
});

export { logAdminAction };
export default router;
