import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(
  cors({
    origin: 'http://localhost:8080',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`Backend hit - ${req.method} ${req.path}`);
  next();
});

import authRouter from './routes/auth.js';
import productRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import adminRouter from './routes/admin.js';
import couponRoutes from './routes/coupon.js';
import './jobs.js';

app.use('/api/admin', adminRouter);
app.use('/api/coupon', couponRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRouter);
app.use('/api', productRoutes);
app.get('/', (req, res) => {
  console.log(`Root endpoint hit`);
  res.json({ message: 'Backend API is running!' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
