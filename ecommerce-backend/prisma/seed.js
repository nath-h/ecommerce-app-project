//npx prisma db push, seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database:');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0123',
        address: '123 Main St, Anytown, ST 12345',
        isAdmin: false,
        password: 'testpass',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-0456',
        address: '456 Oak Ave, Somewhere, ST 67890',
        isAdmin: false,
        isActive: false,
        password: 'testpass',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '555-0789',
        address: '789 Admin Blvd, AdminCity, ST 11111',
        isAdmin: true,
        isActive: false,
        password: 'testpass',
      },
    }),
  ]);

  console.log('Created 3 users');

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Broccoli',
        description: 'Fresh green broccoli',
        price: 5.2,
        type: 'VEGETABLE',
        icon: 'broccoli',
        stock: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Oranges',
        description: 'Juicy sweet oranges',
        price: 9.95,
        type: 'FRUIT',
        icon: 'orange',
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Steaks',
        description: 'Premium beef steaks',
        price: 8.32,
        type: 'MEAT',
        icon: 'steak',
        stock: 8,
      },
    }),
  ]);

  console.log('Created 3 products');

  const coupon = await prisma.coupon.create({
    data: {
      code: 'SAVE10',
      type: 'PERCENTAGE',
      value: 10,
      description: '10% off order',
      minOrder: 0,
      maxDiscount: null,
      isActive: true,
    },
  });

  console.log(`Coupon ${coupon.code} created`);

  console.log('Created coupon');

  const carts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: users[0].id,
      },
    }),
    prisma.cart.create({
      data: {
        userId: users[1].id,
      },
    }),
    prisma.cart.create({
      data: {
        userId: users[2].id,
      },
    }),
  ]);

  console.log('Created 3 carts');

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        subtotal: 15.15,
        discount: 1.52,
        total: 13.63,
        status: 'PENDING',
        couponCode: 'SAVE10',
        couponDiscount: 1.52,
        couponType: 'PERCENTAGE',
        couponValue: 10,
        couponDescription: '10% off order',
        notes: 'First order with discount',
      },
    }),

    prisma.order.create({
      data: {
        userId: users[1].id,
        subtotal: 8.32,
        discount: 0.83,
        total: 7.49,
        status: 'SHIPPED',
        couponCode: 'SAVE10',
        couponDiscount: 0.83,
        couponType: 'PERCENTAGE',
        couponValue: 10,
        couponDescription: '10% off order',
        notes: 'Quick steak order',
      },
    }),

    prisma.order.create({
      data: {
        userId: users[2].id,
        subtotal: 19.27,
        discount: 0,
        total: 19.27,
        status: 'DELIVERED',
        notes: 'Admin order without coupon',
      },
    }),
  ]);

  console.log('Created 3 orders');

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 5.2,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[1].id,
        quantity: 1,
        price: 9.95,
      },
    }),

    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[2].id,
        quantity: 1,
        price: 8.32,
      },
    }),

    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[0].id,
        quantity: 2,
        price: 5.2,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[1].id,
        quantity: 1,
        price: 9.95,
      },
    }),
  ]);

  console.log('Created order items');

  await Promise.all([
    prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: products[2].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: carts[1].id,
        productId: products[0].id,
        quantity: 2,
      },
    }),
  ]);

  console.log('Created cart items');

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
