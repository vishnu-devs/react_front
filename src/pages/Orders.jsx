import React, { useEffect, useState } from "react";
import { getOrders, createOrder, getOrder, updateOrder } from "../api/order";
import { getCheckoutItems, clearCheckoutItems, clearCart, getCart } from "../utils/cart";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([{ product_id: "", quantity: 1 }]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // New structured address fields
  const [addressPincode, setAddressPincode] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressVillage, setAddressVillage] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [inlineError, setInlineError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    // Prefill from Buy Now
    const items = getCheckoutItems();
    if (items && items.length > 0) {
      setSelectedProducts(items.map((i) => ({ product_id: i.id, quantity: i.quantity || 1 })));
      clearCheckoutItems();
    }
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await getOrders(currentPage);
      const cartItems = getCart();
      if (ordersRes.data.status === 'success') {
        // Enrich orders with shipping address and payment method using getOrder
        const baseOrders = ordersRes.data.data;
        const enriched = await Promise.all(
          baseOrders.map(async (o) => {
            try {
              const detailRes = await getOrder(o.id);
              if (detailRes.data?.status === 'success') {
                const d = detailRes.data.data;
                return { ...o, shipping_address: d.shipping_address, payment_method: d.payment_method };
              }
            } catch (e) {
              // keep base order if detail fetch fails
            }
            return o;
          })
        );
        setOrders(enriched);
        setTotalPages(ordersRes.data.pagination.last_page);
      }
      // Only show cart items in the product select dropdown
      setProducts(cartItems);
      // Prefill selected products from cart if none selected
      const hasValidSelection = selectedProducts && selectedProducts.some(p => !!p.product_id);
      if (!hasValidSelection && cartItems && cartItems.length > 0) {
        setSelectedProducts(cartItems.map(i => ({ product_id: i.id, quantity: i.quantity || 1 })));
      }
    } catch (e) {
      console.error(e);
      setInlineError(e?.response?.data?.message || e?.message || "Failed to load orders/cart items. Please try again.");
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { product_id: "", quantity: 1 }]);
  };

  const handleCancel = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setInlineError(null);
      await updateOrder(orderId, { status: 'cancelled' });
      await fetchData();
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to cancel order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReturn = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setInlineError(null);
      await updateOrder(orderId, { status: 'return_requested' });
      await fetchData();
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to request return');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefund = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setInlineError(null);
      await updateOrder(orderId, { status: 'refunded' });
      await fetchData();
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to process refund');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelRefund = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setInlineError(null);
      await updateOrder(orderId, { status: 'refund_cancelled' });
      await fetchData();
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to cancel refund');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeProduct = (index) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    setSelectedProducts(updated);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    // Validate products
    const validProducts = selectedProducts.filter(p => p.product_id && p.quantity > 0);
    if (validProducts.length === 0) {
      return alert("Please select at least one product with quantity");
    }
    if (!customerName.trim()) {
      return alert("Please enter your name");
    }
    if (!customerEmail.trim()) {
      return alert("Please enter your email");
    }
    if (!customerPhone.trim()) {
      return alert("Please enter your phone number");
    }
    if (!shippingAddress.trim()) {
      return alert("Please enter street address");
    }
    if (!addressCity.trim()) {
      return alert("Please enter city");
    }
    if (!addressState.trim()) {
      return alert("Please enter state");
    }
    if (!addressPincode.trim()) {
      return alert("Please enter pincode / area code");
    }
    try {
      setIsPlacingOrder(true);
      const composedAddress = [
        shippingAddress && `Street: ${shippingAddress}`,
        addressLandmark && `Landmark: ${addressLandmark}`,
        addressVillage && `Village: ${addressVillage}`,
        addressCity && `City: ${addressCity}`,
        addressState && `State: ${addressState}`,
        addressPincode && `Pincode/Area: ${addressPincode}`,
      ].filter(Boolean).join(' | ');
      const orderData = {
        products: validProducts.map(p => ({ id: Number(p.product_id), quantity: Number(p.quantity) })),
        shipping_address: composedAddress,
        payment_method: paymentMethod,
        contact_name: customerName,
        contact_email: customerEmail,
        contact_phone: customerPhone
      };
      await createOrder(orderData);
      // Clear cart after successful order placement
      clearCart();
      // Reset form
      setSelectedProducts([{ product_id: "", quantity: 1 }]);
      setShippingAddress("");
      setPaymentMethod("cod");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setAddressPincode("");
      setAddressCity("");
      setAddressState("");
      setAddressVillage("");
      setAddressLandmark("");
      await fetchData();
      // Success: orders list refreshed; no blocking alert popup
    } catch (e) {
      console.error(e);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Order Creation Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Place New Order</h2>
        <form onSubmit={handleCreateOrder} className="space-y-6">
          {/* Cart Items Summary (replaces product select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cart Items</label>
            {selectedProducts.length === 0 ? (
              <div className="text-sm text-gray-600">No items selected. Please add items to cart.</div>
            ) : (
              selectedProducts.map((item, index) => {
                const p = products.find((pr) => String(pr.id) === String(item.product_id));
                const price = Number(p?.price?.raw ?? p?.price ?? 0);
                const image = p?.image || p?.images?.main || p?.main_image || '';
                return (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <img
                      src={image || 'https://via.placeholder.com/60'}
                      alt={p?.name || 'Product'}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{p?.name || 'Selected Product'}</div>
                      <div className="text-sm text-gray-500">₹{price.toFixed(2)}</div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                      className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Qty"
                      required
                    />
                    {selectedProducts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="House/Flat No., Street/Road, Area"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode / Area Code</label>
              <input
                type="text"
                value={addressPincode}
                onChange={(e) => setAddressPincode(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., 560001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Bengaluru"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={addressState}
                onChange={(e) => setAddressState(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Karnataka"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Village (optional)</label>
              <input
                type="text"
                value={addressVillage}
                onChange={(e) => setAddressVillage(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Village name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (school, temple, etc.)</label>
              <input
                type="text"
                value={addressLandmark}
                onChange={(e) => setAddressLandmark(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nearby landmark"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isPlacingOrder}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Placing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="mt-8 flex flex-col">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Orders</h2>
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Price</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Payment</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">#{order.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.products && order.products.length > 0 ? (
                          <div className="space-y-1">
                            {order.products.map((p) => (
                              <div key={p.id}>
                                <span className="font-medium text-gray-900">{p.name}</span>
                                <span className="text-gray-500"> × {p.quantity}</span>
                                {p.price?.formatted && (
                                  <span className="text-gray-500 ml-1">{p.price.formatted}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.products && order.products.length > 0
                          ? order.products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
                          : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.total_amount ? order.total_amount.formatted : order.total_price?.formatted || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.payment_method ? (
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.payment_method === 'cod' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.payment_method === 'cod' ? 'COD' : 'Online'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{order.shipping_address || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'return_requested' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'returned' ? 'bg-green-200 text-green-800' :
                          order.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'refund_cancelled' ? 'bg-gray-200 text-gray-700' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.created_at.formatted}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={updatingId === order.id || order.status === 'cancelled' || order.status === 'completed' || order.status === 'delivered'}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingId === order.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Cancelling...
                              </>
                            ) : (
                              'Cancel'
                            )}
                          </button>
                          <button
                            onClick={() => handleReturn(order.id)}
                            disabled={updatingId === order.id || order.status === 'cancelled' || order.status === 'return_requested' || order.status !== 'delivered'}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingId === order.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Requesting...
                              </>
                            ) : (
                              'Return'
                            )}
                          </button>
                          <button
                            onClick={() => handleRefund(order.id)}
                            disabled={updatingId === order.id || !(order.status === 'cancelled' || order.status === 'returned')}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!(order.status === 'cancelled' || order.status === 'returned') ? 'Refund sirf Cancelled/Returned ke baad kar sakte hain' : 'Refund process karein'}
                          >
                            {updatingId === order.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Refunding...
                              </>
                            ) : (
                              'Refund'
                            )}
                          </button>
                          <button
                            onClick={() => handleCancelRefund(order.id)}
                            disabled={updatingId === order.id || !(order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded')}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!(order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded') ? 'Cancel Refund sirf Cancelled/Returned/Refunded state me hi' : 'Refund cancel karein'}
                          >
                            {updatingId === order.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Refund'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {inlineError && (
        <div className="mt-4 text-red-600 text-sm">{inlineError}</div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
