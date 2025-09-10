const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedProducts = products.map((product) => ({
      ...product,
      price: product.price.toString(),
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        isActive: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const formattedProduct = {
      ...product,
      price: product.price.toString(),
    };
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.get('/products/by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        name: decodeURIComponent(name),
        isActive: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const formattedProduct = {
      ...product,
      price: product.price.toString(),
    };
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, price, type, icon, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        type,
        icon: icon || 'spoon-and-fork',
        stock: parseInt(stock) || 0,
      },
    });
    const formattedProduct = {
      ...product,
      price: product.price.toString(),
    };
    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, type, icon, stock, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (type !== undefined) updateData.type = type;
    if (icon !== undefined) updateData.icon = icon;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive;
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    const formattedProduct = {
      ...product,
      price: product.price.toString(),
    };
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: 'Product deactivated', product });
  } catch (error) {
    console.error('Error deactivating product:', error);
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
});

module.exports = router;
