// db.js
import Database from 'better-sqlite3';
const db = new Database('products.db');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    categories TEXT NOT NULL
  );
`);

// Cart
db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id TEXT PRIMARY KEY,
    quantity REAL NOT NULL
  )
  `)


// --- ORDERS TABLE ---
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,          -- unique ID
    order_time_ms INTEGER NOT NULL,
    total_price REAL NOT NULL
  );
`);

// --- ORDER_PRODUCTS TABLE ---
db.exec(`
  CREATE TABLE IF NOT EXISTS order_products (
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bestseller (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    categories TEXT NOT NULL
  )
`)

export default db;
