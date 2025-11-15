import express from 'express';
import db from '../db.js';
import { randomUUID } from 'node:crypto'

const router = express.Router();

// POST /api/order/checkout
router.post('/checkout', (req, res) => {
  try {
    // 1. Get all items from cart
    const cartItems = db.prepare(`
      SELECT c.id, c.quantity, p.price
      FROM cart c
      JOIN products p ON c.id = p.id
    `).all();

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Calculate total price
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 2. Generate unique order
    const orderId = randomUUID();
    const orderTimeMs = Date.now();

    // 3. Insert order
    db.prepare(
      'INSERT INTO orders (id, order_time_ms, total_price) VALUES (?, ?, ?)'
    ).run(orderId, orderTimeMs, totalPrice);

    // 4. Add products from cart to order_products
    const insertOrderProduct = db.prepare(`
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES (?, ?, ?)
    `);

    for (const item of cartItems) {
      insertOrderProduct.run(orderId, item.id, item.quantity);
    }


    // 5. Clear the cart
    db.exec('DELETE FROM cart;');

    // 6. Build response object
    const orderResponse = {
      id: orderId,
      orderTimeMs,
      totalPrice,
      products: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))
    };

    res.json(orderResponse);
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// 🧾 GET /api/order/orders — list all orders with products
router.get('/orders', (req, res) => {
  try {
    // 1️⃣ Get all orders
    const orders = db.prepare('SELECT * FROM orders ORDER BY order_time_ms DESC').all();

    // 2️⃣ Prepare a join query to fetch product details for each order
    const getOrderProducts = db.prepare(`
      SELECT 
        op.product_id,
        op.quantity,
        p.name,
        p.image
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = ?
    `);

    // 3️⃣ Map orders to include product details
    const result = orders.map((order) => ({
      id: order.id,
      orderTimeMs: order.order_time_ms,
      totalPrice: order.total_price,
      products: getOrderProducts.all(order.id).map((p) => ({
        productId: p.product_id,
        name: p.name,
        quantity: p.quantity,
        image: p.image,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// DELETE all orders
router.delete('/orders', (req, res) => {
  try {
    // Delete all order-related records
    db.exec('DELETE FROM order_products;');
    db.exec('DELETE FROM orders;');

    res.json({ message: '✅ All orders deleted successfully' });
  } catch (err) {
    console.error('Error deleting orders:', err);
    res.status(500).json({ error: 'Failed to delete orders' });
  }
});


export default router