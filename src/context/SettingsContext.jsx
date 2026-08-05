import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';

const SettingsContext = createContext();
const LOCAL_SETTINGS_KEY = 'genwin_settings';

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

export const SettingsProvider = ({ children }) => {
  // Read saved settings from LocalStorage instantly on mount to prevent revert on refresh
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(LOCAL_SETTINGS_KEY);
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch (_) {
      return DEFAULT_SETTINGS;
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await FirebaseService.getSettings();
      if (data) {
        const merged = { ...DEFAULT_SETTINGS, ...data };
        setSettings(merged);
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateSettingsLocally = (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
    } catch (_) {}
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettingsLocally, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      updateSettingsLocally: () => {},
      fetchSettings: async () => {},
      loading: false
    };
  }
  return context;
};
