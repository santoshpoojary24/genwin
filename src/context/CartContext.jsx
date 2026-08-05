import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';

const CartContext = createContext();

const LOCAL_CART_KEY = 'genwin_cart_items';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Default', quantity = 1, customization = null) => {
    if (!product) return;
    const colorStr = typeof selectedColor === 'object' && selectedColor !== null
      ? (selectedColor.name || 'Default')
      : (selectedColor || 'Default');
    const sizeStr = selectedSize || product.sizes?.[0] || 'M';
    const cartItemId = `${product.id}_${sizeStr}_${colorStr}_${customization?.id || 'standard'}`;
    
    // Calculate price
    const basePrice = product.discountPrice || product.basePrice || 999;
    const extraCustomFee = customization ? (product.customizationFee || 150) : 0;
    const finalUnitPrice = basePrice + extraCustomFee;

    const validQty = Math.max(1, parseInt(quantity) || 1);
    const validUnitPrice = isNaN(finalUnitPrice) || finalUnitPrice <= 0 ? (basePrice || 999) : finalUnitPrice;

    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: (item.quantity || 1) + validQty }
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
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
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
