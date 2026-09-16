import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { LocalDB, CartItem } from '../utils/localStorageDB';
import { ShoppingCart, CheckCircle, IndianRupee, MapPin, Truck, ChevronRight } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    const currentCart = LocalDB.getCart();
    if (currentCart.length === 0) {
      navigate('/collection');
    }
    setCart(currentCart);
  }, [isAuthenticated, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + (item.fruit.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    
    // Simulate network delay
    setTimeout(() => {
      const orderId = LocalDB.createOrder({
        total_amount: grandTotal,
        delivery_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        phone: formData.phone,
        notes: `Payment: ${formData.paymentMethod.toUpperCase()}`,
        customer_name: formData.name,
        customer_email: user?.email || '',
        items: cart.map(c => ({
          id: c.fruit.id,
          fruit_name: c.fruit.name,
          quantity: c.quantity,
          price_at_order: c.fruit.price,
          unit: c.fruit.unit,
          image_url: c.fruit.image_url
        }))
      });
      
      LocalDB.clearCart();
      setOrderConfirmed(orderId);
      setIsPlacingOrder(false);
    }, 1500);
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-orange-950 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 text-lg mb-2">Thank you for your purchase, {formData.name}.</p>
        <p className="text-gray-500 mb-8">Your Order ID is: <span className="font-bold text-orange-600">ORD-{orderConfirmed}</span></p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/orders">
            <button className="bg-orange-100 text-orange-700 font-bold px-6 py-3 rounded-xl hover:bg-orange-200 transition-colors">
              View Orders
            </button>
          </Link>
          <Link to="/collection">
            <button className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-orange-950 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            
            {/* Delivery Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
              <h2 className="text-xl font-bold text-orange-950 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Delivery Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address (House No, Street, Landmark)</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                  <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
              <h2 className="text-xl font-bold text-orange-950 mb-6 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-orange-500" /> Payment Method
              </h2>
              <div className="space-y-4">
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <div>
                      <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                </label>
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleInputChange} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <div>
                      <p className="font-bold text-gray-900">Demo UPI</p>
                      <p className="text-sm text-gray-500">Simulate a UPI payment</p>
                    </div>
                  </div>
                </label>
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <div>
                      <p className="font-bold text-gray-900">Demo Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Simulate a card payment</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 sticky top-24">
            <h3 className="font-bold text-orange-950 text-xl mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.fruit.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                    <img src={item.fruit.image_url} alt={item.fruit.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-900 text-sm line-clamp-1">{item.fruit.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₹{item.fruit.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 text-gray-600 font-medium border-t border-b border-orange-50 py-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-900 text-lg">Total to Pay</span>
              <span className="font-black text-3xl text-orange-600">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isPlacingOrder}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'} 
              {!isPlacingOrder && <ChevronRight className="w-5 h-5" />}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              <Truck className="w-4 h-4" /> Expected delivery in 45 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
