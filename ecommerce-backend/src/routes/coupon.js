const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('./auth');
const { logAdminAction } = require('./admin');
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

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!coupon) {
      return res.status(404).json({
        error: `Invalid coupon code: ${code.toUpperCase()}`,
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
    res.status(500).json({ error: 'Internal sever error while valildating coupon' });
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
      return res.status(409).json({ error: 'This coupon already exists' });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        description,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toLocaleString('en-US').slice(0, 16) : null,
        isActive: Boolean(isActive),
      },
    });
    await logAdminAction(req.user.userId, 'CREATED_COUPON', 'COUPON', newCoupon.id, {
      code: newCoupon.code,
      type: newCoupon.type,
      value: newCoupon.value,
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
    const { id, code, type, value, description, minOrder, maxDiscount, expiresAt, isActive } = req.body;
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id: req.body.id,
      },
    });
    if (!existingCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (code && code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: id },
        },
      });

      if (codeExists) {
        return res.status(409).json({ error: 'Coupon code already exists' });
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: id },
      data: {
        id,
        code: code ? code.toUpperCase() : undefined,
        type,
        value: value ? parseFloat(value) : undefined,
        description,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    const changes = {
      id: id !== existingCoupon.id ? { from: existingCoupon.id, to: id } : undefined,
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
      maxDiscount: { from: existingCoupon.maxDiscount, to: maxDiscount },
      expiresAt: (expiresAt === null ? null : existingCoupon.expiresAt)
        ? {
            from: existingCoupon.expiresAt ? existingCoupon.expiresAt.toLocaleString('en-US').slice(0, 16) : null,
            to: expiresAt ? expiresAt.toLocaleString('en-US').slice(0, 16) : null,
          }
        : undefined,
      isActive: isActive !== existingCoupon.isActive ? { from: existingCoupon.isActive, to: isActive } : undefined,
    };

    const filteredChanges = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined));

    await logAdminAction(req.user.userId, 'UPDATED_COUPON', 'COUPON', id.toString(), {
      changes: filteredChanges,
    });
    res.json({
      message: 'Coupon updated successfully',
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      error: 'Internal server error while updating coupon',
    });
  }
});

module.exports = router;
