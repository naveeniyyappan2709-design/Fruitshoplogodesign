import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, Phone, FileText, Loader2, CheckCircle, ArrowLeft, Package } from 'lucide-react';

interface Fruit {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock_kg: number;
  image_url: string;
}

interface CartItem {
  fruit: Fruit;
  quantity: number;
}

export default function BulkOrderPage() {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState<{ id: number; total: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load cart from sessionStorage if coming from collection page
    const savedCart = sessionStorage.getItem('bulkOrderCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
        sessionStorage.removeItem('bulkOrderCart');
      } catch {
        // ignored
      }
    }
  }, [isAuthenticated, navigate]);

  const updateQuantity = (fruitId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.fruit.id === fruitId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(newQty, item.fruit.stock_kg) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (fruitId: number) => {
    setCart(prev => prev.filter(item => item.fruit.id !== fruitId));
  };

  const setQuantity = (fruitId: number, value: string) => {
    const qty = parseFloat(value) || 0;
    setCart(prev =>
      prev.map(item =>
        item.fruit.id === fruitId
          ? { ...item, quantity: Math.min(Math.max(0, qty), item.fruit.stock_kg) }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.fruit.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            fruit_id: item.fruit.id,
            quantity: item.quantity
          })),
          delivery_address: address,
          phone: phone || undefined,
          notes: notes || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        setOrderPlaced({ id: data.order.id, total: data.order.total_amount });
        setCart([]);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-green-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-6">Your bulk order has been submitted successfully</p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-700">Order ID: <span className="font-bold">#{orderPlaced.id}</span></p>
            <p className="text-sm text-green-700">Total: <span className="font-bold">₹{orderPlaced.total.toFixed(0)}</span></p>
          </div>
          <p className="text-sm text-gray-500 mb-8">We'll call you to confirm delivery details.</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/collection')}
              className="flex-1 bg-orange-100 text-orange-700 py-3 rounded-xl font-semibold hover:bg-orange-200 transition-colors"
            >
              Order More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/collection')}
          className="w-10 h-10 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            Bulk Stock Order
          </h1>
          <p className="text-orange-600">Order fruits in bulk for your business or event</p>
        </div>
      </div>

      {cart.length === 0 && !orderPlaced ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <ShoppingCart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Browse our collection and add fruits to your order</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Browse Fruits
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-orange-900 mb-4">
              Cart Items ({cart.length})
            </h2>

            {cart.map((item) => (
              <div
                key={item.fruit.id}
                className="bg-white rounded-xl shadow-sm border border-orange-50 p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
              >
                <img
                  src={item.fruit.image_url}
                  alt={item.fruit.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-orange-900">{item.fruit.name}</h3>
                  <p className="text-green-700 font-semibold">₹{item.fruit.price} {item.fruit.unit}</p>
                  <p className="text-xs text-gray-400">Stock: {item.fruit.stock_kg}kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.fruit.id, -1)}
                    className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center hover:bg-orange-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.fruit.id, e.target.value)}
                    className="w-16 text-center py-1.5 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900"
                    min="1"
                    max={item.fruit.stock_kg}
                  />
                  <button
                    onClick={() => updateQuantity(item.fruit.id, 1)}
                    className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center hover:bg-orange-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-orange-900">₹{(item.fruit.price * item.quantity).toFixed(0)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.fruit.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary & Delivery */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-50 p-6">
              <h2 className="text-lg font-bold text-orange-900 mb-4">Delivery Details</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Delivery Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full delivery address..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 placeholder-orange-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 placeholder-orange-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 placeholder-orange-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.fruit.id} className="flex justify-between text-sm text-orange-100">
                    <span>{item.fruit.name} × {item.quantity}</span>
                    <span>₹{(item.fruit.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-orange-400 pt-3 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className="w-full bg-white text-orange-700 py-3.5 rounded-xl font-bold hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Place Order
                    <ShoppingCart className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
