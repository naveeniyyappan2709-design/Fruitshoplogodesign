import { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { RefreshCcw, Plus, TrendingDown } from 'lucide-react';

export default function ExpenseManagement() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', cost: 0, expenseDate: new Date().toISOString().split('T')[0] });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || newExpense.cost <= 0) return;
    
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewExpense({ description: '', cost: 0, expenseDate: new Date().toISOString().split('T')[0] });
        fetchExpenses();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add expense');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  };

  const totalLoss = expenses.reduce((sum, e) => sum + e.cost, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-red-600" />
          Manage Business Losses & Expenses
        </h2>
        <div className="flex gap-4">
          <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Loss Record
          </button>
          <button onClick={fetchExpenses} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={addExpense} className="bg-white p-6 rounded-xl shadow mb-6 border border-orange-100">
          <h3 className="font-bold text-orange-900 mb-4">Record New Loss (e.g. Damaged Fruits)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-sm mb-1 font-semibold text-gray-700">Reason / Description</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. 5kg damaged mangoes"
                value={newExpense.description} 
                onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                className="w-full border border-orange-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" 
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-semibold text-gray-700">Amount Lost (₹)</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={newExpense.cost} 
                onChange={e => setNewExpense({...newExpense, cost: Number(e.target.value)})} 
                className="w-full border border-orange-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" 
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-semibold text-gray-700">Date</label>
              <input 
                required 
                type="date" 
                value={newExpense.expenseDate} 
                onChange={e => setNewExpense({...newExpense, expenseDate: e.target.value})} 
                className="w-full border border-orange-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 rounded font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700">Record Loss</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Recorded Loss</p>
          <p className="text-3xl font-black text-red-600">₹{totalLoss.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading records...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-red-50 text-red-900 uppercase">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Reason / Description</th>
                <th className="p-4 font-semibold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(expense => (
                <tr key={expense._id} className="hover:bg-red-50/50">
                  <td className="p-4 text-gray-600">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {expense.description}
                  </td>
                  <td className="p-4 font-bold text-red-600 text-right">
                    ₹{expense.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No losses recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
