import { Link, useLocation } from './navigation';
import { useAuth } from './contexts/AuthContext';
import { Apple, Leaf, Phone, Mail, LogIn, LogOut, User, ShoppingCart, LayoutDashboard, Package, Home, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FruitCollectionPage from './pages/FruitCollectionPage';
import BulkOrderPage from './pages/BulkOrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { LocalDB } from './utils/localStorageDB';

export default function App() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = LocalDB.getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/collection', label: 'Fruits', icon: <Leaf className="w-4 h-4" /> },
    ...(isAuthenticated
      ? [
          { to: '/orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
        ]
      : []),
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-4 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="bg-white rounded-xl overflow-hidden shadow-md w-12 h-12 flex items-center justify-center">
                <img src="/fruits/logo_mkv.png" alt="MKV Fruits" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">MKV fruits</h1>
                <p className="text-orange-100 text-xs text-nowrap">रोज़ ताज़ा फल • Daily Fresh</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white'
                      : 'text-orange-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {/* Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-orange-400">
                  <span className="text-sm text-orange-100 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2 rounded-xl text-sm font-bold transition-all ml-2 shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-2 relative ${
                  isActive('/cart')
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-orange-600 hover:bg-orange-50'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-orange-500 shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-orange-400 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to) ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-orange-200">
                    Signed in as {user?.name}
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 w-full text-left justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Cart
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 w-full text-left justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Cart
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2.5 rounded-xl text-sm font-bold"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Routes Replacement */}
      <main>
        {location.pathname === '/' && <HomePage />}
        {location.pathname === '/login' && <LoginPage />}
        {location.pathname === '/register' && <RegisterPage />}
        {location.pathname === '/collection' && <FruitCollectionPage />}
        {location.pathname === '/cart' && <CartPage />}
        {location.pathname === '/checkout' && <CheckoutPage />}
        {location.pathname.startsWith('/product/') && <ProductDetailsPage />}
        {location.pathname === '/bulk-order' && <BulkOrderPage />}
        {location.pathname === '/orders' && <OrderHistoryPage />}
        {location.pathname === '/admin' && <AdminDashboard />}
        {!['/', '/login', '/register', '/collection', '/cart', '/checkout', '/bulk-order', '/orders', '/admin'].includes(location.pathname) && !location.pathname.startsWith('/product/') && <HomePage />}
      </main>

      {/* Footer */}
      <footer className="bg-orange-900 text-orange-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-xl font-bold mb-2">Open Daily: 6:00 AM - 9:00 PM</p>
            <p className="text-sm text-orange-300">Serving fresh fruits to the community since 1985</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t border-orange-700">
            <a href="tel:+918438487646" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">+91 84384 87646</span>
            </a>
            <span className="hidden md:inline text-orange-700">|</span>
            <a href="mailto:naveeniyyappan2709@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
              <span>naveeniyyappan2709@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
