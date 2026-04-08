import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Search, Filter, ShoppingCart, Loader2, Plus, Minus, Leaf } from 'lucide-react';

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

interface CartItem {
  fruit: Fruit;
  quantity: number;
}

export default function FruitCollectionPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartNotice, setShowCartNotice] = useState('');

  useEffect(() => {
    fetchFruits();
  }, [selectedCategory, searchQuery]);

  const fetchFruits = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`${API_URL}/fruits?${params}`);
      const data = await res.json();
      setFruits(data.fruits);
    } catch (err) {
      console.error('Failed to fetch fruits:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (fruit: Fruit) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.fruit.id === fruit.id);
      if (existing) {
        return prev.map(item =>
          item.fruit.id === fruit.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.fruit.stock_kg) }
            : item
        );
      }
      return [...prev, { fruit, quantity: 1 }];
    });
    setShowCartNotice(fruit.name);
    setTimeout(() => setShowCartNotice(''), 2000);
  };

  const updateCartQuantity = (fruitId: number, delta: number) => {
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

  const cartTotal = cart.reduce((sum, item) => sum + item.fruit.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const goToBulkOrder = () => {
    // Store cart in sessionStorage for the bulk order page
    sessionStorage.setItem('bulkOrderCart', JSON.stringify(cart));
    navigate('/bulk-order');
  };

  const categories = [
    { value: 'all', label: 'All Fruits', emoji: '🍎' },
    { value: 'everyday', label: 'Everyday', emoji: '🍌' },
    { value: 'seasonal', label: 'Seasonal', emoji: '🥭' },
    { value: 'exotic', label: 'Exotic', emoji: '🐉' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          <Leaf className="w-4 h-4" />
          Fresh Collection
        </div>
        <h1 className="text-4xl font-bold text-orange-900 mb-2">Our Fruit Collection</h1>
        <p className="text-orange-600 text-lg">Browse our complete selection of fresh, handpicked fruits</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
          <input
            type="text"
            placeholder="Search fruits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-900 placeholder-orange-300 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-3 rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
                selectedCategory === cat.value
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-orange-700 border border-orange-200 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Notice */}
      {showCartNotice && (
        <div className="fixed top-24 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          ✓ {showCartNotice} added to cart
        </div>
      )}

      {/* Fruits Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      ) : fruits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍊</div>
          <h3 className="text-xl font-semibold text-orange-900 mb-2">No fruits found</h3>
          <p className="text-orange-600">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fruits.map((fruit) => {
            const inCart = cart.find(item => item.fruit.id === fruit.id);
            return (
              <div
                key={fruit.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-50 hover:border-orange-200 group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <ImageWithFallback
                    src={fruit.image_url}
                    alt={fruit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      fruit.category === 'exotic'
                        ? 'bg-purple-100 text-purple-700'
                        : fruit.category === 'seasonal'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {fruit.category}
                    </span>
                  </div>
                  {fruit.stock_kg < 50 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                        Low Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-orange-900 mb-1">{fruit.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{fruit.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-700">₹{fruit.price}</span>
                      <span className="text-sm text-gray-500 ml-1">/{fruit.unit.replace('per ', '')}</span>
                    </div>
                    <span className="text-xs text-gray-400">{fruit.stock_kg}kg available</span>
                  </div>

                  {/* Cart Controls */}
                  <div className="mt-4">
                    {inCart ? (
                      <div className="flex items-center justify-between bg-orange-50 rounded-xl p-2">
                        <button
                          onClick={() => updateCartQuantity(fruit.id, -1)}
                          className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-orange-900 text-lg">
                          {inCart.quantity} {fruit.unit.replace('per ', '')}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(fruit.id, 1)}
                          className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(fruit)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 min-w-[320px] max-w-lg">
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 bg-amber-400 text-orange-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{cartItemCount} items</p>
            <p className="text-orange-200 text-sm">Total: ₹{cartTotal.toFixed(0)}</p>
          </div>
          <button
            onClick={goToBulkOrder}
            className="bg-amber-400 text-orange-900 px-5 py-2.5 rounded-xl font-bold hover:bg-amber-300 transition-colors"
          >
            Place Order →
          </button>
        </div>
      )}
    </div>
  );
}
