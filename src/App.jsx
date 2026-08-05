import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

import Navbar      from './components/layout/Navbar';
import Footer      from './components/layout/Footer';
import CartDrawer  from './components/cart/CartDrawer';

import Home              from './pages/Home';
import Shop              from './pages/Shop';
import ProductDetail      from './pages/ProductDetail';
import Customizer        from './pages/Customizer';
import Checkout          from './pages/Checkout';
import OrderTracker      from './pages/OrderTracker';
import Account           from './pages/Account';
import Login             from './pages/Login';
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminLoginPage    from './pages/admin/AdminLoginPage';
import EmployeeLoginPage from './pages/admin/EmployeeLoginPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import { AdminProtectedRoute, EmployeeProtectedRoute, CustomerProtectedRoute } from './components/auth/ProtectedRoutes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Storefront error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-6 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center font-bold text-xl mb-2">
            !
          </div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight">STORE SESSION RECOVERED</h1>
          <p className="text-xs text-zinc-400 max-w-md uppercase leading-relaxed">
            A TEMPORARY DISPLAY STATE WAS DETECTED. TAP BELOW TO REFRESH YOUR SESSION.
          </p>
          {this.state.error && (
            <div className="bg-red-950/80 border border-red-800 p-3 max-w-md text-[10px] text-red-300 font-mono text-left overflow-x-auto">
              <strong className="block text-red-400 uppercase font-bold mb-1">DIAGNOSTIC ERROR DETAILS:</strong>
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="px-8 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            RELOAD STOREFRONT →
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center space-y-5 px-4">
      <p className="text-8xl font-display font-extrabold text-zinc-100">404</p>
      <h1 className="font-bold text-2xl uppercase tracking-tighter text-black">PAGE NOT FOUND</h1>
      <p className="text-xs text-zinc-400 uppercase">THE PAGE YOU WERE LOOKING FOR DOESN'T EXIST.</p>
      <Link to="/" className="px-8 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
        RETURN HOME
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Routes>
              {/* Standalone Login Portals (Clean layout without storefront Navbar & Footer) */}
              <Route path="/admin/login"    element={<AdminLoginPage />} />
              <Route path="/employee/login" element={<EmployeeLoginPage />} />
              <Route path="/login"          element={<Login />} />

              {/* Protected Admin Console Route */}
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* Protected Employee Workspace Route */}
              <Route
                path="/employee/*"
                element={
                  <EmployeeProtectedRoute>
                    <EmployeeDashboard />
                  </EmployeeProtectedRoute>
                }
              />

              {/* Storefront routes (with storefront Navbar and Footer) */}
              <Route
                path="*"
                element={
                  <div className="min-h-[100dvh] w-full relative overflow-x-hidden flex flex-col bg-white text-zinc-900">
                    <Navbar />
                    <CartDrawer />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/"                        element={<Home />} />
                        <Route path="/shop"                    element={<Shop />} />
                        <Route path="/product/:slug"           element={<ProductDetail />} />
                        <Route path="/customize/:productId"    element={<Customizer />} />
                        <Route path="/checkout"                element={<Checkout />} />
                        <Route path="/order-success/:orderId"  element={<OrderTracker />} />
                        <Route
                          path="/account"
                          element={
                            <CustomerProtectedRoute>
                              <Account />
                            </CustomerProtectedRoute>
                          }
                        />
                        <Route path="*"                        element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
