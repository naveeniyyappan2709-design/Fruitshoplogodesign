import { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { Plus, Check, X } from 'lucide-react';

export default function ReturnManagement() {
  const { token } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newReturn, setNewReturn] = useState({ saleId: '', quantity: 1, reason: '' });

  const fetchData = async () => {
    try {
      const [returnsRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/returns`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/sales`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (returnsRes.ok) setReturns((await returnsRes.json()).returns);
      if (salesRes.ok) setSales((await salesRes.json()).sales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createReturn = async () => {
    if (!newReturn.saleId || newReturn.quantity <= 0 || !newReturn.reason) return;
    try {
      const res = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newReturn)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewReturn({ saleId: '', quantity: 1, reason: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create return');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveReturn = async (id: string) => {
    if (!confirm('Approve return?')) return;
    try {
      await fetch(`${API_URL}/returns/${id}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch(err) { console.error(err); }
  };

  const rejectReturn = async (id: string) => {
    if (!confirm('Reject return?')) return;
    try {
      await fetch(`${API_URL}/returns/${id}/reject`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch(err) { console.error(err); }
  };

  const processRefund = async (id: string) => {
    if (!confirm('Process refund?')) return;
    try {
      await fetch(`${API_URL}/returns/${id}/refund`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch(err) { console.error(err); }
  };

  if (loading) return <div>Loading returns...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900">Manage Returns ({returns.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Return
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-4 rounded-xl shadow mb-6 border border-orange-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 font-semibold">Sale Reference</label>
            <select value={newReturn.saleId} onChange={e => setNewReturn({...newReturn, saleId: e.target.value})} className="border rounded p-2 max-w-xs">
              <option value="">Select Sale</option>
              {sales.map(s => (
                <option key={s._id} value={s._id}>
                  Sale on {new Date(s.saleDate).toLocaleDateString()} - {s.fruitId?.name} - {s.quantity}kg
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">Quantity (kg)</label>
            <input type="number" min="1" value={newReturn.quantity} onChange={e => setNewReturn({...newReturn, quantity: parseInt(e.target.value)})} className="border rounded p-2 w-32" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">Reason</label>
            <input type="text" value={newReturn.reason} onChange={e => setNewReturn({...newReturn, reason: e.target.value})} className="border rounded p-2" placeholder="e.g. damaged" />
          </div>
          <button onClick={createReturn} className="bg-green-600 text-white px-6 py-2 rounded">Submit Return</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50 text-left text-sm text-orange-900">
              <th className="p-4">Date</th>
              <th className="p-4">Fruit</th>
              <th className="p-4">Qty / Refund Amount</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
              <th className="p-4">Refund</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(r => (
              <tr key={r._id} className="border-b text-sm">
                <td className="p-4">{new Date(r.returnDate).toLocaleString()}</td>
                <td className="p-4">{r.fruitId?.name || 'Unknown'}</td>
                <td className="p-4">{r.quantity}kg / <span className="font-bold text-red-600">₹{r.refundAmount}</span></td>
                <td className="p-4">{r.reason}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded font-bold text-xs ${
                    r.returnStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                    r.returnStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{r.returnStatus}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded font-bold text-xs ${r.refundStatus === 'Refund Processed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {r.refundStatus}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {r.returnStatus === 'Pending' && (
                    <>
                      <button onClick={() => approveReturn(r._id)} className="p-1 bg-green-100 text-green-700 rounded"><Check className="w-4 h-4"/></button>
                      <button onClick={() => rejectReturn(r._id)} className="p-1 bg-red-100 text-red-700 rounded"><X className="w-4 h-4"/></button>
                    </>
                  )}
                  {r.returnStatus === 'Approved' && r.refundStatus === 'Refund Pending' && (
                    <button onClick={() => processRefund(r._id)} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Process Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
