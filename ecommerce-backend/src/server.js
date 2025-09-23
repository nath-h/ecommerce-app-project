const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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
const { router: authRouter } = require('./routes/auth');
const productRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

app.use('/api/admin', adminRoutes);
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
