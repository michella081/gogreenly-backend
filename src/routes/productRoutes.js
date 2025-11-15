import express from 'express';
import db from '../db.js';

const router = express.Router();

// ✅ GET /api/products → supports both search and category filters
router.get('/', (req, res) => {
  const { search, categories } = req.query;

  let query = 'SELECT * FROM products';
  const params = [];

  const categoryConditions = [];
  const searchConditions = [];

  // 1️⃣ Category filter
  if (categories) {
    const categoryList = categories.toLowerCase().split('+');
    categoryList.forEach(cat => {
      categoryConditions.push(`LOWER(categories) LIKE ?`);
      params.push(`%${cat}%`);
    });
  }

  // 2️⃣ Search filter
  if (search) {
    const keywords = search.toLowerCase().split(' ');
    keywords.forEach(word => {
      searchConditions.push(`LOWER(name) LIKE ?`);
      params.push(`%${word}%`);
    });
  }

  // 3️⃣ Combine filters (MUST MATCH BOTH)
  const combined = [];

  if (categoryConditions.length > 0) {
    combined.push(`(${categoryConditions.join(' OR ')})`);
  }

  if (searchConditions.length > 0) {
    combined.push(`(${searchConditions.join(' OR ')})`);
  }

  if (combined.length > 0) {
    query += ' WHERE ' + combined.join(' AND ');
  }

  try {
    const rows = db.prepare(query).all(...params);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No products match your search' });
    }

    const formatted = rows.map(p => ({
      ...p,
      categories: p.categories ? p.categories.split(',') : []
    }));

    res.json(formatted);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Database query failed' });
  }
});

// ✅ GET /api/products/:id → find product by ID
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // convert comma-separated categories → array
    res.json({
      ...product,
      categories: product.categories ? product.categories.split(',') : []
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Database query failed' });
  }
});

export default router;
