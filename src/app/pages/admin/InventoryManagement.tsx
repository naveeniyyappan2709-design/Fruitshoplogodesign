import { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { Plus, Archive } from 'lucide-react';

export default function InventoryManagement() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);
  const [stockForm, setStockForm] = useState({ fruit_id: '', quantity_to_add: 0, reason: '' });

  const fetchData = async () => {
    try {
      const [histRes, fruitRes] = await Promise.all([
        fetch(`${API_URL}/inventory/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/fruits?all=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (histRes.ok && fruitRes.ok) {
        const histData = await histRes.json();
        const fruitData = await fruitRes.json();
        setHistory(histData.history);
        setFruits(fruitData.fruits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/inventory/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockForm)
      });
      if (res.ok) {
        fetchData();
        setShowAddStock(false);
        setStockForm({ fruit_id: '', quantity_to_add: 0, reason: '' });
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900">Inventory & Stock History</h2>
        <button
          onClick={() => setShowAddStock(!showAddStock)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add/Remove Stock
        </button>
      </div>

      {showAddStock && (
        <form onSubmit={handleAddStock} className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-orange-900 mb-4">Update Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Select Fruit</label>
              <select required value={stockForm.fruit_id} onChange={e => setStockForm({...stockForm, fruit_id: e.target.value})} className="w-full border rounded p-2">
                <option value="">-- Select --</option>
                {fruits.map(f => (
                  <option key={f._id} value={f._id}>{f.name} (Current: {f.quantity})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Quantity (Use negative to remove)</label>
              <input required type="number" value={stockForm.quantity_to_add} onChange={e => setStockForm({...stockForm, quantity_to_add: parseFloat(e.target.value)})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Reason</label>
              <input required type="text" placeholder="e.g. New shipment, Damaged" value={stockForm.reason} onChange={e => setStockForm({...stockForm, reason: e.target.value})} className="w-full border rounded p-2" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Submit Update</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50 text-left">
              <th className="py-3 px-4 text-sm text-orange-900">Date</th>
              <th className="py-3 px-4 text-sm text-orange-900">Fruit</th>
              <th className="py-3 px-4 text-sm text-orange-900">Previous Stock</th>
              <th className="py-3 px-4 text-sm text-orange-900">Change</th>
              <th className="py-3 px-4 text-sm text-orange-900">New Stock</th>
              <th className="py-3 px-4 text-sm text-orange-900">Reason</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h._id} className="border-b">
                <td className="py-3 px-4">{new Date(h.created_at).toLocaleString()}</td>
                <td className="py-3 px-4 font-semibold">{h.fruit_id?.name || 'Unknown'}</td>
                <td className="py-3 px-4 text-gray-500">{h.previousStock}</td>
                <td className={`py-3 px-4 font-bold ${h.changeQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {h.changeQuantity > 0 ? '+' : ''}{h.changeQuantity}
                </td>
                <td className="py-3 px-4 font-bold">{h.newStock}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{h.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
