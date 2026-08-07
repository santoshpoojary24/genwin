import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const LOCAL_CART_KEY = 'genwin_cart_items';

export function getProductSizeStock(product, size) {
  if (!product) return 0;

  const isNoSizes = product.hasSizes === false || !product.sizes || product.sizes.length === 0;
  const rawStock = product.stockQty !== undefined && product.stockQty !== null ? parseInt(product.stockQty) : 25;
  const totalStock = isNaN(rawStock) ? 25 : Math.max(0, rawStock);

  if (totalStock <= 0 || product.isSoldOut) return 0;

  // Return full total stock for size-less products (bags, caps, accessories)
  if (isNoSizes) {
    return totalStock;
  }

  const sizeStr = size || 'M';

  if (product.sizeQuantities && product.sizeQuantities[sizeStr] !== undefined && product.sizeQuantities[sizeStr] !== null) {
    return Math.max(0, parseInt(product.sizeQuantities[sizeStr]) || 0);
  }

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  return Math.max(0, Math.floor(totalStock / sizes.length));
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Sync cart items to Firestore
  const syncCartToCloud = async (items) => {
    if (!user || !user.uid) return;
    try {
      await setDoc(doc(db, 'carts', user.uid), { items }, { merge: true });
    } catch (err) {
      console.error('Failed to sync cart to Firestore:', err);
    }
  };

  // Sync cart from Firestore when user changes/logs in
  useEffect(() => {
    if (!user || !user.uid) return;

    const loadCloudCart = async () => {
      try {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          const cloudItems = cartSnap.data().items || [];
          setCartItems(prev => {
            const merged = [...cloudItems];
            prev.forEach(localItem => {
              const match = merged.find(c => c.cartItemId === localItem.cartItemId);
              if (match) {
                match.quantity = Math.max(match.quantity, localItem.quantity);
              } else {
                merged.push(localItem);
              }
            });
            // Update cloud with merged version
            setDoc(doc(db, 'carts', user.uid), { items: merged }, { merge: true }).catch(() => {});
            return merged;
          });
        } else {
          if (cartItems.length > 0) {
            await setDoc(cartRef, { items: cartItems });
          }
        }
      } catch (err) {
        console.error('Error loading cloud cart:', err);
      }
    };

    loadCloudCart();
  }, [user]);

  // Sync local cart to LocalStorage and Cloud when cartItems or user changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn('LocalStorage quota exceeded. Cart items synced to cloud.', err);
    }
    if (user && user.uid) {
      syncCartToCloud(cartItems);
    }
  }, [cartItems, user]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Default', quantity = 1, customization = null) => {
    if (!product) return;

    const sizeStr = selectedSize || product.sizes?.[0] || 'M';
    const sizeStockLimit = getProductSizeStock(product, sizeStr);

    if (sizeStockLimit <= 0 || product.isSoldOut) {
      alert(`Sorry! Size ${sizeStr} for this garment is currently sold out.`);
      return;
    }

    const colorStr = typeof selectedColor === 'object' && selectedColor !== null
      ? (selectedColor.name || 'Default')
      : (selectedColor || 'Default');
    const cartItemId = `${product.id}_${sizeStr}_${colorStr}_${customization?.id || 'standard'}`;
    
    // Calculate price
    const basePrice = product.discountPrice || product.basePrice || 999;
    const extraCustomFee = customization ? (product.customizationFee || 150) : 0;
    const finalUnitPrice = basePrice + extraCustomFee;

    const requestedQty = Math.max(1, parseInt(quantity) || 1);
    const validQty = Math.min(sizeStockLimit, requestedQty);
    const validUnitPrice = isNaN(finalUnitPrice) || finalUnitPrice <= 0 ? (basePrice || 999) : finalUnitPrice;

    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        const combinedQty = Math.min(sizeStockLimit, (existing.quantity || 1) + validQty);
        if ((existing.quantity || 1) + validQty > sizeStockLimit) {
          alert(`Only ${sizeStockLimit} left in stock for size ${sizeStr}.`);
        }
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: combinedQty, stockQty: sizeStockLimit }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name || 'Garment Item',
          slug: product.slug || product.id,
          image: customization?.previewUrl || product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
          size: sizeStr,
          color: colorStr,
          unitPrice: validUnitPrice,
          basePrice,
          customizationFee: extraCustomFee,
          quantity: validQty,
          stockQty: sizeStockLimit,
          customization,
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const maxAllowed = item.stockQty !== undefined ? item.stockQty : 999;
          if (newQty > maxAllowed) {
            alert(`Only ${maxAllowed} left in stock for size ${item.size}.`);
          }
          const cappedQty = Math.min(maxAllowed, newQty);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const applyCoupon = async (code) => {
    const subtotal = getSubtotal();
    const result = await FirebaseService.validateCoupon(code, subtotal);
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discount);
    }
    return result;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const getShippingFee = () => {
    const subtotal = getSubtotal();
    if (subtotal >= 1499 || cartItems.length === 0) return 0;
    return 99; // Standard flat shipping
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = getShippingFee();
    return Math.max(0, subtotal + shipping - discountAmount);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      getSubtotal,
      getShippingFee,
      getTotal,
      appliedCoupon,
      discountAmount,
      applyCoupon,
      removeCoupon,
      totalCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      isCartOpen: false,
      setIsCartOpen: () => {},
      getSubtotal: () => 0,
      getShippingFee: () => 0,
      getTotal: () => 0,
      appliedCoupon: null,
      discountAmount: 0,
      applyCoupon: async () => ({ valid: false }),
      removeCoupon: () => {},
      totalCount: 0
    };
  }
  return context;
};
