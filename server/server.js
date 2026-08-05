import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_EMPLOYEES,
  INITIAL_COUPONS,
  INITIAL_SETTINGS
} from './data/initialDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel serverless, use /tmp directory for writable database
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper: Ensure Data Directory & DB File Exist
function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const seedData = {
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        employees: INITIAL_EMPLOYEES,
        coupons: INITIAL_COUPONS,
        settings: INITIAL_SETTINGS,
        orders: [
          {
            id: 'ord_demo_1',
            orderNumber: 849201,
            customerName: 'Aman Verma',
            email: 'aman@example.com',
            phone: '+91 98765 00112',
            items: [
              {
                id: 'prod_custom_tee_1',
                name: 'CUSTOM DTG GRAPHIC OVERSIZED TEE',
                price: 999,
                quantity: 1,
                size: 'L',
                color: 'Pitch Black'
              }
            ],
            subtotal: 999,
            shipping: 0,
            total: 999,
            paymentMethod: 'UPI',
            status: 'placed',
            shippingAddress: {
              line1: 'Flat 402, Skyline Residency',
              city: 'Bengaluru',
              pincode: '560038'
            },
            createdAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

function readDb() {
  try {
    initDatabase();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database:', err);
  }
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    employees: INITIAL_EMPLOYEES,
    coupons: INITIAL_COUPONS,
    settings: INITIAL_SETTINGS,
    orders: []
  };
}

function writeDb(data) {
  try {
    initDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    firebaseConnected: true,
    firebaseProject: process.env.FIREBASE_PROJECT_ID || 'genwin-store-app',
    server: 'GENWIN. STUDIO EXPRESS BACKEND & FIREBASE API v1.0',
    vercel: Boolean(process.env.VERCEL),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ── RAZORPAY API ─────────────────────────────────────────────────────────────
const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_TM0e930fFxpDsE',
  key_secret: 'PBtHsNjpKgOZD3nS98Gl7j1U'
});

app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order', details: err });
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const secret = 'PBtHsNjpKgOZD3nS98Gl7j1U';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
    
  const isAuthentic = expectedSignature === razorpay_signature;
  
  if (isAuthentic) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
});

// ── PRODUCTS API ─────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const db = readDb();
  let products = db.products || [];

  const { category, search, customizable } = req.query;
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (customizable === 'true') {
    products = products.filter(p => p.isCustomizable);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDb();
  const prod = (db.products || []).find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!prod) return res.status(404).json({ error: 'PRODUCT NOT FOUND' });
  res.json(prod);
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const newProduct = {
    id: 'prod_' + Date.now(),
    slug: (req.body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    basePrice: Number(req.body.basePrice) || 999,
    discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
    stockQty: Number(req.body.stockQty) || 10,
    isCustomizable: Boolean(req.body.isCustomizable),
    rating: 5.0,
    reviewCount: 1,
    images: req.body.images?.length ? req.body.images : ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
    sizes: req.body.sizes || ['S', 'M', 'L', 'XL'],
    colors: req.body.colors || [{ name: 'Black', hex: '#000000' }],
    ...req.body
  };

  db.products = [newProduct, ...(db.products || [])];
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'PRODUCT NOT FOUND' });

  db.products[index] = { ...db.products[index], ...req.body };
  writeDb(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = (db.products || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// ── CATEGORIES API ───────────────────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories || INITIAL_CATEGORIES);
});

app.post('/api/categories', (req, res) => {
  const db = readDb();
  const newCat = {
    id: req.body.id || 'cat_' + Date.now(),
    slug: (req.body.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    ...req.body
  };
  const existingIndex = (db.categories || []).findIndex(c => c.id === newCat.id);
  if (existingIndex !== -1) {
    db.categories[existingIndex] = { ...db.categories[existingIndex], ...newCat };
  } else {
    db.categories = [...(db.categories || []), newCat];
  }
  writeDb(db);
  res.json(newCat);
});

// ── ORDERS API ───────────────────────────────────────────────────────────────
app.get('/api/orders', (req, res) => {
  const db = readDb();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = readDb();
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: 'ord_' + Date.now(),
    orderNumber: orderNumber,
    createdAt: new Date().toISOString(),
    status: 'placed',
    subtotal: req.body.subtotal || 0,
    shipping: req.body.shipping || 0,
    total: req.body.total || 0,
    items: req.body.items || [],
    customerName: req.body.customerName || 'Customer',
    email: req.body.email || '',
    phone: req.body.phone || '',
    shippingAddress: req.body.shippingAddress || {},
    paymentMethod: req.body.paymentMethod || 'COD'
  };

  db.orders = [newOrder, ...(db.orders || [])];
  writeDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDb();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'ORDER NOT FOUND' });

  order.status = req.body.status;
  writeDb(db);
  res.json(order);
});

// ── EMPLOYEES API ────────────────────────────────────────────────────────────
app.get('/api/employees', (req, res) => {
  const db = readDb();
  res.json(db.employees || INITIAL_EMPLOYEES);
});

app.post('/api/employees', (req, res) => {
  const db = readDb();
  const newEmp = {
    id: req.body.id || 'emp_' + Date.now(),
    employeeId: req.body.employeeId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    active: true,
    ...req.body
  };
  const index = (db.employees || []).findIndex(e => e.id === newEmp.id);
  if (index !== -1) {
    db.employees[index] = { ...db.employees[index], ...newEmp };
  } else {
    db.employees = [...(db.employees || []), newEmp];
  }
  writeDb(db);
  res.json(newEmp);
});

app.delete('/api/employees/:id', (req, res) => {
  const db = readDb();
  db.employees = (db.employees || []).filter(e => e.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// ── COUPONS API ──────────────────────────────────────────────────────────────
app.get('/api/coupons', (req, res) => {
  const db = readDb();
  res.json(db.coupons || INITIAL_COUPONS);
});

app.post('/api/coupons/validate', (req, res) => {
  const db = readDb();
  const { code, cartSubtotal } = req.body;
  const coupon = (db.coupons || []).find(c => c.code.toUpperCase() === (code || '').toUpperCase() && c.active);

  if (!coupon) return res.status(404).json({ valid: false, message: 'INVALID OR EXPIRED COUPON CODE.' });
  if (cartSubtotal < coupon.minOrder) {
    return res.status(400).json({ valid: false, message: `MINIMUM ORDER VALUE FOR THIS COUPON IS ₹${coupon.minOrder}` });
  }

  const discountAmount = coupon.discountType === 'percentage'
    ? Math.round((cartSubtotal * coupon.discountValue) / 100)
    : coupon.discountValue;

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  });
});

// ── SETTINGS API ─────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings || INITIAL_SETTINGS);
});

app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

export { app };
export default app;

// Only start standalone listener when not running as Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│  जेनwin.clothing EXPRESS BACKEND & FIREBASE SERVER RUNNING    │
│  ➜ FIREBASE PROJECT: genwin-store-app                       │
│  ➜ PORT: http://localhost:${PORT}                           │
│  ➜ HEALTH: http://localhost:${PORT}/api/health               │
└─────────────────────────────────────────────────────────────┘
    `);
  });
}
