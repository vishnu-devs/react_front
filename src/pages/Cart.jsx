import React, { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart, clearCart, setCheckoutItems, setCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { getProduct } from '../api/product';

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const refresh = () => setItems(getCart());

  useEffect(() => {
    const load = async () => {
      refresh();
      const current = getCart();
      // Enrich items missing image by fetching product details
      const needEnrich = current.filter(i => !i.image);
      if (needEnrich.length > 0) {
        try {
          const enriched = await Promise.all(current.map(async (i) => {
            if (i.image) return i;
            try {
              const res = await getProduct(i.id);
              const p = res?.data?.data || {};
              const image = p?.images?.main || p?.main_image || p?.image || '';
              return { ...i, image };
            } catch {
              return i;
            }
          }));
          setCart(enriched);
          setItems(enriched);
        } catch (e) {
          // ignore enrich errors
        }
      }
    };
    load();
  }, []);

  const handleQuantityChange = (id, qty) => {
    updateCartItem(id, qty);
    refresh();
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    refresh();
  };

  const handleClear = () => {
    if (window.confirm('Clear cart?')) {
      clearCart();
      refresh();
    }
  };

  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);

  const proceedToCheckout = () => {
    if (items.length === 0) {
      // Non-blocking: show inline disabled state, no alert popup
      return;
    }
    // Prefill checkout items for Orders page
    setCheckoutItems(items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })));
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">Cart is empty.</div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2">Product</th>
                <th className="py-2">Price</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Total</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="py-2 flex items-center gap-3">
                    <img src={item.image || 'https://via.placeholder.com/60'} alt="" className="w-12 h-12 object-cover" />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-2">₹{item.price}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                  <td className="py-2">
                    <button onClick={() => handleRemove(item.id)} className="text-red-600">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button onClick={handleClear} className="text-gray-600">Clear Cart</button>
            <div className="text-lg font-semibold">Subtotal: ₹{subtotal.toFixed(2)}</div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={proceedToCheckout}
              disabled={items.length === 0}
              className={`px-6 py-3 rounded text-white ${items.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {items.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}