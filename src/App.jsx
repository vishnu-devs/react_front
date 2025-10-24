import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated, getUserRole } from './utils/auth';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import ErrorLogs from './pages/ErrorLogs';
import VendorProducts from './pages/VendorProducts';
import VendorRequestForm from './pages/VendorRequestForm';
import CreateProduct from './pages/CreateProduct';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import VendorOrders from './pages/VendorOrders';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        if (auth) {
          const role = await getUserRole();
          setUserRole(role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        {!loading && (
          <>
            <Header setIsAuth={setIsAuth} userRole={userRole} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
            <Route
              path="/login"
              element={
                isAuth ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login setIsAuth={setIsAuth} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuth ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register setIsAuth={setIsAuth} />
                )
              }
            />
            <Route
              path="/products"
              element={
                isAuth ? (
                  <Products />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/product/:id"
              element={
                isAuth ? (
                  <ProductDetail />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/orders"
              element={
                isAuth ? (
                  <Orders />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/cart"
              element={
                isAuth ? (
                  <Cart />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/error-logs"
              element={
                isAuth ? (
                  <ErrorLogs />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuth ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/vendor-request"
              element={
                isAuth ? (
                  userRole === 'vendor' ? (
                    <Navigate to="/vendor-products" replace />
                  ) : (
                    <VendorRequestForm />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/vendor-products"
              element={
                isAuth ? (
                  <VendorProducts />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/vendor-orders"
              element={
                isAuth && userRole === 'vendor' ? (
                  <VendorOrders />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/wishlist"
              element={
                isAuth ? (
                  <Wishlist />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/create-product"
              element={
                isAuth && userRole === 'vendor' ? (
                  <CreateProduct />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuth ? (
                  <Products />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
