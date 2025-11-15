import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM bestseller").all();

    // convert categories string → array
    const formatted = data.map(item => ({
      ...item,
      categories: JSON.parse(item.categories)
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET /bestseller Error:", err);
    res.status(500).json({ error: "Failed to fetch bestseller items" });
  }
})

export default router