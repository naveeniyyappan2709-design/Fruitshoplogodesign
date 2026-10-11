import { API_URL } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    endDate: '',
    usageLimit: 0,
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create coupon');
      
      setShowAdd(false);
      setFormData({
        code: '', type: 'percentage', value: 0, minOrder: 0, maxDiscount: 0, endDate: '', usageLimit: 0
      });
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-950 flex items-center gap-2">
          <Tag className="w-5 h-5" /> Coupon Management
        </h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="mb-8 bg-orange-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-orange-100">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Code</label>
            <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-2 rounded-lg border border-orange-200 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 rounded-lg border border-orange-200">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Value</label>
            <input required type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full p-2 rounded-lg border border-orange-200" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Min Order Amount (₹)</label>
            <input type="number" value={formData.minOrder} onChange={e => setFormData({...formData, minOrder: Number(e.target.value)})} className="w-full p-2 rounded-lg border border-orange-200" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">End Date</label>
            <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2 rounded-lg border border-orange-200" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-orange-600 text-white font-bold px-6 py-2 rounded-xl">Save Coupon</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-orange-50/50">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Code</th>
              <th className="p-4 font-semibold text-gray-600">Discount</th>
              <th className="p-4 font-semibold text-gray-600">Min Order</th>
              <th className="p-4 font-semibold text-gray-600">Expires</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {coupons.map(c => {
              const isExpired = new Date(c.endDate) < new Date();
              return (
                <tr key={c._id} className="hover:bg-orange-50/30">
                  <td className="p-4 font-bold text-orange-900">{c.code}</td>
                  <td className="p-4">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="p-4">₹{c.minOrder}</td>
                  <td className="p-4">{new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    {isExpired ? <span className="text-red-500 font-semibold text-sm">Expired</span> : <span className="text-green-600 font-semibold text-sm">Active</span>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(c._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
