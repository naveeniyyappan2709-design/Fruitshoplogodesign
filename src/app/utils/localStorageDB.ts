export interface Fruit {
  id: number;
  name: string;
  description: string;
  sellingPrice: number;
  unit: string;
  quantity: number;
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
    sellingPrice: 120,
    unit: "per kg",
    quantity: 50,
    image_url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    status: 'Available',
    rating: 4.8
  },
  {
    id: 2,
    name: "Yellow Banana",
    description: "Naturally sweet, energy-boosting bananas rich in potassium.",
    sellingPrice: 60,
    unit: "per dozen",
    quantity: 100,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    status: 'Available',
    rating: 4.5
  },
  {
    id: 3,
    name: "Alphonso Mango",
    description: "The king of fruits. Rich, creamy, and exceptionally sweet.",
    sellingPrice: 250,
    unit: "per kg",
    quantity: 30,
    image_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    status: 'Available',
    rating: 4.9
  },
  {
    id: 4,
    name: "Dragon Fruit",
    description: "Exotic and vibrant, packed with antioxidants and mild sweetness.",
    sellingPrice: 150,
    unit: "per piece",
    quantity: 20,
    image_url: "https://images.unsplash.com/photo-1635843110565-cb35d1c03d86?auto=format&fit=crop&q=80&w=600",
    category: "exotic",
    status: 'Available',
    rating: 4.7
  },
  {
    id: 5,
    name: "Juicy Orange",
    description: "Freshly picked citrus oranges, bursting with Vitamin C.",
    sellingPrice: 90,
    unit: "per kg",
    quantity: 80,
    image_url: "https://images.unsplash.com/photo-1549888834-3ec93abae044?auto=format&fit=crop&q=80&w=600",
    category: "everyday",
    status: 'Available',
    rating: 4.4
  },
  {
    id: 6,
    name: "Green Grapes",
    description: "Seedless green grapes, sweet, tart, and highly refreshing.",
    sellingPrice: 180,
    unit: "per kg",
    quantity: 40,
    image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    status: 'Available',
    rating: 4.6
  },
  {
    id: 7,
    name: "Kiwi",
    description: "Tangy and sweet kiwis, an excellent source of dietary fiber.",
    sellingPrice: 40,
    unit: "per piece",
    quantity: 60,
    image_url: "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&q=80&w=600",
    category: "exotic",
    status: 'Available',
    rating: 4.5
  },
  {
    id: 8,
    name: "Watermelon",
    description: "Hydrating and cooling, the ultimate summer fruit.",
    sellingPrice: 40,
    unit: "per kg",
    quantity: 100,
    image_url: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&q=80&w=600",
    category: "seasonal",
    status: 'Available',
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

  getProducts(): Fruit[] {
    this.init();
    const stored = JSON.parse(localStorage.getItem('fruitProducts') || '[]');
    // Update image URLs in case they were cached from an older version
    return stored.map((p: Fruit) => {
      const defaultFruit = DEFAULT_FRUITS.find(df => df.id === p.id);
      if (defaultFruit && defaultFruit.image_url !== p.image_url) {
        return { ...p, image_url: defaultFruit.image_url };
      }
      return p;
    });
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
      products[idx].quantity = Math.max(0, products[idx].quantity - quantityToReduce);
      this.saveProducts(products);
      
      // Also update cart if product stock becomes lower than cart quantity
      this.syncCartWithInventory();
    }
  },

  // Cart
  getCart(): CartItem[] {
    this.init();
    const stored = JSON.parse(localStorage.getItem('fruitCart') || '[]');
    return stored.map((item: CartItem) => {
      const defaultFruit = DEFAULT_FRUITS.find(df => df.id === item.fruit.id);
      if (defaultFruit && defaultFruit.image_url !== item.fruit.image_url) {
        return { ...item, fruit: { ...item.fruit, image_url: defaultFruit.image_url } };
      }
      return item;
    });
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
      cart[existingIdx].quantity = Math.min(newQty, fruit.quantity);
    } else {
      cart.push({ fruit, quantity: Math.min(quantity, fruit.quantity) });
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
        return { ...item, quantity: Math.min(quantity, fruit.quantity) };
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
      if (!product || product.quantity === 0) {
        updated = true;
        return null; // Remove out of stock
      }
      if (item.quantity > product.quantity) {
        updated = true;
        return { ...item, quantity: product.quantity, fruit: product };
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
    const stored = JSON.parse(localStorage.getItem('fruitOrders') || '[]');
    return stored.map((order: Order) => {
      const updatedItems = order.items.map(item => {
        const defaultFruit = DEFAULT_FRUITS.find(df => df.id === item.id);
        if (defaultFruit && defaultFruit.image_url !== item.image_url) {
          return { ...item, image_url: defaultFruit.image_url };
        }
        return item;
      });
      return { ...order, items: updatedItems };
    });
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
