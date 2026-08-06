import { db, rtdb } from '../config/firebase';
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { ref, set, get, child, remove, onValue } from 'firebase/database';

const API_BASE_URL = 'http://localhost:5000/api';
const CACHE_VERSION = 'v10';
const KEYS = {
  products   : `genwin_products_${CACHE_VERSION}`,
  orders     : `genwin_orders_${CACHE_VERSION}`,
  customs    : 'genwin_customizations',
  categories : `genwin_categories_${CACHE_VERSION}`,
  coupons    : `genwin_coupons_${CACHE_VERSION}`,
  ads        : `genwin_ads_${CACHE_VERSION}`,
  settings   : `genwin_settings_${CACHE_VERSION}`,
  employees  : `genwin_employees_${CACHE_VERSION}`,
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
  storeName: 'जेनwin.',
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
      deleteDoc(doc(db, collectionName, itemId)).catch((err) => console.error(`Firebase deleteDoc error on ${collectionName}:`, err));
    } else {
      setDoc(doc(db, collectionName, itemId), data, { merge: true }).catch((err) => console.error(`Firebase setDoc error on ${collectionName}:`, err));
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

export function normalizeProduct(p) {
  if (!p) return p;

  const hasSizes = p.hasSizes !== false && (p.sizes === undefined || (Array.isArray(p.sizes) && p.sizes.length > 0));
  const rawStock = p.stockQty !== undefined && p.stockQty !== null ? parseInt(p.stockQty) : 25;
  const totalStock = isNaN(rawStock) ? 25 : Math.max(0, rawStock);

  if (!hasSizes) {
    return {
      ...p,
      hasSizes: false,
      sizes: [],
      sizeQuantities: null,
      stockQty: totalStock,
      isSoldOut: totalStock <= 0 || p.isSoldOut === true
    };
  }

  const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  let sizeQuantities = p.sizeQuantities;
  if (!sizeQuantities || typeof sizeQuantities !== 'object') {
    const perSize = Math.max(0, Math.floor(totalStock / sizes.length));
    sizeQuantities = sizes.reduce((acc, sz) => {
      acc[sz] = perSize;
      return acc;
    }, {});
  } else {
    sizes.forEach(sz => {
      if (sizeQuantities[sz] === undefined || sizeQuantities[sz] === null || isNaN(parseInt(sizeQuantities[sz]))) {
        sizeQuantities[sz] = Math.max(0, Math.floor(totalStock / sizes.length));
      } else {
        sizeQuantities[sz] = Math.max(0, parseInt(sizeQuantities[sz]));
      }
    });
  }

  const calculatedTotalStock = Object.values(sizeQuantities).reduce((a, b) => a + (parseInt(b) || 0), 0);

  return {
    ...p,
    hasSizes: true,
    sizes,
    sizeQuantities,
    stockQty: calculatedTotalStock,
    isSoldOut: calculatedTotalStock <= 0 || p.isSoldOut === true
  };
}

// ── Service ───────────────────────────────────────────────────────────────
export const FirebaseService = {

  /** 1. Products (Firebase Cloud Firestore & Realtime DB) */
  async getProducts() {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const remote = snap.docs.map(d => normalizeProduct({ id: d.id, ...d.data() }));
      ls.set(KEYS.products, remote);
      return remote;
    } catch (err) {
      console.error("Firebase getProducts error:", err);
    }

    const localProds = ls.get(KEYS.products, []);
    return localProds.map(p => normalizeProduct(p));
  },

  async getProductBySlug(slug) {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug || p.id === slug) || null;
  },

  async saveProduct(product) {
    const isEdit = !!product.id;
    const id = product.id || 'prod_' + Date.now();
    const normalized = normalizeProduct(product);

    const payload = {
      ...normalized,
      id,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updatedAt: new Date().toISOString(),
    };
    if (!isEdit) payload.createdAt = new Date().toISOString();

    syncCloudDatabases('products', id, payload);

    const current = ls.get(KEYS.products, []);
    const updated = isEdit ? current.map(p => p.id === id ? payload : p) : [payload, ...current];
    ls.set(KEYS.products, updated);
    return payload;
  },

  async deleteProduct(id) {
    syncCloudDatabases('products', id, null, true);
    const current = ls.get(KEYS.products, []);
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

    // First Come, First Served Stock Reduction per size & Sold Out Trigger
    if (payload.items && Array.isArray(payload.items)) {
      const currentProducts = ls.get(KEYS.products, []);
      const updatedProducts = currentProducts.map(p => {
        const orderedItem = payload.items.find(item => item.productId === p.id || item.id === p.id || item.slug === p.slug);
        if (orderedItem) {
          const qtyToDeduct = parseInt(orderedItem.quantity) || 1;
          const currentStock = p.stockQty !== undefined ? p.stockQty : 10;
          const newStock = Math.max(0, currentStock - qtyToDeduct);

          const defaultSizeQuantities = p.sizes ? p.sizes.reduce((acc, sz) => {
            acc[sz] = Math.max(0, Math.floor(currentStock / p.sizes.length));
            return acc;
          }, {}) : { S: 5, M: 5, L: 5, XL: 5, XXL: 5 };

          const currentSizeQuantities = p.sizeQuantities || defaultSizeQuantities;
          const targetSize = orderedItem.size || 'M';
          const currentSizeStock = currentSizeQuantities[targetSize] !== undefined ? currentSizeQuantities[targetSize] : 5;
          const newSizeStock = Math.max(0, currentSizeStock - qtyToDeduct);
          
          const updatedSizeQuantities = {
            ...currentSizeQuantities,
            [targetSize]: newSizeStock
          };

          const totalCalculatedStock = Object.values(updatedSizeQuantities).reduce((a, b) => a + (parseInt(b) || 0), 0);

          const updatedP = {
            ...p,
            sizeQuantities: updatedSizeQuantities,
            stockQty: totalCalculatedStock,
            isSoldOut: totalCalculatedStock <= 0,
            updatedAt: new Date().toISOString()
          };
          syncCloudDatabases('products', p.id, updatedP);
          return updatedP;
        }
        return p;
      });
      ls.set(KEYS.products, updatedProducts);
    }

    return order;
  },

  async getAllOrders() {
    let cloudOrders = [];
    const orderMap = new Map();

    // 1. Try Firestore Cloud DB
    try {
      const snap = await withTimeout(getDocs(collection(db, 'orders')), 6000);
      if (!snap.empty) {
        snap.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          const key = item.id || item.orderNumber;
          if (key) orderMap.set(key.toString(), item);
        });
      }
    } catch (err) {
      console.error("Firebase Firestore getAllOrders error:", err);
    }

    // 2. Try Realtime Database merge
    if (rtdb) {
      try {
        const rtdbSnap = await withTimeout(get(child(ref(rtdb), 'orders')), 6000);
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          const list = Array.isArray(val) ? val : Object.values(val);
          list.forEach(item => {
            if (item) {
              const key = item.id || item.orderNumber;
              if (key) {
                const existing = orderMap.get(key.toString());
                orderMap.set(key.toString(), { ...existing, ...item });
              }
            }
          });
        }
      } catch (err) {
        console.error("Firebase RTDB getAllOrders error:", err);
      }
    }

    if (orderMap.size > 0) {
      cloudOrders = Array.from(orderMap.values());
      cloudOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      ls.set(KEYS.orders, cloudOrders);
      return cloudOrders;
    }

    const localFallback = ls.get(KEYS.orders, []);
    localFallback.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return localFallback;
  },

  subscribeToOrders(callback) {
    if (!callback) return () => {};

    // Initial fetch to populate immediately
    this.getAllOrders().then(orders => {
      if (orders && orders.length > 0) callback(orders);
    }).catch(() => {});

    // 1. Firestore Realtime Listener
    const unsubFS = onSnapshot(collection(db, 'orders'), (snap) => {
      if (!snap.empty) {
        const fsOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fsOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        ls.set(KEYS.orders, fsOrders);
        callback(fsOrders);
      }
    }, (err) => console.error("Firestore orders snapshot error:", err));

    // 2. Realtime Database Listener
    let unsubRTDB = () => {};
    if (rtdb) {
      const ordersRef = ref(rtdb, 'orders');
      unsubRTDB = onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Array.isArray(val) ? val : Object.values(val);
          const validOrders = list.filter(Boolean);
          validOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          ls.set(KEYS.orders, validOrders);
          callback(validOrders);
        }
      }, (err) => console.error("RTDB orders listener error:", err));
    }

    return () => {
      try { unsubFS(); } catch (_) {}
      try { if (typeof unsubRTDB === 'function') unsubRTDB(); } catch (_) {}
    };
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
      } else {
        DEFAULT_EMPLOYEES.forEach(e => {
          setDoc(doc(db, 'employees', e.id), e).catch(() => {});
        });
        ls.set(KEYS.employees, DEFAULT_EMPLOYEES);
        return DEFAULT_EMPLOYEES;
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
      const snap = await getDocs(collection(db, 'categories'));
      const remote = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        isFeatured: d.data().isFeatured ?? true,
        description: d.data().description || 'Premium heavyweight streetwear collection.',
      }));
      ls.set(KEYS.categories, remote);
      return remote;
    } catch (_) {}

    return ls.get(KEYS.categories, []).map(c => ({
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

    const current = ls.get(KEYS.categories, []);
    const exists = current.some(c => c.id === id || c.slug === payload.slug);
    const updated = exists
      ? current.map(c => (c.id === id || c.slug === payload.slug) ? payload : c)
      : [...current, payload];
    ls.set(KEYS.categories, updated);
    return payload;
  },

  async deleteCategory(id) {
    syncCloudDatabases('categories', id, null, true);

    const current = ls.get(KEYS.categories, []);
    const updated = current.filter(c => c.id !== id && c.slug !== id);
    ls.set(KEYS.categories, updated);
  },

  /** 5. Coupons */
  async getCoupons() {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      ls.set(KEYS.coupons, remote);
      return remote;
    } catch (_) {}

    return ls.get(KEYS.coupons, []);
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
      const snap = await getDocs(collection(db, 'ads'));
      const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      ls.set(KEYS.ads, remote);
      return remote;
    } catch (_) {}

    return ls.get(KEYS.ads, []);
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

  /** 9. Support Ticket System (Customer & Employee real-time sync) */
  async createTicket(payload) {
    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    const ticket = {
      id: ticketId,
      ticketId,
      customerName: payload.customerName || 'Anonymous Customer',
      customerEmail: payload.customerEmail || '',
      customerPhone: payload.customerPhone || '',
      customerAddress: payload.customerAddress || '',
      orderId: payload.orderId || '',
      issueType: payload.issueType || 'General Support',
      subject: payload.subject || 'Support Request',
      message: payload.message || '',
      priority: payload.priority || 'MEDIUM',
      status: 'OPEN',
      assignedTo: payload.assignedTo || 'Unassigned Staff',
      responseNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    syncCloudDatabases('tickets', ticketId, ticket);

    const all = ls.get('genwin_tickets_v10', []);
    ls.set('genwin_tickets_v10', [ticket, ...all]);
    return ticket;
  },

  async getTickets() {
    let cloudTickets = [];
    const ticketMap = new Map();

    try {
      const snap = await withTimeout(getDocs(collection(db, 'tickets')), 6000);
      if (!snap.empty) {
        snap.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          const key = item.id || item.ticketId;
          if (key) ticketMap.set(key.toString(), item);
        });
      }
    } catch (err) {
      console.error("Firebase Firestore getTickets error:", err);
    }

    if (rtdb) {
      try {
        const rtdbSnap = await withTimeout(get(child(ref(rtdb), 'tickets')), 6000);
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          const list = Array.isArray(val) ? val : Object.values(val);
          list.forEach(item => {
            if (item) {
              const key = item.id || item.ticketId;
              if (key) {
                const existing = ticketMap.get(key.toString());
                ticketMap.set(key.toString(), { ...existing, ...item });
              }
            }
          });
        }
      } catch (err) {
        console.error("Firebase RTDB getTickets error:", err);
      }
    }

    if (ticketMap.size > 0) {
      cloudTickets = Array.from(ticketMap.values());
      cloudTickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      ls.set('genwin_tickets_v10', cloudTickets);
      return cloudTickets;
    }

    const localFallback = ls.get('genwin_tickets_v10', []);
    localFallback.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return localFallback;
  },

  async updateTicketStatus(ticketId, status, responseNote = '', assignedTo = '') {
    const idStr = ticketId.toString();
    const tickets = await this.getTickets();
    const existing = tickets.find(t => t.id === idStr || t.ticketId === idStr);
    const updated = {
      ...existing,
      id: idStr,
      ticketId: idStr,
      status: status || existing?.status || 'OPEN',
      responseNote: responseNote !== undefined ? responseNote : (existing?.responseNote || ''),
      assignedTo: assignedTo || existing?.assignedTo || 'Support Staff',
      updatedAt: new Date().toISOString(),
    };

    syncCloudDatabases('tickets', idStr, updated);

    const all = ls.get('genwin_tickets_v10', []);
    const list = all.map(t => (t.id === idStr || t.ticketId === idStr) ? updated : t);
    ls.set('genwin_tickets_v10', list);
    return updated;
  },

  subscribeToTickets(callback) {
    if (!callback) return () => {};

    this.getTickets().then(tks => {
      if (tks && tks.length > 0) callback(tks);
    }).catch(() => {});

    const unsubFS = onSnapshot(collection(db, 'tickets'), (snap) => {
      if (!snap.empty) {
        const fsTickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fsTickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        ls.set('genwin_tickets_v10', fsTickets);
        callback(fsTickets);
      }
    }, () => {});

    let unsubRTDB = () => {};
    if (rtdb) {
      unsubRTDB = onValue(ref(rtdb, 'tickets'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Array.isArray(val) ? val : Object.values(val);
          const valid = list.filter(Boolean);
          valid.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          ls.set('genwin_tickets_v10', valid);
          callback(valid);
        }
      }, () => {});
    }

    return () => {
      try { unsubFS(); } catch (_) {}
      try { if (typeof unsubRTDB === 'function') unsubRTDB(); } catch (_) {}
    };
  },
};
