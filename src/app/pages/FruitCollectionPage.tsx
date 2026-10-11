import { useState, useEffect } from 'react';
import { useNavigate } from '../navigation';
import { Link } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Search, Filter, ShoppingCart, Loader2, Plus, Minus, Leaf, Heart, Star, Zap } from 'lucide-react';
import { api } from '../utils/api';

export default function FruitCollectionPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fruits, setFruits] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => new URLSearchParams(window.location.search).get('category') || 'all');
  const [sort, setSort] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCartNotice, setShowCartNotice] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFruits();
    }, 300); // 300ms delay for search
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sort]);

  useEffect(() => {
    // Initial cart load
    setCart(api.getCart());
    const handleCartUpdate = () => setCart(api.getCart());
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchFruits = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(searchQuery, selectedCategory, sort);
      setFruits(data);
      if (data.length === 0) {
        const popular = await api.getProducts('', 'all', 'popular');
        setSuggestions(popular.slice(0, 4));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch fruits:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (fruit: any) => {
    api.addToCart(fruit, 1);
    setShowCartNotice(fruit.name);
    setTimeout(() => setShowCartNotice(''), 2000);
  };

  const handleBuyNow = (fruit: any) => {
    navigate('/checkout', {
      state: {
        buyNowItem: { fruit, quantity: 1 },
        subtotal: fruit.sellingPrice,
        deliveryFee: fruit.sellingPrice < 500 ? 50 : 0
      }
    });
  };

  const updateCartQuantity = (fruitId: string, delta: number) => {
    const item = cart.find(i => i.fruit._id === fruitId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty > item.fruit.quantity) {
      alert(`Only ${item.fruit.quantity} available in stock.`);
      return;
    }
    
    api.updateCartQuantity(fruitId, newQty);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.fruit.sellingPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const goToCart = () => {
    navigate('/cart');
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

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 md:sticky top-24">
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-orange-50 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </div>

            {/* Categories */}
            <h3 className="font-bold text-orange-950 mb-3 flex items-center gap-2"><Filter className="w-4 h-4"/> Categories</h3>
            <div className="flex flex-col gap-2 mb-8">
              {categories.map((cat) => (
                <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    checked={selectedCategory === cat.value}
                    onChange={() => setSelectedCategory(cat.value)}
                  />
                  <span className={`text-sm ${selectedCategory === cat.value ? 'font-bold text-orange-700' : 'text-gray-600 group-hover:text-orange-600'}`}>
                    {cat.emoji} {cat.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Sort */}
            <h3 className="font-bold text-orange-950 mb-3">Sort By</h3>
            <div className="flex flex-col gap-2">
              {[
                { value: '', label: 'Featured' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'popular', label: 'Best Sellers' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sort" 
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    checked={sort === opt.value}
                    onChange={() => setSort(opt.value)}
                  />
                  <span className={`text-sm ${sort === opt.value ? 'font-bold text-orange-700' : 'text-gray-600 group-hover:text-orange-600'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content: Grid */}
        <div className="flex-1">
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
        <div className="py-10">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🍊</div>
            <h3 className="text-xl font-semibold text-orange-900 mb-2">No fruits found for your search.</h3>
            <p className="text-orange-600">Try a different search or category, or check out our popular fruits below.</p>
          </div>
          {suggestions.length > 0 && (
            <div>
              <h4 className="text-2xl font-bold text-orange-950 mb-6 border-b border-orange-100 pb-4">Suggestions You Might Like</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {suggestions.map((fruit) => {
                  const inCart = cart.find(item => item.fruit._id === fruit._id);
                  return (
                    <div
                      key={fruit._id}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-50 hover:border-orange-200 group flex flex-col"
                    >
                      <Link to={`/product/${fruit._id}`} className="block relative aspect-square overflow-hidden">
                        <ImageWithFallback
                          src={fruit.image_url}
                          alt={fruit.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {fruit.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10 shadow-sm">
                            {fruit.discount}% OFF
                          </div>
                        )}
                        {!fruit.discount && fruit.category && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                              fruit.category === 'exotic'
                                ? 'bg-purple-100 text-purple-700'
                                : fruit.category === 'seasonal'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {fruit.category}
                            </span>
                          </div>
                        )}
                        
                        {fruit.quantity === 0 ? (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] z-20">
                             <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg transform -rotate-12 border-2 border-white shadow-xl">
                               OUT OF STOCK
                             </span>
                          </div>
                        ) : fruit.quantity < 10 ? (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 shadow-sm border border-red-200">
                              Only {fruit.quantity} left
                            </span>
                          </div>
                        ) : null}
                      </Link>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-orange-900 line-clamp-1 flex-1 pr-2">{fruit.name}</h3>
                          {fruit.rating > 0 && (
                            <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded text-sm font-semibold text-orange-700">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {fruit.rating}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">{fruit.description}</p>
                        
                        <div className="flex items-end justify-between mt-auto mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-green-700">₹{fruit.sellingPrice}</span>
                              {fruit.discount > 0 && fruit.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">₹{fruit.originalPrice}</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">/{fruit.unit.replace('per ', '')}</span>
                          </div>
                          <span className="text-xs text-gray-400">{fruit.quantity}kg available</span>
                        </div>

                        {/* Cart Controls */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          {inCart ? (
                            <div className="flex items-center justify-between bg-orange-50 rounded-xl p-2 border border-orange-100">
                              <button
                                onClick={() => updateCartQuantity(fruit._id, -1)}
                                className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-orange-900 text-lg">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(fruit._id, 1)}
                                disabled={inCart.quantity >= fruit.quantity}
                                className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => addToCart(fruit)}
                                disabled={fruit.quantity === 0}
                                className="flex-1 bg-white border border-orange-500 text-orange-600 py-2.5 rounded-xl font-semibold hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingCart className="w-4 h-4" /> Add
                              </button>
                              <button
                                onClick={() => handleBuyNow(fruit)}
                                disabled={fruit.quantity === 0}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-1"
                              >
                                <Zap className="w-4 h-4 shrink-0" /> Buy Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fruits.map((fruit) => {
            const inCart = cart.find(item => item.fruit._id === fruit._id);
            return (
              <div
                key={fruit._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-50 hover:border-orange-200 group flex flex-col"
              >
                <Link to={`/product/${fruit._id}`} className="block relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={fruit.image_url}
                    alt={fruit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {fruit.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10 shadow-sm">
                      {fruit.discount}% OFF
                    </div>
                  )}
                  {!fruit.discount && fruit.category && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                        fruit.category === 'exotic'
                          ? 'bg-purple-100 text-purple-700'
                          : fruit.category === 'seasonal'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {fruit.category}
                      </span>
                    </div>
                  )}
                  
                  {fruit.quantity === 0 ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] z-20">
                       <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg transform -rotate-12 border-2 border-white shadow-xl">
                         OUT OF STOCK
                       </span>
                    </div>
                  ) : fruit.quantity < 10 ? (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 shadow-sm border border-red-200">
                        Only {fruit.quantity} left
                      </span>
                    </div>
                  ) : null}
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-orange-900 line-clamp-1 flex-1 pr-2">{fruit.name}</h3>
                    {fruit.rating > 0 && (
                      <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded text-sm font-semibold text-orange-700">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {fruit.rating}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">{fruit.description}</p>
                  
                  <div className="flex items-end justify-between mt-auto mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-700">₹{fruit.sellingPrice}</span>
                        {fruit.discount > 0 && fruit.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">₹{fruit.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">/{fruit.unit.replace('per ', '')}</span>
                    </div>
                    <span className="text-xs text-gray-400">{fruit.quantity}kg available</span>
                  </div>

                  {/* Cart Controls */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {inCart ? (
                      <div className="flex items-center justify-between bg-orange-50 rounded-xl p-2 border border-orange-100">
                        <button
                          onClick={() => updateCartQuantity(fruit._id, -1)}
                          className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-orange-900 text-lg">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(fruit._id, 1)}
                          disabled={inCart.quantity >= fruit.quantity}
                          className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(fruit)}
                          disabled={fruit.quantity === 0}
                          className="flex-1 bg-white border border-orange-500 text-orange-600 py-2.5 rounded-xl font-semibold hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add
                        </button>
                        <button
                          onClick={() => handleBuyNow(fruit)}
                          disabled={fruit.quantity === 0}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-1"
                        >
                          <Zap className="w-4 h-4 shrink-0" /> Buy Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      </div> {/* End Right Content */}
      </div> {/* End Layout */}

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
            onClick={goToCart}
            className="bg-amber-400 text-orange-900 px-5 py-2.5 rounded-xl font-bold hover:bg-amber-300 transition-colors"
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
}
