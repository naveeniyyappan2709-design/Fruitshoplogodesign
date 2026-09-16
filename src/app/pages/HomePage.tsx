import { useState, useEffect } from 'react';
import { Link } from '../navigation';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { 
  ArrowRight, 
  TrendingUp, 
  BadgeIndianRupee as IndianRupee, 
  Star, 
  Quote, 
  TrendingDown, 
  ShoppingBag,
  Zap,
  CheckCircle2,
  Users,
  Phone,
  Gift
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

import { LocalDB, Fruit, Review } from '../utils/localStorageDB';

interface SiteReview {
  _id: string;
  user_id: { name: string };
  rating: number;
  comment: string;
}

export default function HomePage() {
  const { isAuthenticated, token } = useAuth();
  const [trending, setTrending] = useState<Fruit[]>([]);
  const [budget, setBudget] = useState<Fruit[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [siteReviews, setSiteReviews] = useState<SiteReview[]>([]);
  const [siteAvgRating, setSiteAvgRating] = useState(0);
  const [siteTotalReviews, setSiteTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // New review form state
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSiteReviews = async () => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('fruitReviews') || '[]');
      const siteRev = allReviews.filter((r: any) => !r.fruit_id); // General site reviews
      
      const total = siteRev.length;
      const avg = total > 0 ? siteRev.reduce((acc: number, r: any) => acc + r.rating, 0) / total : 4.5;
      
      setSiteReviews(siteRev);
      setSiteAvgRating(avg);
      setSiteTotalReviews(total);
    } catch (err) {
      console.error('Failed to fetch site reviews:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allFruits = LocalDB.getProducts();
        
        // Mock recommendation logic
        const sortedByRating = [...allFruits].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTrending(sortedByRating.slice(0, 4));
        
        const sortedByPrice = [...allFruits].sort((a, b) => a.price - b.price);
        setBudget(sortedByPrice.slice(0, 4));
        
        const allReviews = JSON.parse(localStorage.getItem('fruitReviews') || '[]');
        setReviews(allReviews.filter((r: any) => r.fruit_id));
        
        await fetchSiteReviews();
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitSiteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmittingReview(true);
    try {
      const allReviews = JSON.parse(localStorage.getItem('fruitReviews') || '[]');
      const sessionUserStr = localStorage.getItem('fruitSession');
      const sessionUser = sessionUserStr ? JSON.parse(sessionUserStr) : null;
      
      allReviews.push({
        _id: Date.now().toString(),
        user_id: { name: sessionUser?.name || 'Anonymous' },
        rating: newReviewRating,
        comment: newReviewComment
      });
      
      localStorage.setItem('fruitReviews', JSON.stringify(allReviews));
      
      setNewReviewComment('');
      setNewReviewRating(5);
      fetchSiteReviews();
    } catch (err) {
      console.error('Failed to submit site review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Glassmorphism */}
      <section className="relative h-[500px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop"
            alt="Fresh colorful fruits"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-orange-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
            <Badge className="mb-4 bg-amber-400 text-orange-950 hover:bg-amber-300 transition-colors uppercase tracking-widest font-black px-4 py-1">
              EST. 1985
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
              Freshness <br /> 
              <span className="text-amber-400">Delivered</span> Daily
            </h1>
            <p className="text-xl text-orange-50 mb-8 max-w-lg leading-relaxed font-medium">
              Discover the finest handpicked fruits from local organic farms. Premium quality, honest prices, delivered to your doorstep.
            </p>
            <div className="flex gap-4">
              <Link to="/collection">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1">
                  Start Shopping <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Daily Stats Card */}
        <div className="absolute bottom-8 right-8 hidden lg:block z-20">
          <Card className="bg-white/90 backdrop-blur-xl border-none shadow-2xl w-64 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3 text-orange-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tighter">Market Trends Today</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Mangoes</span>
                  <span className="text-xs font-bold text-green-600">↑ 24% sale</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Bananas</span>
                  <span className="text-xs font-bold text-amber-600">Popular</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Apples</span>
                  <span className="text-xs font-bold text-blue-600">Fresh Stock</span>
                </div>
              </div>
            </CardContent>
            <div className="bg-orange-600 p-2 text-center">
              <p className="text-[10px] text-white font-bold tracking-widest uppercase">Live Market Data</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="bg-white border-b border-orange-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-orange-950">Fast Delivery</h4>
                <p className="text-xs text-orange-700/60 font-medium">Same day in 5km</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-green-100 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-orange-950">Quality Checks</h4>
                <p className="text-xs text-orange-700/60 font-medium">100% Organic certified</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-orange-950">Best Prices</h4>
                <p className="text-xs text-orange-700/60 font-medium">Direct farm to home</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-orange-950">Happy Clients</h4>
                <p className="text-xs text-orange-700/60 font-medium">5000+ Regular users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 w-full flex flex-col gap-24">
        
        {/* Trending Section - "Daily Sales Info" */}
        <section>
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-1 bg-orange-500 rounded-full" />
                <span className="text-orange-600 font-bold tracking-widest uppercase text-xs">Market Hot Picks</span>
              </div>
              <h2 className="text-4xl font-black text-orange-950">Daily Sales Trends</h2>
              <p className="text-orange-700/70 mt-2 font-medium">The most wanted fruits in your neighborhood today.</p>
            </div>
            <Link to="/collection" className="text-orange-600 font-bold hover:underline flex items-center gap-1 group transition-all">
              See all fruits <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trending.map((fruit) => (
              <div key={fruit.id} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <Card className="relative h-full border-none shadow-xl shadow-orange-900/5 rounded-3xl overflow-hidden group-hover:shadow-2xl group-hover:shadow-orange-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                  <Link to={`/product/${fruit.id}`} className="block flex-1">
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <ImageWithFallback
                        src={fruit.image_url}
                        alt={fruit.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-orange-500/20 backdrop-blur-md text-orange-950 border-none font-black px-3 py-1 text-xs">
                          {fruit.rating} ★
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-orange-950/80 to-transparent">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{fruit.category}</p>
                        <h3 className="text-2xl font-black text-white">{fruit.name}</h3>
                      </div>
                    </div>
                  </Link>
                  <div className="p-6 bg-white flex justify-between items-center mt-auto border-t border-orange-50">
                    <div>
                      <span className="text-3xl font-black text-orange-950">₹{fruit.price}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1">/{fruit.unit.replace('per ', '')}</span>
                    </div>
                    <button 
                      onClick={() => {
                        LocalDB.addToCart(fruit, 1);
                        alert(`${fruit.name} added to cart`);
                      }}
                      disabled={fruit.stock_kg <= 0}
                      className={`p-3 rounded-2xl transition-all ${fruit.stock_kg > 0 ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="relative rounded-[3rem] overflow-hidden py-16 px-6 text-center">
          <div className="absolute inset-0 z-0">
             <ImageWithFallback
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop"
                alt="Farmer picking fruit"
                className="w-full h-full object-cover opacity-20"
              />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500 -z-10" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Bulk Orders for Your Business?</h2>
            <p className="text-orange-100 mb-8 text-lg font-medium opacity-90">
              We provide special pricing and scheduled deliveries for restaurants, hotels, and events. Get the freshest stock at wholesale rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bulk-order">
                <button className="w-full bg-white text-orange-600 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
                  Bulk Order Pricing
                </button>
              </Link>
              <a href="tel:+918438487646">
                <button className="w-full border-2 border-white/30 text-white font-black px-8 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" /> Contact Sales
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Combo Deals Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="bg-purple-100 p-4 rounded-[2rem] text-purple-600">
               <Gift className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-orange-950">Combo Offers</h2>
              <p className="text-orange-700/70 font-medium">Smart ways to buy more and save more.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-purple-100 shadow-xl shadow-purple-900/5 bg-gradient-to-br from-white to-purple-50 p-8 rounded-[2rem] relative overflow-hidden group hover:border-purple-300 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Gift className="w-32 h-32 text-purple-900" />
              </div>
              <Badge className="bg-purple-600 text-white border-none mb-4 font-bold uppercase tracking-widest px-4 py-1">Save 15%</Badge>
              <h3 className="text-3xl font-black text-purple-950 mb-2">Breakfast Power Combo</h3>
              <p className="text-purple-700/70 font-medium mb-6">1kg Apples + 1 Dozen Bananas</p>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-purple-700">₹250</span>
                <span className="text-lg font-bold text-gray-400 line-through mb-1">₹295</span>
              </div>
              <button className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
                Add Combo to Cart
              </button>
            </Card>

            <Card className="border-2 border-amber-100 shadow-xl shadow-amber-900/5 bg-gradient-to-br from-white to-amber-50 p-8 rounded-[2rem] relative overflow-hidden group hover:border-amber-300 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-32 h-32 text-amber-900" />
              </div>
              <Badge className="bg-amber-500 text-white border-none mb-4 font-bold uppercase tracking-widest px-4 py-1">Save 20%</Badge>
              <h3 className="text-3xl font-black text-amber-950 mb-2">Juice Boost Box</h3>
              <p className="text-amber-700/70 font-medium mb-6">2kg Oranges + 1kg Sweet Lime</p>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-amber-600">₹320</span>
                <span className="text-lg font-bold text-gray-400 line-through mb-1">₹400</span>
              </div>
              <button className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
                Add Combo to Cart
              </button>
            </Card>
          </div>
        </motion.section>

        {/* Budget Friendly - "Affordable Suggestions" */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="bg-green-100 p-4 rounded-[2rem] text-green-600">
               <TrendingDown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-orange-950">Pocket-Friendly Picks</h2>
              <p className="text-orange-700/70 font-medium">High quality fruits at unbeatable neighborhood prices.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {budget.map((fruit) => (
              <Card key={fruit.id} className="border-none shadow-lg overflow-hidden flex flex-row group h-48 rounded-[2rem]">
                <div className="w-1/3 overflow-hidden">
                  <Link to={`/product/${fruit.id}`} className="block w-full h-full">
                    <ImageWithFallback
                      src={fruit.image_url}
                      alt={fruit.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                </div>
                <div className="flex-1 p-8 bg-gradient-to-r from-white to-orange-50 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] opacity-5">
                    <IndianRupee className="w-32 h-32 text-orange-900" />
                  </div>
                  <div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none mb-2 font-bold uppercase tracking-tighter">Budget Pick</Badge>
                    <Link to={`/product/${fruit.id}`}>
                      <h3 className="text-2xl font-black text-orange-950 hover:text-orange-600 transition-colors">{fruit.name}</h3>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-green-700">₹{fruit.price}</span>
                      <span className="text-sm font-bold text-gray-400">/{fruit.unit.replace('per ', '')}</span>
                    </div>
                    <button 
                      onClick={() => {
                        LocalDB.addToCart(fruit, 1);
                        alert(`${fruit.name} added to cart`);
                      }}
                      disabled={fruit.stock_kg <= 0}
                      className="font-black text-sm text-orange-600 hover:translate-x-2 transition-transform underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
                      {fruit.stock_kg > 0 ? 'Grab Deal' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Reviews Section - "Customer Ratings" */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-orange-950 rounded-[4rem] p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Quote className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <span className="text-amber-400 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Testimonials</span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">What Our Customers Say</h2>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review) => (
                <Card key={review._id} className="bg-white/5 border-white/10 backdrop-blur-sm rounded-[2.5rem] p-8 text-white hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-14 h-14 border-2 border-amber-400/50 p-1">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id?.name}`} />
                      <AvatarFallback className="bg-orange-800 text-white font-bold">{review.user_id?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-black text-white leading-none">{review.user_id?.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-orange-50/70 font-medium leading-relaxed italic">
                    "{review.comment}"
                  </p>
                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                      <img src={review.fruit_id?.image_url} alt={review.fruit_id?.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest">Reviewed {review.fruit_id?.name}</span>
                  </div>
                </Card>
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="text-center text-orange-200/50 py-10">
                <p className="font-bold">Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Newsletter / Final CTA */}
      <section className="bg-white py-24 px-6 border-t border-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10 flex justify-center">
             <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 scale-150 animate-pulse" />
                <div className="relative bg-orange-500 text-white p-6 rounded-[2.5rem]">
                   <ShoppingBag className="w-12 h-12" />
                </div>
             </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-orange-950 mb-6">Stay Fresh, Every Single Day</h2>
          <p className="text-orange-700/60 text-xl font-medium mb-10 max-w-2xl mx-auto">
            Experience the difference of real, organic farm-fresh fruits. Order now and get free delivery on your first purchase.
          </p>
          <Link to="/collection">
             <button className="bg-orange-950 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-orange-800 transition-all shadow-2xl hover:shadow-orange-900/20 transform hover:scale-105">
                Go to Fruit Market
             </button>
          </Link>
        </div>
      </section>

      {/* Rate Our Site Section */}
      <section className="bg-orange-50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-orange-950 mb-4">Rate Your Experience</h2>
            <p className="text-orange-700/80 text-lg mb-8 font-medium">
              We constantly strive to improve our fruit shop. Let us know how we did!
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-5xl font-black text-orange-900">{siteAvgRating.toFixed(1)}</div>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(siteAvgRating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">
                  Based on {siteTotalReviews} reviews
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <form onSubmit={submitSiteReview} className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100">
                <h3 className="font-bold text-orange-950 mb-4">Leave a Review</h3>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`transition-transform hover:scale-110 ${newReviewRating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-4 bg-orange-50 border-none rounded-2xl mb-4 focus:ring-2 focus:ring-orange-500 resize-none h-24"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-orange-100 p-6 rounded-3xl text-center border border-orange-200">
                <p className="font-bold text-orange-900 mb-4">Log in to leave a review!</p>
                <Link to="/login">
                  <button className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700 transition-colors">
                    Login Now
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-orange-900 text-xl mb-6">Recent Site Reviews</h3>
            {siteReviews.length > 0 ? (
              siteReviews.slice(0, 3).map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-orange-950 flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-100 text-orange-700">{review.user_id?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      {review.user_id?.name}
                    </div>
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium italic">"{review.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 font-medium">No site reviews yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

