const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, address, password } = req.body;

    if (!email || !firstName || !lastName || !phone || !address || !password) {
      return res.status(400).json({
        error: 'All fields are required.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
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
        email,
        firstName,
        lastName,
        phone,
        address,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!user || !isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error:
          'Your account has been disabled. Please contact an administrator.',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
    });
  }
});

router.post('/verify-identity', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        error: 'Email and phone are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const isValidEmail =
      email.trim().toLowerCase() === user.email.trim().toLowerCase();
    const isValidPhone = phone.trim() === user.phone.trim();

    if (!isValidEmail) {
      return res.status(401).json({
        error: 'Invalid email',
      });
    } else if (!isValidPhone) {
      return res.status(401).json({
        error: 'Invalid phone',
      });
    } else {
      res.json({
        message: 'Validation successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Internal server error during validation',
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        error: 'Email and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: 'Password reset successfuly',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    res.status(500).json({
      error: 'Internal server error during password reset',
    });
  }
});

module.exports = router;
