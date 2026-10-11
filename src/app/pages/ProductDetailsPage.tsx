import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from '../navigation';
import { LocalDB } from '../utils/localStorageDB';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Star, ArrowLeft, ShoppingCart, Zap, IndianRupee, Minus, Plus, Heart } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

export default function ProductDetailsPage() {
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { isAuthenticated } = useAuth(); // Assuming useAuth can be imported or mock it. Wait, useAuth is in contexts.

  useEffect(() => {
    if (id) {
      api.getProductById(id).then(f => {
        setProduct(f);
        setLoading(false);
        // Fetch recommendations
        api.getProducts('', f.category).then(recs => {
          setRecommendations(recs.filter((p: any) => p._id !== f._id).slice(0, 4));
        });
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleWishlist = async () => {
    if (!isAuthenticated) return alert('Please login to add to wishlist');
    try {
      await api.toggleWishlist(product._id, true);
      alert('Added to wishlist!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-orange-600">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-orange-900 mb-4">Product Not Found</h2>
        <Link to="/collection" className="text-orange-600 hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      api.addToCart(product, quantity);
      alert(`${quantity} ${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      navigate('/checkout', {
        state: {
          buyNowItem: { fruit: product, quantity },
          subtotal: product.sellingPrice * quantity,
          deliveryFee: (product.sellingPrice * quantity) < 500 ? 50 : 0
        }
      });
    }
  };

  const incrementQty = () => {
    if (quantity < product.quantity) setQuantity(prev => prev + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const originalPrice = product.sellingPrice + Math.floor(product.sellingPrice * 0.2); // Fake 20% discount

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-600 font-semibold mb-8 hover:text-orange-800 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Product Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-orange-100 h-max">
          <button 
             onClick={handleWishlist}
             className="absolute top-4 right-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full text-gray-400 hover:text-red-500 shadow-md transition-colors"
             title="Add to Wishlist"
          >
            <Heart className="w-6 h-6" />
          </button>
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-red-600 text-white font-black text-3xl px-8 py-4 rounded-2xl transform -rotate-12 border-4 border-white shadow-2xl">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge className="bg-orange-100 text-orange-800 uppercase tracking-widest font-black mb-3 border-none shadow-none">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-orange-950 mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-gray-500 font-semibold text-sm">({product.rating || 5.0})</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-black text-green-700">₹{product.sellingPrice}</span>
              <span className="text-2xl font-bold text-gray-400 line-through">₹{originalPrice}</span>
            </div>
            <p className="text-orange-700/60 font-semibold text-lg">Unit: {product.unit}</p>
          </div>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Info */}
          <div className="mb-8">
            {product.quantity > 5 ? (
              <p className="text-green-600 font-bold flex items-center gap-2 bg-green-50 w-max px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                In Stock ({product.quantity} available)
              </p>
            ) : product.quantity > 0 ? (
              <p className="text-amber-600 font-bold flex items-center gap-2 bg-amber-50 w-max px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Only {product.quantity} left!
              </p>
            ) : (
              <p className="text-red-600 font-bold flex items-center gap-2 bg-red-50 w-max px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Currently Unavailable
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-2xl p-1 w-max shadow-inner">
                <button 
                  onClick={decrementQty}
                  disabled={product.quantity === 0}
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-bold text-xl text-orange-950">{quantity}</span>
                <button 
                  onClick={incrementQty}
                  disabled={product.quantity === 0 || quantity >= product.quantity}
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-500 font-semibold text-sm">
                Total: <span className="text-orange-900 font-black">₹{product.sellingPrice * quantity}</span>
              </p>
            </div>

            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 bg-white border-2 border-orange-500 text-orange-600 font-black py-4 rounded-2xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-6 h-6" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-16 pt-12 border-t border-orange-100">
          <h2 className="text-3xl font-black text-orange-950 mb-8">Related Fruits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(fruit => (
              <div key={fruit._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-50 group">
                <Link to={`/product/${fruit._id}`} className="block relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={fruit.image_url}
                    alt={fruit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="font-bold text-orange-900 line-clamp-1">{fruit.name}</h3>
                  <div className="flex items-end justify-between mt-2">
                    <span className="font-bold text-green-700">₹{fruit.sellingPrice}</span>
                    <button 
                      onClick={() => {
                        api.addToCart(fruit, 1);
                        alert('Added to cart');
                      }}
                      className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
