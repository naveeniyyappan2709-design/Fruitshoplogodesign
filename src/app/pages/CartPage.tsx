import { useState, useEffect } from 'react';
import { useNavigate, Link } from '../navigation';
import { api } from '../utils/api';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

  const loadCart = () => {
    setCart(api.getCart());
  };

  useEffect(() => {
    loadCart();
    
    // Listen for cross-tab or component updates
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = (fruitId: string, qty: number) => {
    api.updateCartQuantity(fruitId, qty);
    loadCart();
  };

  const removeItem = (fruitId: string) => {
    api.removeFromCart(fruitId);
    loadCart();
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      api.clearCart();
      loadCart();
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.fruit.sellingPrice * item.quantity), 0);
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponMsg({ text: 'Validating...', type: 'info' });
      const res = await api.validateCoupon(couponCode, subtotal);
      setDiscount(res.discount);
      setAppliedCoupon(res.coupon_code);
      setCouponMsg({ text: 'Coupon applied successfully!', type: 'success' });
    } catch (e: any) {
      setCouponMsg({ text: e.message, type: 'error' });
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

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
                <div key={item.fruit._id} className="p-6 flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0">
                    <ImageWithFallback src={item.fruit.image_url} alt={item.fruit.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/product/${item.fruit._id}`}>
                      <h4 className="font-bold text-orange-950 text-lg hover:text-orange-600 transition-colors">
                        {item.fruit.name}
                      </h4>
                    </Link>
                    <p className="text-gray-500 text-sm mb-2">{item.fruit.unit}</p>
                    <p className="font-black text-orange-600">₹{item.fruit.sellingPrice}</p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.fruit._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          if (item.quantity < item.fruit.quantity) {
                            updateQuantity(item.fruit._id, item.quantity + 1);
                          } else {
                            alert(`Only ${item.fruit.quantity} items available in stock.`);
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.fruit._id)}
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
              
              {/* Coupon Section */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none uppercase"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-200 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg.text && (
                  <p className={`text-xs mt-2 ${couponMsg.type === 'error' ? 'text-red-500' : couponMsg.type === 'success' ? 'text-green-600' : 'text-blue-500'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 pt-2">
                  <span>Discount ({appliedCoupon})</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-900 text-lg">Grand Total</span>
              <span className="font-black text-3xl text-orange-600">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout', { state: { subtotal, deliveryFee, discount, coupon_code: appliedCoupon, grandTotal } })}
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
