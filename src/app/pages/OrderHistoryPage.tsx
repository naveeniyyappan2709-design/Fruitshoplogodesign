import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: number;
  fruit_name: string;
  quantity: number;
  price_at_order: number;
  unit: string;
  image_url: string;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending' },
  confirmed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Confirmed' },
  processing: { icon: <Package className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Processing' },
  delivered: { icon: <Truck className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-700', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function OrderHistoryPage() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
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
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${status.bg} ${status.color} flex items-center justify-center`}>
                      {status.icon}
                    </div>
                    <div>
                      <p className="font-bold text-orange-900">Order #{order.id}</p>
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
                      {['pending', 'confirmed', 'processing', 'delivered'].map((s, i) => {
                        const stepStatuses = ['pending', 'confirmed', 'processing', 'delivered'];
                        const currentIdx = stepStatuses.indexOf(order.status);
                        const isActive = i <= currentIdx && order.status !== 'cancelled';
                        const sc = statusConfig[s];
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
                            {i < 3 && <div className={`w-8 h-0.5 ${isActive && i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.fruit_name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-semibold text-orange-900 text-sm">{item.fruit_name}</p>
                              <p className="text-xs text-gray-500">{item.quantity} × ₹{item.price_at_order}</p>
                            </div>
                          </div>
                          <p className="font-bold text-orange-900">₹{(item.quantity * item.price_at_order).toFixed(0)}</p>
                        </div>
                      ))}
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
