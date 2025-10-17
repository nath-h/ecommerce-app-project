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

router.get('/users', async (req, res) => {
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

router.post('/users', async (req, res) => {
  try {
    const { userId, email, password, firstName, lastName, phone, address, isAdmin = false } = req.body;

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
    });
    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Internal server error while creating user',
    });
  }
});

router.put('/users/:id', async (req, res) => {
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

    const updateData = {};
    const changes = {};
    let actionType = 'UPDATED_USER';

    if (email != undefined && email !== existingUser.email) {
      updateData.email = email.toLowerCase().trim();
      changes.email = {
        from: existingUser.email,
        to: email.toLowerCase().trim(),
      };
    }
    if (firstName != undefined && firstName !== existingUser.firstName) {
      updateData.firstName = firstName.trim();
      changes.firstName = {
        from: existingUser.firstName,
        to: firstName.trim(),
      };
    }
    if (lastName != undefined && lastName !== existingUser.lastName) {
      updateData.lastName = lastName.trim();
      changes.lastName = {
        from: existingUser.lastName,
        to: lastName.trim(),
      };
    }
    if (phone != undefined && phone !== existingUser.phone) {
      updateData.phone = phone.trim();
      changes.phone = {
        from: existingUser.phone,
        to: phone.trim(),
      };
    }
    if (address != undefined && address !== existingUser.address) {
      updateData.address = address.trim();
      changes.address = {
        from: existingUser.address,
        to: address.trim(),
      };
    }
    if (isAdmin != undefined && isAdmin !== existingUser.isAdmin) {
      updateData.isAdmin = Boolean(isAdmin);
      changes.isAdmin = {
        from: existingUser.isAdmin,
        to: Boolean(isAdmin),
      };
    }
    if (isActive !== undefined && isActive !== existingUser.isActive) {
      updateData.isActive = Boolean(isActive);
      changes.isActive = {
        from: existingUser.isActive,
        to: Boolean(isActive),
      };

      actionType = isActive ? 'REACTIVATED_USER' : 'DISABLED_USER';
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
      data: updateData,
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
    });

    if (Object.keys(updateData).length > 0) {
      await logAdminAction(req.user.userId, 'UPDATED_USER', 'USER', userId, { changes });
    }
    res.json({
      message:
        actionType === 'DISABLED_USER'
          ? 'User disabled successfully'
          : actionType === 'REACTIVATED_USER'
          ? 'User reactivated successfully'
          : Object.keys(updateData).length <= 0
          ? 'No fields were changed, therefore no changes were made'
          : 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Internal server error while updating user',
    });
  }
});

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
