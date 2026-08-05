export const INITIAL_PRODUCTS = [
  {
    id: 'prod_custom_tee_1',
    name: 'CUSTOM DTG GRAPHIC OVERSIZED TEE',
    slug: 'custom-dtg-graphic-oversized-tee',
    category: 't-shirts',
    basePrice: 1299,
    discountPrice: 999,
    stockQty: 45,
    isCustomizable: true,
    isNew: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 128,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
    ],
    description: 'Heavyweight 240 GSM 100% combed organic cotton. Drop-shoulder relaxed fit with ultra-high definition Direct-To-Garment (DTG) print canvas.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Washed Off-White', hex: '#F5F5F0' },
      { name: 'Asphalt Grey', hex: '#333333' }
    ]
  },
  {
    id: 'prod_hoodie_heavy_1',
    name: '400 GSM ARCHIVAL FLEECE HOODIE',
    slug: '400-gsm-archival-fleece-hoodie',
    category: 'hoodies',
    basePrice: 2999,
    discountPrice: 2499,
    stockQty: 20,
    isCustomizable: true,
    isNew: false,
    isBestseller: true,
    rating: 5.0,
    reviewCount: 94,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80'
    ],
    description: 'Ultra-heavy 400 GSM French Terry cotton fleece. Double-lined hood, seamless side panels, and distressed vintage enzyme wash.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Black', hex: '#0a0a0a' },
      { name: 'Charcoal Wash', hex: '#262626' }
    ]
  },
  {
    id: 'prod_jacket_denim_1',
    name: 'TACTICAL OVERSIZED DENIM JACKET',
    slug: 'tactical-oversized-denim-jacket',
    category: 'jackets',
    basePrice: 4499,
    discountPrice: 3499,
    stockQty: 12,
    isCustomizable: false,
    isNew: true,
    isBestseller: false,
    rating: 4.8,
    reviewCount: 36,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'
    ],
    description: '14oz rigid selvedge denim. Boxy tactical silhouette with dual flap pockets, metal hardware, and heavy enzyme stone-wash finish.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Acid Wash Black', hex: '#1c1c1c' }
    ]
  },
  {
    id: 'prod_cap_street_1',
    name: 'EMBROIDERED ARCHIVAL DAD CAP',
    slug: 'embroidered-archival-dad-cap',
    category: 'accessories',
    basePrice: 899,
    discountPrice: 699,
    stockQty: 60,
    isCustomizable: false,
    isNew: false,
    isBestseller: true,
    rating: 4.7,
    reviewCount: 52,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'
    ],
    description: 'Unstructured 6-panel cotton twill cap. High-density embroidered logo front badge with adjustable antique brass buckle strap.',
    sizes: ['ONE SIZE'],
    colors: [
      { name: 'Midnight Black', hex: '#050505' }
    ]
  }
];

export const INITIAL_CATEGORIES = [
  {
    id: 'cat_tshirts',
    name: 'Oversized T-Shirts',
    slug: 't-shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    description: '240 GSM heavy combed cotton graphic tees.',
    isFeatured: true
  },
  {
    id: 'cat_hoodies',
    name: 'Heavyweight Hoodies',
    slug: 'hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    description: '400 GSM fleece drop-shoulder hoodies.',
    isFeatured: true
  },
  {
    id: 'cat_jackets',
    name: 'Jackets & Outerwear',
    slug: 'jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    description: 'Tactical outerwear and oversized denim jackets.',
    isFeatured: true
  },
  {
    id: 'cat_accessories',
    name: 'Accessories & Caps',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    description: 'Embroidered dad caps, socks, and street accessories.',
    isFeatured: false
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: 'emp_1',
    employeeId: 'EMP-4092',
    name: 'Rahul Sharma',
    email: 'staff@genwin.studio',
    department: 'fulfillment',
    role: 'FULFILLMENT AGENT',
    phone: '+91 98765 11223',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    active: true
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
    active: true
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
    active: true
  }
];

export const INITIAL_COUPONS = [
  {
    id: 'cpn_1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 499,
    maxUses: 1000,
    usedCount: 142,
    expiresAt: '2026-12-31',
    active: true
  },
  {
    id: 'cpn_2',
    code: 'GENWIN20',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 999,
    maxUses: 500,
    usedCount: 88,
    expiresAt: '2026-12-31',
    active: true
  }
];

export const INITIAL_SETTINGS = {
  storeName: 'जेनwin.clothing',
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
  whatsapp: '+91 98765 43210'
};
