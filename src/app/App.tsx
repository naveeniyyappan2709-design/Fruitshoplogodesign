import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Apple, Leaf, Phone, Mail } from 'lucide-react';

export default function App() {
  const fruits = [
    {
      name: 'Bananas',
      price: '₹40',
      unit: 'per dozen',
      image: 'https://images.unsplash.com/photo-1768741145043-9e67ec5da2d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHJlZXQlMjBmcnVpdCUyMG1hcmtldCUyMHZlbmRvciUyMGJhbmFuYXMlMjBtYW5nb2VzfGVufDF8fHx8MTc3NTUzODA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      alt: 'Fresh Bananas'
    },
    {
      name: 'Mangoes',
      price: '₹120',
      unit: 'per kg',
      image: 'https://images.unsplash.com/photo-1739125875513-86e442b75864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmcnVpdCUyMHZlbmRvciUyMHNob3AlMjByb2Fkc2lkZSUyMG1hcmtldCUyMEluZGlhfGVufDF8fHx8MTc3NTUzODA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      alt: 'Fresh Mangoes'
    },
    {
      name: 'Guavas',
      price: '₹60',
      unit: 'per kg',
      image: 'https://images.unsplash.com/photo-1739125875303-f95270e3d4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmcnVpdCUyMHZlbmRvciUyMHNob3AlMjByb2Fkc2lkZSUyMG1hcmtldCUyMEluZGlhfGVufDF8fHx8MTc3NTUzODA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      alt: 'Fresh Guavas'
    },
    {
      name: 'Seasonal Mix',
      price: '₹80',
      unit: 'per kg',
      image: 'https://images.unsplash.com/photo-1677431647033-5dc05838ba54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBzdHJlZXQlMjBmcnVpdCUyMG1hcmtldCUyMHZlbmRvciUyMGJhbmFuYXMlMjBtYW5nb2VzfGVufDF8fHx8MTc3NTUzODA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      alt: 'Seasonal Fruits'
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with Logo */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3 shadow-md">
                <div className="flex items-center justify-center">
                  <Apple className="w-8 h-8 text-orange-600" />
                  <Leaf className="w-6 h-6 text-green-600 -ml-2" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Fresh Fruit Corner</h1>
                <p className="text-orange-100">रोज़ ताज़ा फल • Daily Fresh Fruits</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a href="tel:+918438487646" className="flex items-center gap-2 hover:text-orange-100 transition-colors">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">+91 84384 87646</span>
              </a>
              <a href="mailto:naveeniyyappan2709@gmail.com" className="flex items-center gap-2 hover:text-orange-100 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="text-sm">naveeniyyappan2709@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1760791632566-f42c29df7818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHJlZXQlMjBmcnVpdCUyMG1hcmtldCUyMHZlbmRvciUyMGJhbmFuYXMlMjBtYW5nb2VzfGVufDF8fHx8MTc3NTUzODA3NXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Street vendor selling fresh fruits"
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
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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

        {/* Additional Market Photo */}
        <div className="mt-12 rounded-xl overflow-hidden shadow-xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1711153468168-0a4fc13c0ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxmcnVpdCUyMHZlbmRvciUyMHNob3AlMjByb2Fkc2lkZSUyMG1hcmtldCUyMEluZGlhfGVufDF8fHx8MTc3NTUzODA3Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Busy roadside fruit market"
            className="w-full h-64 object-cover"
          />
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

      {/* Footer */}
      <footer className="bg-orange-900 text-orange-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-xl font-bold mb-2">Open Daily: 6:00 AM - 9:00 PM</p>
            <p className="text-sm text-orange-300">Serving fresh fruits to the community since 1985</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t border-orange-700">
            <a href="tel:+918438487646" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">+91 84384 87646</span>
            </a>
            <span className="hidden md:inline text-orange-700">|</span>
            <a href="mailto:naveeniyyappan2709@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
              <span>naveeniyyappan2709@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
