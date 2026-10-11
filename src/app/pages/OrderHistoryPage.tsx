import { useState, useEffect } from 'react';
import { useNavigate } from '../navigation';
import { Link } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending' },
  confirmed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Confirmed' },
  preparing: { icon: <Package className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Preparing' },
  processing: { icon: <Package className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Processing' },
  'out for delivery': { icon: <Truck className="w-4 h-4" />, color: 'text-orange-700', bg: 'bg-orange-100', label: 'Out for Delivery' },
  delivered: { icon: <Truck className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-700', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function OrderHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const userOrders = await api.getMyOrders();
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.cancelOrder(orderId);
        fetchOrders();
        alert('Order cancelled successfully.');
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-600" />
          My Orders
        </h1>
        <p className="text-orange-600 mt-1">Track your bulk order history and status</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <Package className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start by browsing our fruit collection</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Browse Fruits
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const isExpanded = expandedOrder === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${status.bg} ${status.color} flex items-center justify-center`}>
                      {status.icon}
                    </div>
                    <div>
                      <p className="font-bold text-orange-900">Order #{order._id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      <p className="text-lg font-bold text-orange-900 mt-1">₹{order.total_amount.toFixed(0)}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Order Details */}
                {isExpanded && (
                  <div className="border-t border-orange-100 p-5 bg-orange-50/50">
                    {/* Status Timeline */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                      {['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered'].map((s, i) => {
                        const stepStatuses = ['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered'];
                        let currentIdx = stepStatuses.indexOf(order.status);
                        // Map legacy processing to preparing for display
                        if (order.status === 'processing') currentIdx = 2; 

                        const isActive = i <= currentIdx && order.status !== 'cancelled';
                        const sc = statusConfig[s] || statusConfig['pending'];
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {i + 1}
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                              {sc.label}
                            </span>
                            {i < 4 && <div className={`w-8 h-0.5 ${isActive && i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any) => (
                        <div key={item._id} className="flex items-center justify-between bg-white rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <ImageWithFallback src={item.image_url} alt={item.fruit_name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-semibold text-orange-900 text-sm">{item.fruit_name}</p>
                              <p className="text-xs text-gray-500">{item.quantity} × ₹{item.sellingPrice_at_order}</p>
                            </div>
                          </div>
                          <p className="font-bold text-orange-900">₹{(item.quantity * item.sellingPrice_at_order).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-3 text-sm mb-4">
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Subtotal</span>
                        <span>₹{(order.total_amount - (order.delivery_fee || 0) + (order.discount || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Delivery Fee</span>
                        <span>{order.delivery_fee ? `₹${order.delivery_fee}` : 'FREE'}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600 mb-1">
                          <span>Discount ({order.coupon_code})</span>
                          <span>-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-orange-900 border-t border-orange-50 pt-2 mt-1">
                        <span>Grand Total</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.delivery_address && (
                      <div className="bg-white rounded-xl p-3 text-sm">
                        <p className="font-semibold text-orange-900 mb-1">Delivery Address</p>
                        <p className="text-gray-600">{order.delivery_address}</p>
                        {order.phone && <p className="text-gray-500 mt-1">📞 {order.phone}</p>}
                        {order.notes && <p className="text-gray-500 mt-1">📝 {order.notes}</p>}
                      </div>
                    )}
                    
                    {/* Actions */}
                    {order.status === 'pending' && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-500 bg-red-50 hover:bg-red-100 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
