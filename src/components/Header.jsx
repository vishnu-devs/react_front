import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaHeart } from 'react-icons/fa';
import { BiChevronDown } from 'react-icons/bi';
import { logout, isAuthenticated, getUserRole } from '../utils/auth';
import { getCartCount } from '../utils/cart';

export default function Header({ setIsAuth, userRole }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsLoggedIn(authStatus);
    };
    checkAuth();
  }, [userRole]);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  

  const handleLogout = async () => {
    await logout();
    setIsAuth(false);
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="bg-blue-500 text-white">
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 justify-between">
          {/* Logo and Search */}
          <div className="flex items-center flex-1 max-w-4xl">
            <Link to="/" className="text-2xl font-bold mr-8 whitespace-nowrap">
              B2B Platform
            </Link>
            <div className="hidden md:flex flex-1 relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full py-2 px-4 pr-10 rounded-sm text-gray-800 focus:outline-none"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-gray-600">
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {/* Become a Vendor Link */}
                {userRole !== 'vendor' && (
                  <Link
                    to="/vendor-request"
                    className="hover:text-blue-100 whitespace-nowrap"
                  >
                    Become a Vendor
                  </Link>
                )}


                {/* Orders Link */}
                <Link to="/orders" className="hover:text-blue-100 whitespace-nowrap">
                  Orders
                </Link>

                {/* Vendor Products Link */}
                {isLoggedIn && userRole === 'vendor' && (
                  <>
                    <Link
                      to="/vendor-products"
                      className="hover:text-blue-100 whitespace-nowrap"
                    >
                      My Products
                    </Link>
                    <Link
                      to="/vendor-orders"
                      className="hover:text-blue-100 whitespace-nowrap"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/create-product"
                      className="hidden md:block hover:text-blue-100 whitespace-nowrap"
                    >
                      Create Product
                    </Link>
                  </>
                )}

                {/* Wishlist */}
                <Link to="/wishlist" className="hover:text-blue-100">
                  <FaHeart size={20} />
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative hover:text-blue-100">
                  <FaShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <FaUser size={20} />
                    <BiChevronDown size={20} />
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        My Profile
                      </Link>
                      {(userRole === 'admin' || userRole === 'super_admin') && (
                        <Link
                          to="/error-logs"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Error Logs
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="hover:text-blue-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      
    </header>
  );
}
