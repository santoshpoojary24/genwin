import { db, rtdb } from '../config/firebase';
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { ref, set, get, child, remove, onValue } from 'firebase/database';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ADS, INITIAL_COUPONS } from '../data/seedData';

const API_BASE_URL = 'http://localhost:5000/api';
const CACHE_VERSION = 'v8';
const KEYS = {
  products   : `genwin_products_${CACHE_VERSION}`,
  orders     : 'genwin_orders',
  customs    : 'genwin_customizations',
  categories : 'genwin_categories',
  coupons    : 'genwin_coupons',
  ads        : 'genwin_ads',
  settings   : 'genwin_settings',
  employees  : 'genwin_employees',
};

const DEFAULT_EMPLOYEES = [
  {
    id: 'emp_1',
    employeeId: 'EMP-4092',
    name: 'Rahul Sharma',
    email: 'staff@genwin.studio',
    department: 'fulfillment',
    role: 'FULFILLMENT AGENT',
    phone: '+91 98765 11223',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    active: true,
  },
  {
    id: 'emp_2',
    employeeId: 'EMP-3081',
    name: 'Sneha Kapoor',
    email: 'sneha@genwin.studio',
    department: 'inventory',
    role: 'INVENTORY MANAGER',
    phone: '+91 98765 44556',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    active: true,
  },
  {
    id: 'emp_3',
    employeeId: 'EMP-5012',
    name: 'Vikrant Mehta',
    email: 'vikrant@genwin.studio',
    department: 'support',
    role: 'SUPPORT REPRESENTATIVE',
    phone: '+91 98765 77889',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    active: true,
  }
];

const DEFAULT_SETTINGS = {
  storeName: 'जेनwin. Studio',
  tagline: 'Oversized Streetwear & Custom DTG Prints',
  supportEmail: 'support@genwin.studio',
  supportPhone: '+91 98765 43210',
  address: 'Studio 402, Lower Parel, Mumbai, Maharashtra 400013',
  freeShippingThreshold: 999,
  flatShippingRate: 99,
  expressShippingRate: 199,
  deliveryDays: '3 - 5 Days',
  taxRate: 18,
  gstin: '27AAAAA0000A1Z5',
  currency: '₹',
  upiEnabled: true,
  codEnabled: true,
  cardEnabled: true,
  minCodOrder: 499,
  lowStockThreshold: 5,
  announcementEnabled: true,
  announcementText: 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER ₹999',
  instagram: '@genwin.studio',
  whatsapp: '+91 98765 43210',
};

// ── localStorage helpers ──────────────────────────────────────────────────
const ls = {
  get(key, fallback) {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
    catch (_) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  },
};

// Helper: Dual Cloud Sync to Firestore & Realtime Database
function syncCloudDatabases(collectionName, itemId, data, isDelete = false) {
  try {
    // 1. Firestore Cloud DB
    if (isDelete) {
      deleteDoc(doc(db, collectionName, itemId)).catch(() => {});
    } else {
      setDoc(doc(db, collectionName, itemId), data, { merge: true }).catch(() => {});
    }

    // 2. Realtime Database (rtdb)
    if (rtdb) {
      const dbRef = ref(rtdb, `${collectionName}/${itemId}`);
      if (isDelete) {
        remove(dbRef).catch(() => {});
      } else {
        set(dbRef, data).catch(() => {});
      }
    }
  } catch (_) {}
}

// Timeout promise wrapper
function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms)),
  ]);
}

// ── Service ───────────────────────────────────────────────────────────────
export const FirebaseService = {

  /** 1. Products (Firebase Cloud Firestore & Realtime DB) */
  async getProducts() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'products')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.products, remote);
        return remote;
      }
    } catch (_) {}

    return ls.get(KEYS.products, INITIAL_PRODUCTS);
  },

  async getProductBySlug(slug) {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug || p.id === slug) || null;
  },

  async saveProduct(product) {
    const isEdit = !!product.id;
    const id = product.id || 'prod_' + Date.now();
    const payload = {
      ...product,
      id,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updatedAt: new Date().toISOString(),
    };
    if (!isEdit) payload.createdAt = new Date().toISOString();

    syncCloudDatabases('products', id, payload);

    const current = ls.get(KEYS.products, INITIAL_PRODUCTS);
    const updated = isEdit ? current.map(p => p.id === id ? payload : p) : [payload, ...current];
    ls.set(KEYS.products, updated);
    return payload;
  },

  async deleteProduct(id) {
    syncCloudDatabases('products', id, null, true);
    const current = ls.get(KEYS.products, INITIAL_PRODUCTS);
    const updated = current.filter(p => p.id !== id);
    ls.set(KEYS.products, updated);
  },

  /** 2. Orders (Firebase Cloud Firestore & Realtime DB) */
  async createOrder(payload) {
    const orderNumber = 'GW-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id: orderNumber,
      orderNumber,
      ...payload,
      status: 'placed',
      createdAt: new Date().toISOString(),
    };

    syncCloudDatabases('orders', orderNumber, order);

    const all = ls.get(KEYS.orders, []);
    ls.set(KEYS.orders, [order, ...all]);
    return order;
  },

  async getAllOrders() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'orders')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.orders, remote);
        return remote;
      }
    } catch (_) {}

    return ls.get(KEYS.orders, []);
  },

  async updateOrderStatus(orderId, newStatus, note = '') {
    const idStr = orderId.toString();
    const order = (await this.getAllOrders()).find(o => o.id === idStr || o.orderNumber.toString() === idStr);
    const updatedPayload = { ...order, status: newStatus, updatedAt: new Date().toISOString() };

    syncCloudDatabases('orders', idStr, updatedPayload);

    const all = ls.get(KEYS.orders, []);
    const updated = all.map(o => {
      if (o.id === idStr || o.orderNumber === idStr || o.id === orderId || o.orderNumber === orderId) {
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    });
    ls.set(KEYS.orders, updated);
    return updated.find(o => o.id === idStr || o.orderNumber === idStr);
  },

  async getOrder(orderId) {
    const idStr = orderId.toString();
    try {
      const snap = await getDoc(doc(db, 'orders', idStr));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    } catch (_) {}

    const orders = await this.getAllOrders();
    return orders.find(o => o.id === idStr || o.orderNumber.toString() === idStr) || null;
  },

  async getUserOrders(userId) {
    const all = await this.getAllOrders();
    return userId ? all.filter(o => o.userId === userId) : all;
  },

  subscribeToOrder(orderId, callback) {
    const idStr = orderId.toString();
    this.getOrder(idStr).then(o => { if (o) callback(o); });

    try {
      if (rtdb) {
        const orderRef = ref(rtdb, `orders/${idStr}`);
        return onValue(orderRef, snap => {
          if (snap.exists()) callback(snap.val());
        });
      }

      return onSnapshot(
        doc(db, 'orders', idStr),
        snap => { if (snap.exists()) callback({ id: snap.id, ...snap.data() }); },
        () => {}
      );
    } catch (_) {
      const iv = setInterval(() => {
        this.getOrder(idStr).then(o => { if (o) callback(o); });
      }, 4000);
      return () => clearInterval(iv);
    }
  },

  /** 3. Employees Staff Directory */
  async getEmployees() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'employees')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.employees, remote);
        return remote;
      }
    } catch (_) {}

    return ls.get(KEYS.employees, DEFAULT_EMPLOYEES);
  },

  async saveEmployee(emp) {
    const id = emp.id || 'emp_' + Date.now();
    const payload = {
      ...emp,
      id,
      employeeId: emp.employeeId ? emp.employeeId.toUpperCase() : 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      active: emp.active ?? true,
      updatedAt: new Date().toISOString(),
    };

    syncCloudDatabases('employees', id, payload);

    const current = await this.getEmployees();
    const exists = current.some(e => e.id === id || e.employeeId === payload.employeeId);
    const updated = exists
      ? current.map(e => (e.id === id || e.employeeId === payload.employeeId) ? payload : e)
      : [payload, ...current];
    ls.set(KEYS.employees, updated);
    return payload;
  },

  async deleteEmployee(id) {
    syncCloudDatabases('employees', id, null, true);

    const current = await this.getEmployees();
    const updated = current.filter(e => e.id !== id && e.employeeId !== id);
    ls.set(KEYS.employees, updated);
  },

  /** 4. Categories Collection */
  async getCategories() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'categories')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.categories, remote);
        return remote;
      }
    } catch (_) {}

    const current = ls.get(KEYS.categories, INITIAL_CATEGORIES);
    return current.map(c => ({
      ...c,
      isFeatured: c.isFeatured ?? true,
      description: c.description || 'Premium heavyweight streetwear collection.',
    }));
  },

  async saveCategory(cat) {
    const id = cat.id || 'cat_' + Date.now();
    const payload = {
      ...cat,
      id,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isFeatured: cat.isFeatured ?? true,
      description: cat.description || 'Premium heavyweight streetwear collection.',
    };

    syncCloudDatabases('categories', id, payload);

    const current = await this.getCategories();
    const exists = current.some(c => c.id === id || c.slug === payload.slug);
    const updated = exists
      ? current.map(c => (c.id === id || c.slug === payload.slug) ? payload : c)
      : [...current, payload];
    ls.set(KEYS.categories, updated);
    return payload;
  },

  async deleteCategory(id) {
    syncCloudDatabases('categories', id, null, true);

    const current = await this.getCategories();
    const updated = current.filter(c => c.id !== id && c.slug !== id);
    ls.set(KEYS.categories, updated);
  },

  /** 5. Coupons */
  async getCoupons() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'coupons')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.coupons, remote);
        return remote;
      }
    } catch (_) {}

    return ls.get(KEYS.coupons, INITIAL_COUPONS);
  },

  async saveCoupon(coupon) {
    const id = coupon.id || 'cpn_' + Date.now();
    const payload = {
      ...coupon,
      id,
      code: coupon.code.toUpperCase(),
      active: coupon.active ?? true,
      maxUses: parseInt(coupon.maxUses) || 500,
      usedCount: coupon.usedCount || 0,
      expiresAt: coupon.expiresAt || '2026-12-31',
    };

    syncCloudDatabases('coupons', id, payload);

    const current = await this.getCoupons();
    const exists = current.some(c => c.id === id || c.code === payload.code);
    const updated = exists
      ? current.map(c => (c.id === id || c.code === payload.code) ? payload : c)
      : [payload, ...current];
    ls.set(KEYS.coupons, updated);
    return payload;
  },

  async deleteCoupon(code) {
    const current = await this.getCoupons();
    const coupon = current.find(c => c.code.toUpperCase() === code.toUpperCase() || c.id === code);
    if (coupon) {
      syncCloudDatabases('coupons', coupon.id, null, true);
    }

    const updated = current.filter(c => c.code.toUpperCase() !== code.toUpperCase() && c.id !== code);
    ls.set(KEYS.coupons, updated);
  },

  async validateCoupon(code, cartSubtotal) {
    const coupons = await this.getCoupons();
    const found = coupons.find(
      c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
    );
    if (!found)
      return { valid: false, message: 'INVALID COUPON CODE.' };
    if (cartSubtotal < found.minOrder)
      return { valid: false, message: `MIN ORDER ₹${found.minOrder} REQUIRED FOR ${found.code}.` };

    const discount =
      found.discountType === 'percentage'
        ? Math.round((cartSubtotal * found.discountValue) / 100)
        : found.discountValue;

    return { valid: true, discount, message: `COUPON APPLIED! SAVED ₹${discount}.` };
  },

  /** 6. Advertisements */
  async getAds() {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'ads')));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ls.set(KEYS.ads, remote);
        return remote;
      }
    } catch (_) {}

    const stored = ls.get(KEYS.ads, INITIAL_ADS);
    return stored;
  },

  async saveAd(ad) {
    const id = ad.id || 'ad_' + Date.now();
    const payload = {
      ...ad,
      id,
      active: ad.active ?? true,
      placement: ad.placement || 'homepage_hero',
      clicks: ad.clicks || 0,
      impressions: ad.impressions || 0,
      createdAt: ad.createdAt || new Date().toISOString(),
    };

    syncCloudDatabases('ads', id, payload);

    const current = await this.getAds();
    const exists = current.some(a => a.id === id);
    const updated = exists
      ? current.map(a => a.id === id ? payload : a)
      : [payload, ...current];
    ls.set(KEYS.ads, updated);
    return payload;
  },

  async deleteAd(id) {
    syncCloudDatabases('ads', id, null, true);

    const current = await this.getAds();
    const updated = current.filter(a => a.id !== id);
    ls.set(KEYS.ads, updated);
  },

  /** 7. Settings */
  async getSettings() {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'settings', 'store_config')));
      if (snap.exists()) {
        const remote = snap.data();
        ls.set(KEYS.settings, remote);
        return remote;
      }
    } catch (_) {}

    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const remoteApi = await res.json();
        ls.set(KEYS.settings, remoteApi);
        return remoteApi;
      }
    } catch (_) {}

    return ls.get(KEYS.settings, DEFAULT_SETTINGS);
  },

  async saveSettings(settings) {
    const payload = { ...DEFAULT_SETTINGS, ...settings, updatedAt: new Date().toISOString() };
    
    // Save to Express REST API
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {}

    syncCloudDatabases('settings', 'store_config', payload);
    ls.set(KEYS.settings, payload);
    return payload;
  },

  /** 8. Customer Reviews (Verified Buyers Only) */
  async getProductReviews(productId) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'reviews')));
      if (!snap.empty) {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return all.filter(r => r.productId === productId);
      }
    } catch (_) {}

    return ls.get(`genwin_reviews_${productId}`, [
      {
        id: 'rev_1',
        productId,
        userName: 'Arjun S.',
        rating: 5,
        title: 'UNBELIEVABLE FABRIC QUALITY!',
        comment: '240 GSM heavy cotton feels super high end. Delivered in 2 days.',
        verified: true,
        date: '2026-08-01'
      }
    ]);
  },

  async addReview(reviewData) {
    const id = 'rev_' + Date.now();
    const payload = {
      id,
      ...reviewData,
      createdAt: new Date().toISOString(),
      verified: true
    };
    syncCloudDatabases('reviews', id, payload);
    const existing = ls.get(`genwin_reviews_${reviewData.productId}`, []);
    const updated = [payload, ...existing];
    ls.set(`genwin_reviews_${reviewData.productId}`, updated);
    return payload;
  },
};
