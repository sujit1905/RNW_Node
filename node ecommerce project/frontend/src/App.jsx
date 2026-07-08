import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import UserDashboardPage from './pages/UserDashboardPage';
import WishlistPage from './pages/WishlistPage';
import { useEffect, useState } from 'react';
import { WishlistProvider } from './context/WishlistContext';
import { useAuth } from './context/AuthContext';
import Preloader from './components/Preloader';
import Loader from './components/Loader';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfileEditPage from './pages/ProfileEditPage';
import AddressManagePage from './pages/AddressManagePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (!loading && user?.role === 'admin' && pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
}

function Layout({ children }) {
  const { pathname } = useLocation();
  const hideLayout = pathname === '/admin' || pathname === '/login' || pathname === '/register';
  
  return (
    <>
      {!hideLayout && <Navbar />}
      <main className={hideLayout ? '' : 'pb-16 md:pb-0'}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  const { loading: authLoading } = useAuth();
  const isHomepage = window.location.pathname === '/';

  return (
    <>
      {isHomepage ? (
        <Preloader isLoading={authLoading} />
      ) : (
        authLoading && <Loader fullPage dark size="lg" text="Loading VELURA..." />
      )}

      <Router>
        <ScrollToTop />
        <CartProvider>
          <WishlistProvider>
            <AdminGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile/edit" element={<ProfileEditPage />} />
                  <Route path="/profile/address" element={<AddressManagePage />} />
                </Routes>
              </Layout>
            </AdminGuard>
          </WishlistProvider>
        </CartProvider>
      </Router>
    </>
  );
}

export default App;
