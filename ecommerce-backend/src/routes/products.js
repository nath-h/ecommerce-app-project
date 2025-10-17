import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth.js';
import { logAdminAction } from './admin.js';
const router = express.Router();
const prisma = new PrismaClient();

router.use('/admin', authenticateToken, requireAdmin);

router.get('/admin', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products', error);
    res.status(500).json({ error: 'Internal server error while fetching products' });
  }
});

router.post('/admin', async (req, res) => {
  try {
    const { name, type, price, description, isActive, stock, icon } = req.body;

    if (!name || !type || !price || !stock) {
      return res.status(400).json({ error: 'Name, type, price and stock are required fields' });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingProduct) {
      return res.status(200).json({
        message: `Product "${existingProduct.name}" already exists. Loaded this product to be edited instead.`,
        product: existingProduct,
        isExisting: true,
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name,
        type,
        price: parseFloat(price),
        description,
        isActive: Boolean(isActive),
        stock: stock,
        icon: icon,
      },
    });
    await logAdminAction(req.user.userId, 'CREATED_PRODUCT', 'PRODUCT', newProduct.id, {
      name: newProduct.name,
      icon: newProduct.icon,
      type: newProduct.type,
      price: newProduct.price,
      stock: newProduct.stock,
      isActive: newProduct.isActive,
    });
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error while creating product' });
  }
});

router.put('/admin/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, type, price, description, isActive, stock, icon } = req.body;
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name && name !== existingProduct.name) {
      const productExists = await prisma.product.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          id: { not: productId },
        },
      });

      if (productExists) {
        return res.status(409).json({ error: 'Product already exists' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || undefined,
        type,
        price: price ? parseFloat(price) : undefined,
        stock,
        description,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        icon: icon,
      },
    });

    const changes = {
      name: name !== existingProduct.name ? { from: existingProduct.name, to: name } : undefined,
      type: type !== existingProduct.type ? { from: existingProduct.type, to: type } : undefined,
      price:
        parseFloat(price) !== parseFloat(existingProduct.price)
          ? { from: existingProduct.price, to: parseFloat(price) }
          : undefined,
      stock: stock !== existingProduct.stock ? { from: existingProduct.stock, to: stock } : undefined,
      icon: icon !== existingProduct.icon ? { from: existingProduct.icon, to: icon } : undefined,
      isActive: isActive !== existingProduct.isActive ? { from: existingProduct.isActive, to: isActive } : undefined,
    };

    const filteredChanges = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined));

    if (Object.keys(filteredChanges).length > 0) {
      await logAdminAction(req.user.userId, 'UPDATED_PRODUCT', 'PRODUCT', productId, {
        changes: filteredChanges,
      });
    }
    res.json({
      message:
        Object.keys(filteredChanges).length <= 0
          ? 'No fields were changed, therefore no changes were made'
          : 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Internal server error while updating product',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedProducts = products.map(product => ({
      ...product,
      price: product.price.toString(),
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
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

router.get('/by-name/:name', async (req, res) => {
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

router.post('/', async (req, res) => {
  try {
    const { id, name, description, price, type, icon, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        id,
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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

export default router;
