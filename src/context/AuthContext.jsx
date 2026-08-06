import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext();
const LOCAL_USER_KEY     = 'genwin_user';
const LOCAL_WISHLIST_KEY = 'genwin_wishlist';

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem(LOCAL_USER_KEY); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { const s = localStorage.getItem(LOCAL_WISHLIST_KEY); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    else       localStorage.removeItem(LOCAL_USER_KEY);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // ── Email/Password Login via Firebase Auth ────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) throw new Error('EMAIL AND PASSWORD ARE REQUIRED.');
      if (password.length < 4)  throw new Error('PASSWORD TOO SHORT.');

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const loggedUser = {
          uid: firebaseUser.uid,
          name: (firebaseUser.displayName || email.split('@')[0]).toUpperCase(),
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || '+91 9876543210',
          role: 'customer',
          addresses: [],
        };
        setUser(loggedUser);
        return { success: true, user: loggedUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── Phone Number Sign-In Provider ─────────────────────────────────────
  const loginWithPhone = async (phone, name = '') => {
    setLoading(true);
    try {
      const cleanDigits = (phone || '').replace(/\D/g, '');
      if (cleanDigits.length < 10) throw new Error('PLEASE ENTER A VALID 10-DIGIT MOBILE NUMBER.');
      const formattedPhone = `+91 ${cleanDigits.slice(-10)}`;
      const phoneUser = {
        uid: 'phone_' + cleanDigits.slice(-10),
        name: (name || `CUSTOMER (${cleanDigits.slice(-4)})`).trim().toUpperCase(),
        email: `${cleanDigits.slice(-10)}@genwin-customer.com`,
        phone: formattedPhone,
        role: 'customer',
        addresses: [],
      };
      setUser(phoneUser);
      return { success: true, user: phoneUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const googleUser = {
        uid: fbUser.uid,
        name: (fbUser.displayName || fbUser.email.split('@')[0]).toUpperCase(),
        email: fbUser.email,
        photoURL: fbUser.photoURL || '',
        phone: fbUser.phoneNumber || '',
        role: 'customer',
        addresses: [],
      };
      setUser(googleUser);
      return { success: true, user: googleUser };
    } catch (err) {
      console.error('Google sign-in error:', err);
      return { success: false, error: 'GOOGLE LOGIN FAILED: ' + err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── Email/Password Register via Firebase Auth ─────────────────────────────
  const register = async (email, password, name, phone) => {
    setLoading(true);
    try {
      if (!email || !password || !name) throw new Error('NAME, EMAIL & PASSWORD ARE REQUIRED.');
      if (password.length < 6) throw new Error('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const newUser = {
          uid: fbUser.uid,
          name: name.trim().toUpperCase(),
          email: fbUser.email,
          phone: phone || '',
          role: 'customer',
          addresses: [],
        };
        setUser(newUser);
        return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ── Full Address Book Management ──────────────────────────────────────────
  const addAddress = (newAddr) => {
    if (!user) return;
    const isFirst = !user.addresses || user.addresses.length === 0;
    const addrObj = {
      id: 'addr_' + Date.now(),
      isDefault: isFirst,
      ...newAddr
    };
    const updatedUser = { ...user, addresses: [...(user.addresses || []), addrObj] };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
  };

  const updateAddress = (id, updatedFields) => {
    if (!user) return;
    const updatedList = (user.addresses || []).map(a => a.id === id ? { ...a, ...updatedFields } : a);
    const updatedUser = { ...user, addresses: updatedList };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
  };

  const deleteAddress = (id) => {
    if (!user) return;
    const filteredList = (user.addresses || []).filter(a => a.id !== id);
    const updatedUser = { ...user, addresses: filteredList };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
  };

  const setDefaultAddress = (id) => {
    if (!user) return;
    const updatedList = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
    const updatedUser = { ...user, addresses: updatedList };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, register, loginWithGoogle, loginWithPhone, loading, wishlist, toggleWishlist,
      isLoginOpen, setIsLoginOpen,
      addAddress, updateAddress, deleteAddress, setDefaultAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => {},
      logout: () => {},
      register: async () => {},
      loginWithGoogle: async () => {},
      loading: false,
      wishlist: [],
      toggleWishlist: () => {},
      addAddress: () => {},
      updateAddress: () => {},
      deleteAddress: () => {},
      setDefaultAddress: () => {}
    };
  }
  return context;
};
