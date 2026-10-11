import { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function FruitManagement() {
  const { token } = useAuth();
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFruit, setEditingFruit] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchFruits = async () => {
    try {
      const res = await fetch(`${API_URL}/fruits?all=true`);
      if (res.ok) {
        const data = await res.json();
        setFruits(data.fruits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  const saveFruit = async (fruit: any) => {
    try {
      const isEdit = !!fruit._id;
      const url = isEdit ? `${API_URL}/fruits/${fruit._id}` : `${API_URL}/fruits`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fruit)
      });
      if (res.ok) {
        fetchFruits();
        setEditingFruit(null);
        setShowAdd(false);
      } else {
        alert('Failed to save fruit');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFruit = async (id: string) => {
    if (!confirm('Delete this fruit?')) return;
    try {
      const res = await fetch(`${API_URL}/fruits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchFruits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading fruits...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900">Manage Fruits ({fruits.length})</h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingFruit({
              name: '',
              description: '',
              purchasePrice: 0,
              sellingPrice: 0,
              unit: 'per kg',
              quantity: 0,
              image_url: '',
              category: 'everyday',
              status: 'Available',
              minStock: 10,
              originalPrice: 0,
              discount: 0,
              supplier: ''
            });
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Fruit
        </button>
      </div>

      {(showAdd || editingFruit) && editingFruit && (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-orange-900 mb-4">{editingFruit._id ? 'Edit Fruit' : 'Add New Fruit'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input value={editingFruit.name || ''} onChange={e => setEditingFruit({...editingFruit, name: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Purchase Price (₹)</label>
              <input type="number" value={editingFruit.purchasePrice || ''} onChange={e => setEditingFruit({...editingFruit, purchasePrice: parseFloat(e.target.value)})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Selling Price (₹)</label>
              <input type="number" value={editingFruit.sellingPrice || ''} onChange={e => setEditingFruit({...editingFruit, sellingPrice: parseFloat(e.target.value)})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Quantity (kg)</label>
              <input type="number" value={editingFruit.quantity || ''} onChange={e => setEditingFruit({...editingFruit, quantity: parseFloat(e.target.value)})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Minimum Stock Alert</label>
              <input type="number" value={editingFruit.minStock || ''} onChange={e => setEditingFruit({...editingFruit, minStock: parseFloat(e.target.value)})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Supplier</label>
              <input type="text" value={editingFruit.supplier || ''} onChange={e => setEditingFruit({...editingFruit, supplier: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Unit</label>
              <select value={editingFruit.unit || 'per kg'} onChange={e => setEditingFruit({...editingFruit, unit: e.target.value})} className="w-full border rounded p-2">
                <option value="per kg">per kg</option>
                <option value="per dozen">per dozen</option>
                <option value="per piece">per piece</option>
                <option value="per box">per box</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select value={editingFruit.status || 'Available'} onChange={e => setEditingFruit({...editingFruit, status: e.target.value})} className="w-full border rounded p-2">
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select value={editingFruit.category || 'everyday'} onChange={e => setEditingFruit({...editingFruit, category: e.target.value})} className="w-full border rounded p-2">
                <option value="everyday">Everyday</option>
                <option value="seasonal">Seasonal</option>
                <option value="exotic">Exotic</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-1">Image URL</label>
              <input value={editingFruit.image_url || ''} onChange={e => setEditingFruit({...editingFruit, image_url: e.target.value})} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => saveFruit(editingFruit)} className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2"><Check className="w-4 h-4"/> Save</button>
            <button onClick={() => { setEditingFruit(null); setShowAdd(false); }} className="bg-gray-200 px-6 py-2 rounded flex items-center gap-2"><X className="w-4 h-4"/> Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50 text-left">
              <th className="py-3 px-4 text-sm text-orange-900">Fruit</th>
              <th className="py-3 px-4 text-sm text-orange-900">Purchase / Selling (₹)</th>
              <th className="py-3 px-4 text-sm text-orange-900">Stock</th>
              <th className="py-3 px-4 text-sm text-orange-900">Status</th>
              <th className="py-3 px-4 text-sm text-orange-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fruits.map(f => (
              <tr key={f._id} className="border-b">
                <td className="py-3 px-4 font-semibold">{f.name}</td>
                <td className="py-3 px-4">₹{f.purchasePrice} / ₹{f.sellingPrice}</td>
                <td className={`py-3 px-4 font-bold ${f.quantity < 50 ? 'text-red-600' : 'text-gray-700'}`}>{f.quantity}</td>
                <td className="py-3 px-4">{f.status}</td>
                <td className="py-3 px-4 text-right flex justify-end gap-2">
                  <button onClick={() => setEditingFruit(f)} className="p-2 text-orange-500 bg-orange-50 rounded"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => deleteFruit(f._id)} className="p-2 text-red-500 bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
