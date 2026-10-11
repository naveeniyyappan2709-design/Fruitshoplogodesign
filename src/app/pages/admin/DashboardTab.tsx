import { useEffect, useState } from 'react';
import { Package, TrendingUp, IndianRupee, Users, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from '../../navigation';

export default function DashboardTab() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;
  if (!stats) return <div className="text-red-500 p-4">Error loading stats</div>;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders || 0, icon: <Package className="w-5 h-5" />, color: 'bg-blue-500' },
          { label: 'Pending', value: stats.pendingOrders || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-500' },
          { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(0)}`, icon: <IndianRupee className="w-5 h-5" />, color: 'bg-green-500' },
          { label: 'Customers', value: stats.totalCustomers || 0, icon: <Users className="w-5 h-5" />, color: 'bg-purple-500' },
          { label: 'Fruits', value: stats.totalFruits || 0, icon: <ShoppingCart className="w-5 h-5" />, color: 'bg-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5 text-white shadow-md relative overflow-hidden group min-h-[120px] flex flex-col justify-between`}>
            <div className="flex items-start justify-between relative z-10">
              <span className="text-white/90 text-sm font-medium">{stat.label}</span>
              <div className="bg-white/20 rounded-lg p-1.5">{stat.icon}</div>
            </div>
            <p className="text-3xl font-bold relative z-10">{stat.value}</p>
          </div>
        ))}
      </div>

{/* Daily Fruit Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-orange-50 bg-white">
          <h3 className="text-lg font-bold text-orange-950">Daily Fruit Sales</h3>
          <p className="text-sm text-gray-500">Sales breakdown per fruit for the last 7 days</p>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-orange-50/50 text-orange-900 border-b border-orange-100">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Fruit</th>
                <th className="px-6 py-4 font-semibold text-center">Quantity Sold</th>
                <th className="px-6 py-4 font-semibold text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {stats.dailyFruitSales && stats.dailyFruitSales.length > 0 ? (
                stats.dailyFruitSales.map((sale: any, idx: number) => (
                  <tr key={idx} className="border-b border-orange-50 hover:bg-orange-50/30">
                    <td className="px-6 py-4 font-medium text-gray-800">{sale.date}</td>
                    <td className="px-6 py-4 text-orange-900">{sale.fruit_name}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{sale.total_quantity}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">₹{sale.total_revenue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">No sales data available for the last 7 days.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
