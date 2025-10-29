import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth.js';
import { logAdminAction } from './admin.js';
const router = express.Router();
const prisma = new PrismaClient();
router.use('/admin', authenticateToken, requireAdmin);

router.get('/admin', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    res.json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Internal server error while fetching users',
    });
  }
});

router.post('/admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, isAdmin, isActive } = req.body;

    if (!email || !password || !firstName || !lastName || !phone || !address) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: hashedPassword,
        isAdmin: Boolean(isAdmin),
        isActive: Boolean(isActive),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logAdminAction(req.user.userId, 'CREATED_USER', 'USER', newUser.id, {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      isActive: newUser.isActive,
    });
    res.status(201).json({
      message: 'User account has been created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Internal server error while creating user',
    });
  }
});

router.put('/admin/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, firstName, lastName, phone, address, isAdmin, isActive } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: 'Valid user ID is required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (userId === req.user.userId && isActive === false) {
      return res.status(400).json({
        error: 'You cannot deactivate your own account',
      });
    }

    if (userId === req.user.userId && isAdmin === false) {
      return res.status(400).json({
        error: 'You cannot remove your own administrator privileges',
      });
    }

    if (email && email != existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailExists) {
        return res.status(409).json({
          error: 'Email already exists',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        firstName,
        lastName,
        phone,
        address,
        isAdmin: isAdmin !== undefined ? Boolean(isAdmin) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isAdmin: true,
        isActive: true,
      },
    });

    const changes = {
      email: email !== existingUser.email ? { from: existingUser.email, to: email } : undefined,
      firstName: firstName !== existingUser.firstName ? { from: existingUser.firstName, to: firstName } : undefined,
      lastName: lastName !== existingUser.lastName ? { from: existingUser.lastName, to: lastName } : undefined,
      phone: phone !== existingUser.phone ? { from: existingUser.phone, to: phone } : undefined,
      address: address !== existingUser.address ? { from: existingUser.address, to: address } : undefined,
      isAdmin: isAdmin !== existingUser.isAdmin ? { from: existingUser.isAdmin, to: isAdmin } : undefined,
      isActive: isActive !== existingUser.isActive ? { from: existingUser.isActive, to: isActive } : undefined,
    };

    const filteredChanges = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined));

    let actionType;
    if (Object.keys(filteredChanges).length > 0) {
      if (changes.isActive && changes.isActive.to === false) {
        actionType = 'DEACTIVATED_USER';
        await logAdminAction(req.user.userId, actionType, 'USER', userId, {
          changes: filteredChanges,
        });
      } else if (changes.isActive && changes.isActive.to === true) {
        actionType = 'REACTIVATED_USER';
        await logAdminAction(req.user.userId, actionType, 'USER', userId, {
          changes: filteredChanges,
        });
      } else {
        actionType = 'UPDATED_USER';
        await logAdminAction(req.user.userId, actionType, 'USER', userId, {
          changes: filteredChanges,
        });
      }
    }
    res.json({
      message:
        actionType === 'DEACTIVATED_USER'
          ? 'User account has been deactivated successfully'
          : actionType === 'REACTIVATED_USER'
          ? 'User account has been reactivated successfully'
          : Object.keys(filteredChanges).length <= 0
          ? 'No fields were changed, therefore no changes were made'
          : 'User account updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Internal server error while updating user',
    });
  }
});

router.post('/favorite/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { favorites: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFavorited = user.favorites.some(fav => fav.id === id);

    const userFavorite = await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: isFavorited ? { disconnect: { id: id } } : { connect: { id: id } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        favorites: true,
      },
    });

    res.json({
      message: 'Favorite updated successfully',
      user: userFavorite,
    });
  } catch (error) {
    console.error(error);
  }
});

export default router;
