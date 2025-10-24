import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { logError } from '../utils/errorLogger';
import Button from '../components/Button';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [inlineError, setInlineError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/?api\/?$/, '') || 'http://localhost:8000';

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setInlineError(null);
      const res = await getWishlist(page);
      const data = res?.data || {};
      const products = data?.data || [];
      const pagination = data?.pagination || {};
      setItems(products);
      setCurrentPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
    } catch (err) {
      logError(err, 'Fetch wishlist');
      setInlineError('Wishlist laane me problem aayi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleRemove = async (id) => {
    try {
      setRemovingId(id);
      await removeFromWishlist(id);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const details = logError(err, 'Remove from wishlist');
      setInlineError(details.message || 'Wishlist se hatane me problem aayi');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">Wishlist khaali hai</div>
      ) : (
        <>
          {inlineError && (
            <div className="mb-3 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{inlineError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => {
              const rawImage = product.main_image || '';
              const image = rawImage ? `${BACKEND_BASE}/storage/${rawImage}` : '';
              const priceText =
                typeof product?.price === 'number'
                  ? `₹${Number(product.price).toFixed(2)}`
                  : product?.price?.formatted || (product?.price?.raw != null ? `₹${product.price.raw}` : '₹0.00');
              const vendorName = product?.vendor?.name || 'Vendor';
              return (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 relative">
                  <img
                    src={image || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <div className="mt-3">
                    <h2 className="text-lg font-medium text-gray-800 line-clamp-2">{product.name}</h2>
                    <p className="text-sm text-gray-500">By {vendorName}</p>
                    <p className="text-xl font-semibold text-green-600 mt-1">{priceText}</p>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button variant="secondary" onClick={() => handleRemove(product.id)} disabled={removingId === product.id}>
                      {removingId === product.id ? 'Removing…' : 'Remove'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              disabled={currentPage <= 1}
              onClick={() => load(currentPage - 1)}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-600">Page {currentPage} of {lastPage}</span>
            <Button
              disabled={currentPage >= lastPage}
              onClick={() => load(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}