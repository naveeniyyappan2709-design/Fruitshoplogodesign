import { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';

export default function SalesManagement() {
  const { token } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSale, setNewSale] = useState({ fruitId: '', quantity: 1 });
  const [filter, setFilter] = useState<'all'|'daily'|'weekly'|'monthly'>('all');

  const fetchData = async () => {
    try {
      const [salesRes, fruitsRes] = await Promise.all([
        fetch(`${API_URL}/sales`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/fruits?all=true`)
      ]);
      if (salesRes.ok) setSales((await salesRes.json()).sales);
      if (fruitsRes.ok) setFruits((await fruitsRes.json()).fruits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createSale = async () => {
    if (!newSale.fruitId || newSale.quantity <= 0) return;
    try {
      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSale)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewSale({ fruitId: '', quantity: 1 });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create sale');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading sales...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900">Manage Sales ({sales.length})</h2>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border border-orange-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
            <option value="all">All Time</option>
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" /> Create Sale
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-4 rounded-xl shadow mb-6 border border-orange-100 flex gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 font-semibold">Fruit</label>
            <select value={newSale.fruitId} onChange={e => setNewSale({...newSale, fruitId: e.target.value})} className="border rounded p-2">
              <option value="">Select Fruit</option>
              {fruits.filter(f => f.quantity > 0).map(f => (
                <option key={f._id} value={f._id}>{f.name} (Stock: {f.quantity}kg)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">Quantity (kg)</label>
            <input type="number" min="1" value={newSale.quantity} onChange={e => setNewSale({...newSale, quantity: parseInt(e.target.value)})} className="border rounded p-2 w-32" />
          </div>
          <button onClick={createSale} className="bg-green-600 text-white px-6 py-2 rounded">Submit Sale</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50 text-left text-sm text-orange-900">
              <th className="p-4">Date</th>
              <th className="p-4">Fruit</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {sales.filter(s => {
              if (filter === 'all') return true;
              const saleDate = new Date(s.saleDate);
              const now = new Date();
              if (filter === 'daily') {
                return saleDate.getDate() === now.getDate() && saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
              }
              if (filter === 'weekly') {
                const msInWeek = 7 * 24 * 60 * 60 * 1000;
                return now.getTime() - saleDate.getTime() < msInWeek;
              }
              if (filter === 'monthly') {
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
              }
              return true;
            }).map(s => (
              <tr key={s._id} className="border-b">
                <td className="p-4">{new Date(s.saleDate).toLocaleString()}</td>
                <td className="p-4">{s.fruitId?.name || 'Unknown'}</td>
                <td className="p-4">{s.quantity} kg</td>
                <td className="p-4 font-bold">₹{s.totalAmount}</td>
                <td className={`p-4 font-bold ${s.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {s.profit >= 0 ? `+₹${s.profit}` : `-₹${Math.abs(s.profit)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
