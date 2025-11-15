import express from 'express';
import db from '../db.js';

const router = express.Router();

// 🛒 Get all cart items with product details
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT 
      cart.id,
      cart.quantity,
      products.name,
      products.price,
      products.image,
      products.categories
    FROM cart
    JOIN products ON cart.id = products.id
  `).all();

  res.json(rows);
});

// Add item
router.post('/', (req, res) => {
  const { id, quantity } = req.body;

  // Check if item already exists
  const existing = db.prepare('SELECT * FROM cart WHERE id = ?').get(id);

  if (existing) {
    // If exists, update quantity
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?')
      .run(quantity, id);
  } else {
    // Otherwise, insert new
    db.prepare('INSERT INTO cart (id, quantity) VALUES (?, ?)').run(id, quantity);
  }

  res.json({ success: true });
});

// 🆕 New route: set exact quantity
router.post('/set', (req, res) => {
  const { id, quantity } = req.body;

  const existing = db.prepare('SELECT * FROM cart WHERE id = ?').get(id);

  if (existing) {
    db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(quantity, id);
  } else {
    db.prepare('INSERT INTO cart (id, quantity) VALUES (?, ?)').run(id, quantity);
  }

  res.json({ success: true });
});


// Delete item
router.delete('/:id', (req, res) => {
  console.log('Query params:', req.query);
  const { id } = req.params;
  const deleteAll = req.query.all === "1"; // ?all=1 means delete all

  const item = db.prepare('SELECT quantity FROM cart WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (deleteAll) {
    console.log('🗑️ Delete all', id);
    // Delete the whole item
    const info = db.prepare('DELETE FROM cart WHERE id = ?').run(id);
    return res.json({
      success: true,
      deletedAll: true,
      rowsAffected: info.changes
    });
  } else {
    console.log('➖ Decreasing quantity by 1 for', id);
    // Only decrease quantity by 1
    if (item.quantity > 1) {
      const info = db.prepare('UPDATE cart SET quantity = quantity - 1 WHERE id = ?').run(id);
      return res.json({
        success: true,
        deletedOne: true,
        rowsAffected: info.changes
      });
    } else {
      const info = db.prepare('DELETE FROM cart WHERE id = ?').run(id);
      return res.json({
        success: true,
        deletedAll: true,
        rowsAffected: info.changes
      });
    }
  }
});



export default router;
