import { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { RefreshCcw, Search, Eye, CheckCircle, Package, Truck, XCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function OrderManagement() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert('Order status updated');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': 
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'out for delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (o.customer_phone && o.customer_phone.includes(search))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900">Manage Orders ({orders.length})</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-64"
            />
          </div>
          <button onClick={fetchOrders} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-50 text-orange-900 text-sm">
              <tr>
                <th className="p-4 text-left font-semibold">Order ID</th>
                <th className="p-4 text-left font-semibold">Customer</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Amount</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-orange-50/50">
                  <td className="p-4 font-mono text-sm text-gray-600">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{order.customer_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{order.customer_phone || ''}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    ₹{order.total_amount}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-600 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Order</h3>
                <p className="text-sm text-gray-500 font-mono">ID: {selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Customer Details</h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-1">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedOrder.customer_email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Delivery Information</h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-1">
                    <p><span className="text-gray-500">Address:</span> {selectedOrder.delivery_address}</p>
                    <p><span className="text-gray-500">Notes:</span> {selectedOrder.notes || 'None'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3">{item.fruit_id?.name || 'Unknown Fruit'}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">₹{item.price_at_order}</td>
                          <td className="p-3 text-right font-semibold">₹{item.price_at_order * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right space-y-1 text-sm">
                  <p className="text-gray-500">Subtotal: ₹{selectedOrder.total_amount - (selectedOrder.delivery_fee || 0) + (selectedOrder.discount || 0)}</p>
                  <p className="text-gray-500">Delivery: +₹{selectedOrder.delivery_fee || 0}</p>
                  {selectedOrder.discount > 0 && <p className="text-green-600">Discount: -₹{selectedOrder.discount}</p>}
                  <p className="text-lg font-bold text-gray-900 mt-2">Total: ₹{selectedOrder.total_amount}</p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-700 mb-4">Update Order Status</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedOrder.status === 'cancelled' ? (
                    <div className="w-full p-4 bg-red-50 text-red-700 rounded-xl font-semibold border border-red-100">
                      This order is cancelled. It cannot be updated.
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleStatusChange(selectedOrder._id, 'pending')} disabled={selectedOrder.status === 'pending'} className="px-4 py-2 rounded-lg font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50">Pending</button>
                      <button onClick={() => handleStatusChange(selectedOrder._id, 'confirmed')} disabled={selectedOrder.status === 'confirmed'} className="px-4 py-2 rounded-lg font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50">Confirm</button>
                      <button onClick={() => handleStatusChange(selectedOrder._id, 'preparing')} disabled={selectedOrder.status === 'preparing'} className="px-4 py-2 rounded-lg font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50">Prepare</button>
                      <button onClick={() => handleStatusChange(selectedOrder._id, 'out for delivery')} disabled={selectedOrder.status === 'out for delivery'} className="px-4 py-2 rounded-lg font-semibold bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50">Out for Delivery</button>
                      <button onClick={() => handleStatusChange(selectedOrder._id, 'delivered')} disabled={selectedOrder.status === 'delivered'} className="px-4 py-2 rounded-lg font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50">Delivered</button>
                      
                      <div className="w-full mt-4">
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order? This will restore inventory stock and reverse sales/profit records.')) {
                              handleStatusChange(selectedOrder._id, 'cancelled');
                            }
                          }}
                          className="px-6 py-2 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 shadow-md"
                        >
                          Cancel Order & Restore Stock
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
