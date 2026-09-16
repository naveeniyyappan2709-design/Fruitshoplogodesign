export interface Fruit {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_kg: number;
  image_url: string;
  category: string;
  available: number;
  rating?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin';
  password?: string;
}

export interface CartItem {
  fruit: Fruit;
  quantity: number;
}

export interface OrderItem {
  id: number;
  fruit_name: string;
  quantity: number;
  price_at_order: number;
  unit: string;
  image_url: string;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
}

export interface Review {
  _id: string;
  user_id: { name: string };
  fruit_id: { name: string; image_url: string };
  rating: number;
  comment: string;
}

const DEFAULT_FRUITS: Fruit[] = [
  {
    id: 1,
    name: "Fresh Red Apple",
    description: "Crisp and sweet red apples, perfect for a healthy snack or baking.",
    price: 120,
    unit: "per kg",
    stock_kg: 50,
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    available: 1,
    rating: 4.8
  },
  {
    id: 2,
    name: "Yellow Banana",
    description: "Naturally sweet, energy-boosting bananas rich in potassium.",
    price: 60,
    unit: "per dozen",
    stock_kg: 100,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    available: 1,
    rating: 4.5
  },
  {
    id: 3,
    name: "Alphonso Mango",
    description: "The king of fruits. Rich, creamy, and exceptionally sweet.",
    price: 250,
    unit: "per kg",
    stock_kg: 30,
    image_url: "https://images.unsplash.com/photo-1553279768-865429fd81ce?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    available: 1,
    rating: 4.9
  },
  {
    id: 4,
    name: "Dragon Fruit",
    description: "Exotic and vibrant, packed with antioxidants and mild sweetness.",
    price: 150,
    unit: "per piece",
    stock_kg: 20,
    image_url: "https://images.unsplash.com/photo-1527310562375-a8f14bea41d0?auto=format&fit=crop&q=80&w=600",
    category: "exotic",
    available: 1,
    rating: 4.7
  },
  {
    id: 5,
    name: "Juicy Orange",
    description: "Freshly picked citrus oranges, bursting with Vitamin C.",
    price: 90,
    unit: "per kg",
    stock_kg: 80,
    image_url: "https://images.unsplash.com/photo-1549888834-3ec93abae044?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    available: 1,
    rating: 4.4
  },
  {
    id: 6,
    name: "Green Grapes",
    description: "Seedless green grapes, sweet, tart, and highly refreshing.",
    price: 180,
    unit: "per kg",
    stock_kg: 40,
    image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    available: 1,
    rating: 4.6
  },
  {
    id: 7,
    name: "Kiwi",
    description: "Tangy and sweet kiwis, an excellent source of dietary fiber.",
    price: 40,
    unit: "per piece",
    stock_kg: 60,
    image_url: "https://images.unsplash.com/photo-1585059895524-72359e06138a?auto=format&fit=crop&q=80&w=600",
    category: "exotic",
    available: 1,
    rating: 4.5
  },
  {
    id: 8,
    name: "Watermelon",
    description: "Hydrating and cooling, the ultimate summer fruit.",
    price: 40,
    unit: "per kg",
    stock_kg: 100,
    image_url: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    available: 1,
    rating: 4.3
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@fruitshop.com",
    password: "admin",
    phone: "1234567890",
    role: "admin"
  },
  {
    id: 2,
    name: "Test Customer",
    email: "customer@fruitshop.com",
    password: "password",
    phone: "0987654321",
    role: "customer"
  }
];

export const LocalDB = {
  init() {
    if (!localStorage.getItem('fruitProducts')) {
      localStorage.setItem('fruitProducts', JSON.stringify(DEFAULT_FRUITS));
    }
    if (!localStorage.getItem('fruitUsers')) {
      localStorage.setItem('fruitUsers', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('fruitCart')) {
      localStorage.setItem('fruitCart', JSON.stringify([]));
    }
    if (!localStorage.getItem('fruitOrders')) {
      localStorage.setItem('fruitOrders', JSON.stringify([]));
    }
    if (!localStorage.getItem('fruitReviews')) {
      localStorage.setItem('fruitReviews', JSON.stringify([]));
    }
  },

  // Products & Inventory
  getProducts(): Fruit[] {
    this.init();
    return JSON.parse(localStorage.getItem('fruitProducts') || '[]');
  },
  
  getProductById(id: number): Fruit | undefined {
    return this.getProducts().find(p => p.id === id);
  },

  saveProducts(products: Fruit[]) {
    localStorage.setItem('fruitProducts', JSON.stringify(products));
  },

  updateProductStock(id: number, quantityToReduce: number) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx].stock_kg = Math.max(0, products[idx].stock_kg - quantityToReduce);
      this.saveProducts(products);
      
      // Also update cart if product stock becomes lower than cart quantity
      this.syncCartWithInventory();
    }
  },

  // Cart
  getCart(): CartItem[] {
    this.init();
    return JSON.parse(localStorage.getItem('fruitCart') || '[]');
  },

  saveCart(cart: CartItem[]) {
    localStorage.setItem('fruitCart', JSON.stringify(cart));
    // Trigger custom event so header can update
    window.dispatchEvent(new Event('cartUpdated'));
  },

  addToCart(fruit: Fruit, quantity: number = 1) {
    const cart = this.getCart();
    const existingIdx = cart.findIndex(c => c.fruit.id === fruit.id);
    
    if (existingIdx !== -1) {
      const newQty = cart[existingIdx].quantity + quantity;
      cart[existingIdx].quantity = Math.min(newQty, fruit.stock_kg);
    } else {
      cart.push({ fruit, quantity: Math.min(quantity, fruit.stock_kg) });
    }
    this.saveCart(cart);
  },

  updateCartQuantity(fruitId: number, quantity: number) {
    let cart = this.getCart();
    const fruit = this.getProductById(fruitId);
    
    if (!fruit) return;

    cart = cart.map(item => {
      if (item.fruit.id === fruitId) {
        if (quantity <= 0) return null;
        return { ...item, quantity: Math.min(quantity, fruit.stock_kg) };
      }
      return item;
    }).filter(Boolean) as CartItem[];
    
    this.saveCart(cart);
  },
  
  removeFromCart(fruitId: number) {
    const cart = this.getCart().filter(item => item.fruit.id !== fruitId);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  syncCartWithInventory() {
    const cart = this.getCart();
    let updated = false;
    const products = this.getProducts();
    
    const newCart = cart.map(item => {
      const product = products.find(p => p.id === item.fruit.id);
      if (!product || product.stock_kg === 0) {
        updated = true;
        return null; // Remove out of stock
      }
      if (item.quantity > product.stock_kg) {
        updated = true;
        return { ...item, quantity: product.stock_kg, fruit: product };
      }
      // Always update fruit data to latest
      return { ...item, fruit: product };
    }).filter(Boolean) as CartItem[];

    if (updated) {
      this.saveCart(newCart);
    }
  },

  // Orders
  getOrders(): Order[] {
    this.init();
    return JSON.parse(localStorage.getItem('fruitOrders') || '[]');
  },
  
  saveOrders(orders: Order[]) {
    localStorage.setItem('fruitOrders', JSON.stringify(orders));
  },

  createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status'>) {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    this.saveOrders(orders);
    
    // Reduce inventory
    newOrder.items.forEach(item => {
      this.updateProductStock(item.id, item.quantity);
    });
    
    return newOrder.id;
  },
  
  updateOrderStatus(orderId: number, status: string) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      this.saveOrders(orders);
    }
  },

  // Users
  getUsers(): User[] {
    this.init();
    return JSON.parse(localStorage.getItem('fruitUsers') || '[]');
  },
  
  saveUsers(users: User[]) {
    localStorage.setItem('fruitUsers', JSON.stringify(users));
  }
};
