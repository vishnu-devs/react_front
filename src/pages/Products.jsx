import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/product';
import { addToWishlist, getWishlist } from '../api/wishlist';
import { getUserRole } from '../utils/auth';
import { logError } from '../utils/errorLogger';
import Button from '../components/Button';
import { FaStar, FaShoppingCart, FaHeart, FaBolt, FaTag } from 'react-icons/fa';
import { BiSearch, BiFilterAlt, BiSort } from 'react-icons/bi';
import { MdLocalOffer, MdVerified } from 'react-icons/md';
import { addToCart, setCheckoutItems } from '../utils/cart';
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [canManageProducts, setCanManageProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [buyingNowId, setBuyingNowId] = useState(null);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  // Categories for navigation and filtering
  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books'];

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        setUserRole(role);
        const isVendor = role === 'vendor';
        const isAdmin = role === 'admin';
        const isSuperAdmin = role === 'super_admin';
        setCanManageProducts(isVendor || isAdmin || isSuperAdmin);
      } catch (err) {
        const errorDetails = logError(err, 'Fetching user role');
        setError(errorDetails.message);
      }
    };
    fetchUserRole();
  }, []);
  
  const canEditProduct = (product) => {
    const isAdmin = userRole === 'admin';
    const isSuperAdmin = userRole === 'super_admin';
    const isVendor = userRole === 'vendor';
    
    if (isAdmin || isSuperAdmin) return true;
    if (isVendor) {
      const tokenData = JSON.parse(localStorage.getItem('authToken'));
      const userId = tokenData?.user?.id;
      console.log('Checking product ownership:', {
        productUserId: product.user_id,
        currentUserId: userId,
        isMatch: product.user_id === userId
      });
      return product.user_id === userId;
    }
    return false;
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlist();
        const ids = (res?.data?.data || []).map(p => p.id);
        setWishlistedIds(ids);
      } catch (err) {
        // ignore wishlist prefill errors
      }
    };
    fetchWishlist();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      // console.log('Products response:', response.data);
      setProducts(response.data.data || []);
      setError(null);
    } catch (err) {
      const errorDetails = logError(err, 'Fetching products');
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      // Ensure visual feedback even for fast ops
      await Promise.resolve();
      const stockLeft = Number(product?.stock_left ?? product?.stock_quantity ?? 0);
      if (stockLeft <= 0) {
        return;
      }
      addToCart(product, 1);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      // Brief delay to show loader feedback
      setTimeout(() => setAddingToCartId(null), 400);
    }
  };

  const handleBuyNow = async (product) => {
    try {
      setBuyingNowId(product.id);
      const price = product?.price?.raw ?? product?.price ?? 0;
      // Prefill checkout items for Orders page to read
      const image = product?.images?.main || product?.main_image || product?.image || '';
      setCheckoutItems([{ id: product.id, name: product.name, price, quantity: 1, image }]);
      navigate('/orders');
    } catch (err) {
      console.error(err);
      // Non-blocking: remove alert; rely on inline/route change UX
    } finally {
      // In case navigation fails, clear loader
      setTimeout(() => setBuyingNowId(null), 300);
    }
  };

  const handleWishlist = async (product) => {
    try {
      setWishlistLoadingId(product.id);
      await addToWishlist(product.id);
      setWishlistedIds(prev => (prev.includes(product.id) ? prev : [...prev, product.id]));
    } catch (err) {
      logError(err, 'Add to wishlist');
      // Non-blocking: no alert popup
    } finally {
      setTimeout(() => setWishlistLoadingId(null), 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingProductId) {
        await updateProduct(editingProductId, formData);
      } else {
        await addProduct(formData);
      }
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
      });
      setEditingProductId(null);
      await fetchProducts();
    } catch (err) {
      const errorDetails = logError(err, editingProductId ? 'Updating product' : 'Adding product');
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price.raw || product.price,
      image: product.image || '',
    });
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      const errorDetails = logError(err, 'Deleting product');
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
    });
    setEditingProductId(null);
    setShowModal(true);
  };

  if (loading && !products.length) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) &&
                        (!priceRange.max || product.price <= Number(priceRange.max));
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Show message when no products are available instead of an error
  if (!loading && !error && filteredProducts.length === 0) {
    return <div className="text-center py-8">No products found.</div>;
  }

  return (
    <>      
      <div className="container">
      {/* Filter and Sort Section */}
      <div className="mb-4 bg-white p-3 rounded shadow flex justify-between items-center">
        <div className="flex items-center">
          <button className="flex items-center space-x-2 px-4 py-2 border-r">
            <BiSort size={18} />
            <span>Sort</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2">
            <BiFilterAlt size={18} />
            <span>Filter</span>
          </button>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">Price:</span>
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:border-[#2874f0]"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:border-[#2874f0]"
          />
          <button className="bg-[#2874f0] text-white px-3 py-1 rounded text-sm">Apply</button>
        </div>
        {canManageProducts && (
          <button
            onClick={openModal}
            className="bg-[#2874f0] text-white px-4 py-2 rounded text-sm"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Products Grid - Flipkart Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {/* Product Image */}
            <div className="relative h-52 bg-gray-50 p-4 flex items-center justify-center">
              <img
                src={(product.images && product.images.main) || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleWishlist(product); }}
                disabled={wishlistLoadingId === product.id}
                className={`absolute top-2 right-2 p-2 ${wishlistLoadingId === product.id ? 'opacity-80 cursor-wait' : ''} ${wishlistedIds.includes(product.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-[#2874f0]'}`}
              >
                {wishlistLoadingId === product.id ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2"></span>
                ) : (
                  <FaHeart />
                )}
              </button>
              {Math.random() > 0.5 && (
                <div className="absolute bottom-0 left-0 bg-[#2874f0] text-white text-xs px-2 py-1">
                  On Sale
                </div>
              )}
            </div>

            {/* Product Details - Flipkart Style */}
            <div className="p-4 border-t">
              {/* Brand & Assured */}
              <div className="flex items-center mb-1">
                <span className="text-xs text-gray-500 truncate">
                  {product.category || 'Category'}
                </span>
                {Math.random() > 0.5 && (
                  <div className="flex items-center ml-2">
                    <MdVerified className="text-[#2874f0] text-sm" />
                    <span className="text-xs text-gray-700 ml-1">Assured</span>
                  </div>
                )}
              </div>
              
              {/* Product Name */}
              <h3 className="text-sm text-gray-700 font-medium mb-1 line-clamp-2 h-10">
                {product.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center bg-green-700 text-white px-1.5 py-0.5 rounded-sm text-xs">
                  {(Math.random() * 2 + 3).toFixed(1)} <FaStar className="ml-0.5" size={8} />
                </div>
                <span className="text-gray-500 text-xs ml-2">({Math.floor(Math.random() * 1000)} ratings)</span>
              </div>

              {/* Price */}
              <div className="flex items-center flex-wrap mb-2">
                <span className="text-base font-medium text-gray-900 mr-2">
                  {product.price?.formatted ?? `₹${Number(product?.price?.raw ?? product?.price ?? 0).toFixed(2)}`}
                </span>
                {Number.isFinite(Number(product?.price?.mrp?.raw ?? product?.mrp)) &&
                 Number(product?.price?.mrp?.raw ?? product?.mrp) > Number(product?.price?.raw ?? product?.price ?? 0) && (
                  <span className="text-sm text-gray-500 line-through mr-2">
                    ₹{Number(product?.price?.mrp?.raw ?? product?.mrp).toFixed(2)}
                  </span>
                )}
                {(() => {
                  const mrpNum = Number(product?.price?.mrp?.raw ?? product?.mrp);
                  const priceNum = Number(product?.price?.raw ?? product?.price ?? 0);
                  if (!Number.isFinite(mrpNum) || !Number.isFinite(priceNum) || mrpNum <= priceNum) return null;
                  const pct = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
                  return <span className="text-xs text-green-600 font-medium">{pct}% off</span>;
                })()}
              </div>
              
              {/* Offers */}
              <div className="mb-3">
                <div className="flex items-center text-xs text-gray-700">
                  <MdLocalOffer className="text-green-600 mr-1" size={14} />
                  <span>Special Price</span>
                </div>
                {Math.random() > 0.7 && (
                  <div className="flex items-center text-xs text-gray-700 mt-1">
                    <FaBolt className="text-yellow-500 mr-1" size={12} />
                    <span>Fast Delivery Available</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-1 mt-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                  className={`flex-1 bg-[#ff9f00] text-white py-2 rounded-sm transition-colors flex items-center justify-center gap-2 text-sm ${addingToCartId === product.id ? 'opacity-80 cursor-wait' : 'hover:bg-[#ff9000]'}`}
                  disabled={addingToCartId === product.id || Number(product?.stock_left ?? product?.stock_quantity ?? 0) <= 0}
                >
                  {addingToCartId === product.id ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  ) : (
                    <FaShoppingCart size={14} />
                  )}
                  {addingToCartId === product.id ? 'ADDING…' : (Number(product?.stock_left ?? product?.stock_quantity ?? 0) <= 0 ? 'OUT OF STOCK' : 'ADD TO CART')}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}
                  disabled={buyingNowId === product.id || Number(product?.stock_left ?? product?.stock_quantity ?? 0) <= 0}
                  className={`flex-1 bg-[#fb641b] text-white py-2 rounded-sm transition-colors flex items-center justify-center gap-2 text-sm ${buyingNowId === product.id ? 'opacity-80 cursor-wait' : 'hover:bg-[#fa631a]'}`}
                >
                  {buyingNowId === product.id ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      GOING TO CHECKOUT…
                    </>
                  ) : (
                    Number(product?.stock_left ?? product?.stock_quantity ?? 0) <= 0 ? 'OUT OF STOCK' : 'BUY NOW'
                )}
              </button>
                {canManageProducts && canEditProduct(product) && (
                  <>
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-2 py-2 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-2 py-2 bg-red-100 text-red-600 rounded-sm hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Modal - Flipkart Style */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm w-full max-w-md">
            <div className="bg-[#2874f0] text-white py-3 px-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-[#2874f0]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-[#2874f0]"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-[#2874f0]"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-[#2874f0]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-[#2874f0]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#fb641b] text-white rounded-sm hover:bg-[#fa631a]"
                >
                  {loading ? 'Saving...' : 'SAVE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    {/* </div> */}
    </>
  );
}

