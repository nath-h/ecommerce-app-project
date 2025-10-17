import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

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
    const parsedDiscount = discount ? parseFloat(discount) : null;
    const parsedTotal = parseFloat(total);

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
