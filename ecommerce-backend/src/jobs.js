const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log(`Initializing scheduled jobs`);

cron.schedule('0 * * * *', async () => {
  try {
    console.log(`Running coupon expiration check`);

    const result = await prisma.coupon.updateMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        isActive: false,
      },
    });

    if (result.count > 0) {
      console.log(`Disabled ${result.count} expired coupons`);
      // console.log(`${coupon.code} has been disabled}`);
    } else {
      console.log(`No expired coupons found`);
    }
  } catch (error) {
    console.error('Error updating expired coupons', error);
  }
});
