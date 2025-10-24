import React, { useEffect, useState } from 'react';
import { getUserRole } from '../utils/auth';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function VendorOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [inlineError, setInlineError] = useState(null);

  useEffect(() => {
    const verifyVendor = async () => {
      try {
        const role = await getUserRole();
        if (role !== 'vendor') {
          navigate('/orders');
          return;
        }
        fetchOrders(currentPage);
      } catch (err) {
        setError(err?.message || 'Role check failed');
        setLoading(false);
      }
    };
    verifyVendor();
  }, [currentPage, navigate]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/v1/vendor-orders?page=${page}`);
      const data = res.data?.data || [];
      const pagination = res.data?.pagination || { last_page: 1 };
      setOrders(data);
      setTotalPages(pagination.last_page || 1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setInlineError(null);
      await API.put(`/v1/vendor-orders/${orderId}`, { status });
      await fetchOrders(currentPage);
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !orders.length) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Orders</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Products</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">#{order.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{order.user?.name} ({order.user?.email})</td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      {order.products?.map((p) => (
                        <li key={p.id}>
                          {p.name} × {p.quantity} — <span className="text-gray-700">{p.price?.formatted || `₹${p.price}`}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{order.total_amount?.formatted || `₹${order.total_amount}`}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'return_requested' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'returned' ? 'bg-green-200 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex gap-2 flex-wrap">
                      {['processing','shipped','delivered','cancelled'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(order.id, s)}
                          disabled={updatingId === order.id || order.status === s}
                          className={`px-3 py-1 rounded ${
                            order.status === s ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        onClick={() => handleStatusChange(order.id, 'returned')}
                        disabled={updatingId === order.id || order.status !== 'return_requested'}
                        className={`px-3 py-1 rounded ${
                          order.status === 'returned' ? 'bg-gray-200 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={order.status !== 'return_requested' ? 'Return Requested ke baad hi confirm kar sakte hain' : 'Return Successful mark karein'}
                      >
                        Return Successful
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'refunded')}
                        disabled={updatingId === order.id || !(order.status === 'cancelled' || order.status === 'returned')}
                        className={`px-3 py-1 rounded ${
                          order.status === 'refunded' ? 'bg-gray-200 text-gray-600' : 'bg-purple-600 text-white hover:bg-purple-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!(order.status === 'cancelled' || order.status === 'returned') ? 'Refund sirf Cancelled/Returned ke baad hi' : 'Refund initiate karein'}
                      >
                        Refund
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'refund_cancelled')}
                        disabled={updatingId === order.id || !(order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded')}
                        className={`px-3 py-1 rounded ${
                          order.status === 'refund_cancelled' ? 'bg-gray-200 text-gray-600' : 'bg-gray-600 text-white hover:bg-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!(order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded') ? 'Cancel Refund sirf Cancelled/Returned/Refunded state me hi' : 'Refund cancel karein'}
                      >
                        Cancel Refund
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-600">Koi orders nahi mile jo aapke products ke sath the.</td>
                </tr>
              )}
            </tbody>
          </table>
          {inlineError && (
            <div className="text-red-600 text-sm mt-3">{inlineError}</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
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
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
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