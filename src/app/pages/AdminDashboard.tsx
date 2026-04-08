import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../contexts/AuthContext';
import {
  BarChart3, Package, Users, IndianRupee, Loader2,
  Plus, Edit2, Trash2, Check, X, Search, ChevronDown, ChevronUp,
  TrendingUp, ShoppingCart, Fruit, LayoutDashboard
} from 'lucide-react';

interface Fruit {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_kg: number;
  image_url: string;
  category: string;
  available: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  items: { fruit_name: string; quantity: number; price_at_order: number; unit: string }[];
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalFruits: number;
}

type Tab = 'dashboard' | 'fruits' | 'orders';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFruit, setEditingFruit] = useState<Partial<Fruit> | null>(null);
  const [showAddFruit, setShowAddFruit] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchFruits(), fetchOrders()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchFruits = async () => {
    try {
      const res = await fetch(`${API_URL}/fruits?all=true`);
      const data = await res.json();
      setFruits(data.fruits);
    } catch (err) {
      console.error('Failed to fetch fruits:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const saveFruit = async (fruit: Partial<Fruit>) => {
    try {
      const isNew = !fruit.id;
      const url = isNew ? `${API_URL}/fruits` : `${API_URL}/fruits/${fruit.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(fruit)
      });

      if (res.ok) {
        fetchFruits();
        setEditingFruit(null);
        setShowAddFruit(false);
      }
    } catch (err) {
      console.error('Failed to save fruit:', err);
    }
  };

  const deleteFruit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fruit?')) return;
    try {
      await fetch(`${API_URL}/fruits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFruits();
    } catch (err) {
      console.error('Failed to delete fruit:', err);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
      fetchStats();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'fruits' as Tab, label: 'Fruits', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'orders' as Tab, label: 'Orders', icon: <Package className="w-4 h-4" /> },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-orange-600" />
          Admin Dashboard
        </h1>
        <p className="text-orange-600 mt-1">Manage your fruit shop inventory and orders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-orange-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-white text-orange-700 border border-orange-200 border-b-white -mb-px shadow-sm'
                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders, icon: <Package className="w-6 h-6" />, color: 'from-blue-500 to-blue-600' },
              { label: 'Pending', value: stats.pendingOrders, icon: <TrendingUp className="w-6 h-6" />, color: 'from-amber-500 to-amber-600' },
              { label: 'Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: <IndianRupee className="w-6 h-6" />, color: 'from-green-500 to-green-600' },
              { label: 'Customers', value: stats.totalCustomers, icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
              { label: 'Fruits', value: stats.totalFruits, icon: <ShoppingCart className="w-6 h-6" />, color: 'from-orange-500 to-orange-600' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-sm font-medium">{stat.label}</span>
                  <div className="bg-white/20 rounded-xl p-2">{stat.icon}</div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fruits Tab */}
      {activeTab === 'fruits' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-orange-900">Manage Fruits ({fruits.length})</h2>
            <button
              onClick={() => {
                setShowAddFruit(true);
                setEditingFruit({ name: '', price: 0, unit: 'per kg', stock_kg: 0, category: 'everyday', description: '', image_url: '' });
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Fruit
            </button>
          </div>

          {/* Add/Edit Fruit Form */}
          {(showAddFruit || editingFruit) && editingFruit && (
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-orange-900 mb-4">
                {editingFruit.id ? 'Edit Fruit' : 'Add New Fruit'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Name</label>
                  <input
                    value={editingFruit.name || ''}
                    onChange={(e) => setEditingFruit({ ...editingFruit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Fruit name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingFruit.price || ''}
                    onChange={(e) => setEditingFruit({ ...editingFruit, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Unit</label>
                  <select
                    value={editingFruit.unit || 'per kg'}
                    onChange={(e) => setEditingFruit({ ...editingFruit, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="per kg">per kg</option>
                    <option value="per dozen">per dozen</option>
                    <option value="per piece">per piece</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Stock (kg)</label>
                  <input
                    type="number"
                    value={editingFruit.stock_kg || ''}
                    onChange={(e) => setEditingFruit({ ...editingFruit, stock_kg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Category</label>
                  <select
                    value={editingFruit.category || 'everyday'}
                    onChange={(e) => setEditingFruit({ ...editingFruit, category: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="everyday">Everyday</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="exotic">Exotic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Image URL</label>
                  <input
                    value={editingFruit.image_url || ''}
                    onChange={(e) => setEditingFruit({ ...editingFruit, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Description</label>
                  <input
                    value={editingFruit.description || ''}
                    onChange={(e) => setEditingFruit({ ...editingFruit, description: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Fruit description..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => saveFruit(editingFruit)}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => { setEditingFruit(null); setShowAddFruit(false); }}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Fruits Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-orange-900">Fruit</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-orange-900">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-orange-900">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-orange-900">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-orange-900">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-orange-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fruits.map((fruit) => (
                    <tr key={fruit.id} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {fruit.image_url && (
                            <img src={fruit.image_url} alt={fruit.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="font-semibold text-orange-900 text-sm">{fruit.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{fruit.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-700">₹{fruit.price} <span className="text-xs text-gray-400 font-normal">{fruit.unit}</span></td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${fruit.stock_kg < 50 ? 'text-red-600' : 'text-gray-700'}`}>
                          {fruit.stock_kg} kg
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          fruit.category === 'exotic' ? 'bg-purple-100 text-purple-700' :
                          fruit.category === 'seasonal' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {fruit.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          fruit.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {fruit.available ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingFruit(fruit)}
                            className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFruit(fruit.id)}
                            className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-bold text-orange-900 mb-6">All Orders ({orders.length})</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <Package className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-orange-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer_name} • {order.customer_email}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                      <p className="font-bold text-orange-900">₹{order.total_amount.toFixed(0)}</p>
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {expandedOrder === order.id && (
                    <div className="border-t border-orange-100 p-5 bg-orange-50/50">
                      {/* Items */}
                      <div className="mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between bg-white rounded-lg p-2 mb-1 text-sm">
                            <span className="text-gray-700">{item.fruit_name} × {item.quantity}</span>
                            <span className="font-semibold text-orange-900">₹{(item.quantity * item.price_at_order).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery */}
                      <div className="bg-white rounded-lg p-3 text-sm mb-4">
                        <p className="text-gray-600"><strong>Address:</strong> {order.delivery_address}</p>
                        {order.phone && <p className="text-gray-500">📞 {order.phone}</p>}
                        {order.notes && <p className="text-gray-500">📝 {order.notes}</p>}
                      </div>

                      {/* Status Update */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500 py-2 mr-2">Update status:</span>
                        {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={order.status === status}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                              order.status === status
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
