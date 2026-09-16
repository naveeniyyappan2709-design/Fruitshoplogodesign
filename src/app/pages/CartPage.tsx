import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from '../navigation';
import { LocalDB, CartItem } from '../utils/localStorageDB';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = () => {
    setCart(LocalDB.getCart());
  };

  useEffect(() => {
    loadCart();
    
    // Listen for cross-tab or component updates
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = (fruitId: number, qty: number) => {
    LocalDB.updateCartQuantity(fruitId, qty);
    loadCart();
  };

  const removeItem = (fruitId: number) => {
    LocalDB.removeFromCart(fruitId);
    loadCart();
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      LocalDB.clearCart();
      loadCart();
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.fruit.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 50 : 0;
  const discount = 0; // Can implement logic later if needed
  const grandTotal = subtotal + deliveryFee - discount;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <ShoppingCart className="w-24 h-24 text-orange-200 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-orange-950 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any fresh fruits yet.</p>
        <Link to="/collection">
          <button className="bg-orange-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-orange-700 transition-colors">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-orange-950 mb-8 flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-orange-600" />
        Your Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="p-6 border-b border-orange-50 flex justify-between items-center">
              <h3 className="font-bold text-orange-900 text-lg">Items ({cart.length})</h3>
              <button onClick={clearCart} className="text-red-500 font-semibold text-sm hover:underline">
                Clear Cart
              </button>
            </div>
            
            <div className="divide-y divide-orange-50">
              {cart.map((item) => (
                <div key={item.fruit.id} className="p-6 flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0">
                    <img src={item.fruit.image_url} alt={item.fruit.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/product/${item.fruit.id}`}>
                      <h4 className="font-bold text-orange-950 text-lg hover:text-orange-600 transition-colors">
                        {item.fruit.name}
                      </h4>
                    </Link>
                    <p className="text-gray-500 text-sm mb-2">{item.fruit.unit}</p>
                    <p className="font-black text-orange-600">₹{item.fruit.price}</p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.fruit.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          if (item.quantity < item.fruit.stock_kg) {
                            updateQuantity(item.fruit.id, item.quantity + 1);
                          } else {
                            alert(`Only ${item.fruit.stock_kg} items available in stock.`);
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.fruit.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 sticky top-24">
            <h3 className="font-bold text-orange-950 text-xl mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-gray-600 font-medium border-b border-orange-50 pb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-900 text-lg">Grand Total</span>
              <span className="font-black text-3xl text-orange-600">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Secure checkout • Free delivery on orders over ₹500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
