import db from './db.js';
import { products } from './models/productModel.js';
import { defaultCart } from './models/defaultCart.js';
import { bestSeller } from './models/bestSeller.js';

// Clear old data first
db.exec('DELETE FROM products');
db.exec('DELETE FROM cart');
db.exec('DELETE FROM bestseller');

// Insert all sample products
const insert = db.prepare(`
  INSERT INTO products (id, name, price, image, categories)
  VALUES (?, ?, ?, ?, ?)
`);

for (const p of products) {
  insert.run(
    p.id,
    p.name,
    p.price,
    p.image,
    p.categories.join(',') // convert array → "meat,protein,snacks"
  );
}

console.log('✅ Seeded products successfully!');

// Insert default cart items
const insertCart = db.prepare(`
  INSERT INTO cart (id, quantity)
  VALUES (?, ?)
`);

for (const c of defaultCart) {
  insertCart.run(
    c.id,
    c.quantity
  );
}

// insert bestSeller
const insertBestSeller = db.prepare(`
  INSERT INTO bestseller (id, name, price, image, categories)
  VALUES (?, ?, ?, ?, ?)
`);

for (const b of bestSeller) {
  insertBestSeller.run(
    b.id,
    b.name,
    b.price,
    b.image,
    JSON.stringify(b.categories) // ⬅ store JSON array
  );
}

console.log('🛒 Seeded default cart successfully!');