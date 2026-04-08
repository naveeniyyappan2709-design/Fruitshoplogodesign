import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Apple, Leaf, Phone, Mail } from 'lucide-react';

const fruits = [
  {
    name: 'Bananas',
    price: '₹40',
    unit: 'per dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
    alt: 'Fresh Bananas'
  },
  {
    name: 'Mangoes',
    price: '₹120',
    unit: 'per kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
    alt: 'Fresh Mangoes'
  },
  {
    name: 'Guavas',
    price: '₹60',
    unit: 'per kg',
    image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600',
    alt: 'Fresh Guavas'
  },
  {
    name: 'Seasonal Mix',
    price: '₹80',
    unit: 'per kg',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
    alt: 'Seasonal Fruits'
  }
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200"
          alt="Fresh fruits display"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="text-white p-8 max-w-6xl mx-auto w-full">
            <h2 className="text-4xl font-bold mb-2">Fresh from the Market</h2>
            <p className="text-xl text-orange-200">Quality fruits at honest prices</p>
          </div>
        </div>
      </section>

      {/* Fruits Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-orange-900 mb-2">Today's Fresh Selection</h2>
          <p className="text-orange-700">Handpicked daily from local markets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fruits.map((fruit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <ImageWithFallback
                  src={fruit.image}
                  alt={fruit.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 bg-gradient-to-b from-white to-orange-50">
                <h3 className="text-xl font-bold text-orange-900 mb-1">{fruit.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-700">{fruit.price}</span>
                  <span className="text-sm text-gray-600">{fruit.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900">Why Choose Us?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🍌</div>
              <h4 className="font-bold text-orange-900 mb-1">Farm Fresh</h4>
              <p className="text-gray-600">Directly sourced from local farms</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold text-orange-900 mb-1">Fair Prices</h4>
              <p className="text-gray-600">Best value in the neighborhood</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🌞</div>
              <h4 className="font-bold text-orange-900 mb-1">Daily Fresh</h4>
              <p className="text-gray-600">New stock every morning</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
