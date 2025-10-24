import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/product';
import { getUserRole, getCurrentUser } from '../utils/auth';
import { logError } from '../utils/errorLogger';
import Button from '../components/Button';
import { BiFilterAlt, BiSort } from 'react-icons/bi';

export default function VendorProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showOnlyOutOfStock, setShowOnlyOutOfStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    mrp: '',
    stock_quantity: '',
    main_image: null, // file stored here
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Verify vendor role
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const role = await getUserRole();
        if (role !== 'vendor') {
          navigate('/products');
          return;
        }
        const user = await getCurrentUser();
        setCurrentUserId(user?.id);
      } catch (err) {
        const errDet = logError(err, 'Verifying vendor role');
        setError(errDet.message);
      }
    };
    verifyRole();
  }, [navigate]);

  useEffect(() => {
    if (currentUserId) fetchProducts();
  }, [currentUserId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      const allProducts = res.data?.data || [];
      // सभी प्रोडक्ट्स दिखाएं, फिल्टरिंग न करें
      setProducts(allProducts);
    } catch (err) {
      const errDet = logError(err, 'Fetching vendor products');
      setError(errDet.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'main_image') {
      setFormData(prev => ({ ...prev, main_image: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const dataToSend = new FormData();

      for (const key in formData) {
        if (key === 'main_image') {
          if (formData.main_image) { // Changed from 'formData.main_image instanceof File'
            dataToSend.append('main_image', formData.main_image);
          }
        } else {
          dataToSend.append(key, formData[key]);
        }
      }

      if (editingProductId) {
        await updateProduct(editingProductId, dataToSend);
      } else {
        await addProduct(dataToSend);
      }

      await fetchProducts();
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', category: '', mrp: '', stock_quantity: '', main_image: null });
      setEditingProductId(null);
    } catch (err) {
      const errDet = logError(err, editingProductId ? 'Updating product' : 'Adding product');
      setError(errDet.message);
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
      mrp: product.price.mrp?.raw || '',
      stock_quantity: product.stock_quantity || '',
      main_image: null, // reset, user can upload a new one
    });
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      const errDet = logError(err, 'Deleting product');
      setError(errDet.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !products.length) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto">
      <div className="mb-4 bg-white p-3 rounded shadow flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 border-r"><BiSort size={18} />Sort</button>
          <button className="flex items-center space-x-2 px-4 py-2" onClick={() => setShowOnlyOutOfStock(v => !v)}>
            <BiFilterAlt size={18} />
            <span>{showOnlyOutOfStock ? 'Show All' : 'Show Out of Stock'}</span>
          </button>
        </div>
        <Button onClick={() => { setShowModal(true); setEditingProductId(null); }} variant="primary">Add Product</Button>
      </div>

      {/* Products table */}
      <table className="min-w-full bg-white shadow-md rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Category</th>
            <th className="py-2 px-4">Price</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(showOnlyOutOfStock ? products.filter(p => Number(p?.stock_left ?? p?.stock_quantity ?? 0) <= 0) : products).map(p => (
            <tr key={p.id} className="text-center border-b">
              <td className="py-2 px-4">{p.name}</td>
              <td className="py-2 px-4">{p.category}</td>
              <td className="py-2 px-4">₹{p.price.raw || p.price}</td>
              <td className="py-2 px-4 space-x-2">
                <Button variant="secondary" onClick={() => handleEdit(p)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (<tr><td colSpan="4" className="py-6">No products found.</td></tr>)}
        </tbody>
      </table>

      {/* Stock summary badges under table */}
      <div className="mt-3 text-sm text-gray-700">
        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 bg-blue-100 text-blue-800 mr-2">
          Total Sold: {products.reduce((acc, p) => acc + Number(p?.sold_quantity ?? 0), 0)}
        </span>
        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 bg-green-100 text-green-800">
          Total Left: {products.reduce((acc, p) => acc + Number((p?.stock_left ?? p?.stock_quantity ?? 0)), 0)}
        </span>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Name*</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Category*</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Price (₹)*</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">MRP (₹)</label>
                <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Stock Quantity*</label>
                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Product Image {editingProductId ? '(optional)' : '*'}</label>
                <input type="file" name="main_image" onChange={handleInputChange} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}