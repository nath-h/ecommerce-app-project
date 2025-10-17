import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth.js';
import { logAdminAction } from './admin.js';
const router = express.Router();
const prisma = new PrismaClient();

router.use('/admin', authenticateToken, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        description: true,
        minOrder: true,
        maxDiscount: true,
        expiresAt: true,
      },
    });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons', error);
  }
});

router.get('/:code/validate', async (req, res) => {
  try {
    const { code } = req.params;
    const { subtotal } = req.query;

    let coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });
    if (!coupon) {
      return res.status(404).json({
        error: `Invalid coupon code: ${code.toUpperCase()}`,
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        error: 'This coupon is no longer active.',
      });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      coupon = await prisma.coupon.update({
        where: { id: coupon.id },
        data: { isActive: false },
      });
      return res.status(400).json({
        error: 'This coupon has expired and is no longer valid.',
      });
    }

    if (parseFloat(subtotal) < parseFloat(coupon.minOrder)) {
      return res.status(400).json({
        error: `Minimum order of $${parseFloat(coupon.minOrder)}.`,
      });
    }
    res.json(coupon);
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Internal server error while valildating coupon' });
  }
});

router.get('/admin', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons', error);
    res.status(500).json({ error: 'Internal server error while fetching coupons' });
  }
});

router.post('/admin', async (req, res) => {
  try {
    const { code, type, value, description, minOrder, maxDiscount, expiresAt, isActive } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ error: 'Code, type, and value are required fields' });
    }

    const existingCoupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return res.status(200).json({
        message: `Coupon "${existingCoupon.code}" already exists. Loaded this coupon to be edited instead.`,
        coupon: existingCoupon,
        isExisting: true,
      });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        description,
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: Boolean(isActive),
      },
    });
    await logAdminAction(req.user.userId, 'CREATED_COUPON', 'COUPON', newCoupon.id, {
      code: newCoupon.code,
      type: newCoupon.type,
      value: newCoupon.value,
      expiresAt: newCoupon.expiresAt || null,
      isActive: newCoupon.isActive,
    });
    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: newCoupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Internal server error while creating coupon' });
  }
});

router.put('/admin/:id', async (req, res) => {
  try {
    const couponId = req.params.id;
    const { code, type, value, description, minOrder, maxDiscount, expiresAt, isActive } = req.body;
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id: couponId,
      },
    });
    if (!existingCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (code && code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: couponId },
        },
      });

      if (codeExists) {
        return res.status(409).json({ error: 'Coupon code already exists' });
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        code: code ? code.toUpperCase() : undefined,
        type,
        value: value ? parseFloat(value) : undefined,
        description,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    const changes = {
      code: code !== existingCoupon.code ? { from: existingCoupon.code, to: code } : undefined,
      type: type !== existingCoupon.type ? { from: existingCoupon.type, to: type } : undefined,
      value:
        parseFloat(value) !== parseFloat(existingCoupon.value)
          ? { from: existingCoupon.value, to: parseFloat(value) }
          : undefined,
      minOrder:
        parseFloat(minOrder) !== parseFloat(existingCoupon.minOrder)
          ? { from: existingCoupon.minOrder, to: parseFloat(minOrder) }
          : undefined,
      maxDiscount: (() => {
        if (maxDiscount === undefined) return undefined;

        if (String(maxDiscount) !== String(existingCoupon.maxDiscount)) {
          return { from: existingCoupon.maxDiscount, to: maxDiscount };
        }
        return undefined;
      })(),

      expiresAt: (() => {
        if (expiresAt === undefined) return undefined;

        const oldTime = existingCoupon.expiresAt ? existingCoupon.expiresAt.toISOString().slice(0, 16) : null;
        const newTime = expiresAt ? new Date(expiresAt).toISOString().slice(0, 16) : null;

        if (oldTime !== newTime) {
          return {
            from: existingCoupon.expiresAt ? existingCoupon.expiresAt.toISOString() : null,
            to: expiresAt ? new Date(expiresAt).toISOString() : null,
          };
        }
        return undefined;
      })(),
      isActive: isActive !== existingCoupon.isActive ? { from: existingCoupon.isActive, to: isActive } : undefined,
    };

    const filteredChanges = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined));

    if (Object.keys(filteredChanges).length > 0) {
      await logAdminAction(req.user.userId, 'UPDATED_COUPON', 'COUPON', couponId, {
        changes: filteredChanges,
      });
    }
    res.json({
      message:
        Object.keys(filteredChanges).length <= 0
          ? 'No fields were changed, therefore no changes were made'
          : 'Coupon updated successfully',
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      error: 'Internal server error while updating coupon',
    });
  }
});

export default router;
