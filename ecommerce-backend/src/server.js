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
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.get('/api/auth', (req, res) => {
  console.log(`Backend hit`);
  res.json({ message: 'Backend API is running!' });
});
app.get('/', (req, res) => {
  console.log(`Backend hit`);
  res.json({ message: 'Backend API is running!' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
