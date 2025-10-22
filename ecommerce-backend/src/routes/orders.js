import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth.js';
import { logAdminAction } from './admin.js';
const router = express.Router();
const prisma = new PrismaClient();

router.use('/admin', authenticateToken, requireAdmin);

router.get('/admin', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders', error);
    res.status(500).json({ error: 'Internal server error while fetching orders' });
  }
});

router.post('/admin', async (req, res) => {
  try {
    const {
      userId,
      subtotal,
      discount,
      total,
      status,
      notes,
      couponCode,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
    } = req.body;

    if (!subtotal || !total || !status || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return res
        .status(400)
        .json({ error: 'Subtotal, total, status, name, email, phone and address are required fields' });
    }

    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(409).json({
          error: 'Error creating order: User with that userID does not exist',
        });
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        userId,
        subtotal: parseFloat(subtotal),
        discount,
        total: parseFloat(total),
        status,
        notes,
        couponCode,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
      },
    });
    await logAdminAction(req.user.userId, 'CREATED_ORDER', 'ORDER', newOrder.id, {
      orderId: newOrder.id,
      userId: newOrder.userId ? newOrder.userId : null,
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      total: newOrder.total,
      status: newOrder.status,
      notes: newOrder.notes,
      couponCode: newOrder.couponCode ? newOrder.couponCode : null,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      customerPhone: newOrder.customerPhone,
      customerAddress: newOrder.customerAddress,
    });
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error while creating order' });
  }
});

router.put('/admin/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const {
      userId,
      subtotal,
      discount,
      total,
      status,
      notes,
      couponCode,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
    } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        userId: userId,
        subtotal: subtotal ? parseFloat(subtotal) : undefined,
        discount: discount,
        total: total ? parseFloat(total) : undefined,
        status: status,
        notes: notes,
        couponCode: couponCode,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
      },
    });

    const changes = {
      userId: userId !== existingOrder.userId ? { from: existingOrder.userId, to: userId } : undefined,
      subtotal:
        parseFloat(subtotal) !== parseFloat(existingOrder.subtotal)
          ? { from: existingOrder.subtotal, to: parseFloat(subtotal).toFixed(2) }
          : undefined,
      discount:
        parseFloat(discount) !== parseFloat(existingOrder.discount) && discount !== null
          ? { from: existingOrder.discount, to: parseFloat(discount).toFixed(2) }
          : undefined,
      total:
        parseFloat(total) !== parseFloat(existingOrder.total)
          ? { from: existingOrder.total, to: parseFloat(total).toFixed(2) }
          : undefined,
      status: status !== existingOrder.status ? { from: existingOrder.status, to: status } : undefined,
      notes: notes !== existingOrder.notes ? { from: existingOrder.notes, to: notes } : undefined,
      couponCode:
        couponCode !== existingOrder.couponCode ? { from: existingOrder.couponCode, to: couponCode } : undefined,
      customerName:
        customerName !== existingOrder.customerName
          ? { from: existingOrder.customerName, to: customerName }
          : undefined,
      customerEmail:
        customerEmail !== existingOrder.customerEmail
          ? { from: existingOrder.customerEmail, to: customerEmail }
          : undefined,
      customerPhone:
        customerPhone !== existingOrder.customerPhone
          ? { from: existingOrder.customerPhone, to: customerPhone }
          : undefined,
      customerAddress:
        customerAddress !== existingOrder.customerAddress
          ? { from: existingOrder.customerAddress, to: customerAddress }
          : undefined,
    };

    const filteredChanges = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined));

    if (Object.keys(filteredChanges).length > 0) {
      if (updatedOrder.status === 'CANCELLED') {
        await logAdminAction(req.user.userId, 'CANCELLED_ORDER', 'ORDER', orderId, {
          changes: filteredChanges,
        });
      } else {
        await logAdminAction(req.user.userId, 'UPDATED_ORDER', 'ORDER', orderId, {
          changes: filteredChanges,
        });
      }
    }
    res.json({
      message:
        Object.keys(filteredChanges).length <= 0
          ? 'No fields were changed, therefore no changes were made'
          : 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      error: 'Internal server error while updating order',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, customerInfo, cartItems, coupon, subtotal, discount, total, notes } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are required. Your cart was empty.' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.address) {
      return res.status(400).json({ error: 'Name, email, and address are required.' });
    }

    let validatedUserId = null;

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
        });
        if (user) {
          validatedUserId = parseInt(userId);
        }
      } catch (error) {
        console.warn('Invalid userId provided:', userId);
      }
    }

    const parsedSubtotal = parseFloat(subtotal);
    const parsedDiscount = parseFloat(discount);
    const parsedTotal = parseFloat(total);

    if (parsedTotal < 0) {
      return res.status(400).json({
        error: 'Invalid order: Total cannot be negative',
      });
    }

    if (parsedDiscount > parsedSubtotal) {
      return res.status(400).json({
        error: 'Invalid order: Discount cannot exceed subtotal',
      });
    }

    if (coupon && coupon.type === 'PERCENTAGE' && parseFloat(coupon.value) > 100) {
      return res.status(400).json({
        error: 'Invalid coupon: Percentage cannot exceed 100%',
      });
    }

    const expectedTotal = parsedSubtotal - parsedDiscount;
    if (Math.abs(expectedTotal - parsedTotal) > 0.01) {
      return res.status(400).json({
        error: 'Invalid order: Total calculation mismatch',
      });
    }

    const result = await prisma.$transaction(async tx => {
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (!product.isActive) {
          throw new Error(`Product is not active: ${product.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      const orderData = {
        subtotal: parsedSubtotal,
        discount: parsedDiscount,
        total: parsedTotal,
        notes: notes || null,
        couponCode: coupon?.code || null,
        couponDiscount: coupon?.discount ? parseFloat(coupon.discount) : null,
        couponType: coupon?.type || null,
        couponValue: coupon?.value ? parseFloat(coupon.value) : null,
        couponDescription: coupon?.description || null,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || null,
        customerAddress: customerInfo.address,
      };

      if (validatedUserId) {
        orderData.user = {
          connect: { id: validatedUserId },
        };
      }

      const newOrder = await tx.order.create({
        data: orderData,
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const completeOrder = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
      return completeOrder;
    });
    res.status(201).json({
      success: true,
      order: result,
      message: 'Order created successfully!',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    if (
      error.message.includes('Insufficient stock') ||
      error.message.includes('Product not found') ||
      error.message.includes('not active')
    ) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userIdParam = req.query.userId;
    const customerEmail = req.query.customerEmail;
    const isAdmin = req.query.isAdmin === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let whereClause = {};

    if (isAdmin) {
      whereClause = {};
    } else if (userIdParam && !isNaN(parseInt(userIdParam))) {
      whereClause = {
        user: {
          id: parseInt(userIdParam),
        },
      };
    } else if (customerEmail) {
      whereClause = {
        customerEmail: customerEmail,
        userId: null,
      };
    } else {
      return res.status(400).json({
        error: 'Either userId, customerEmail, or admin access is required.',
      });
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);
    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, customerEmail } = req.query;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let hasAccess = false;

    if (userId && order.user?.id === parseInt(userId)) {
      hasAccess = true;
    } else if ((customerEmail && order.customerEmail === customerEmail) || order.user.email === customerEmail) {
      hasAccess = true;
    } else if (!userId && !customerEmail) {
      return res.status(401).json({ error: 'Authentication required - provide userid or customerEmail' });
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied - this order does not belong to you' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const result = await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
          user: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (userId && order.user?.id !== parseInt(userId)) {
        throw new Error('Access denied - this order does not belong to you');
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Order has already been cancelled. No further action is required.');
      }

      if (order.status === 'DELIVERED') {
        throw new Error('Cannot cancel orders that have already been delivered.');
      }

      if (order.status === 'SHIPPED') {
        throw new Error('Cannot cancel orders that have already been shipped.');
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
      return updatedOrder;
    });
    res.json({
      success: true,
      order: result,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('Cannot cancel') || error.message.includes('already been cancelled')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
