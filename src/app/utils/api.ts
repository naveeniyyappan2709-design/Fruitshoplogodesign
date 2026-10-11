const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token || ''}`
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const api = {
  // Fruits
  async getProducts(search = '', category = 'all', sort = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);
    if (sort) params.append('sort', sort);
    
    const res = await fetch(`${API_URL}/fruits?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.fruits;
  },

  async getProductById(id: string) {
    const res = await fetch(`${API_URL}/fruits/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    return data.fruit;
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  },

  async getMyOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.orders;
  },

  async cancelOrder(orderId: string) {
    const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
    return data;
  },

  // Coupons
  async validateCoupon(code: string, cartTotal: number) {
    const res = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, cartTotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon');
    return data;
  },

  // Wishlist
  async getWishlist() {
    if (!localStorage.getItem('user')) return [];
    const res = await fetch(`${API_URL}/wishlist`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.wishlist?.fruits || [];
  },

  async toggleWishlist(fruitId: string, isAdding: boolean) {
    if (!localStorage.getItem('user')) throw new Error('Please login to use wishlist');
    const method = isAdding ? 'POST' : 'DELETE';
    const url = isAdding ? `${API_URL}/wishlist/add` : `${API_URL}/wishlist/remove/${fruitId}`;
    const options: any = { method, headers: getAuthHeaders() };
    if (isAdding) options.body = JSON.stringify({ fruit_id: fruitId });

    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Failed to update wishlist');
    return await res.json();
  },

  // Cart (Local state sync for simplicity in frontend logic, but could be adapted to pure backend)
  getCart() {
    return JSON.parse(localStorage.getItem('fruitCart') || '[]');
  },
  
  saveCart(cart: any[]) {
    localStorage.setItem('fruitCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  },
  
  addToCart(fruit: any, quantity: number = 1) {
    const cart = this.getCart();
    const existingIdx = cart.findIndex((c: any) => c.fruit._id === fruit._id);
    if (existingIdx !== -1) {
      cart[existingIdx].quantity = Math.min(cart[existingIdx].quantity + quantity, fruit.quantity);
    } else {
      cart.push({ fruit, quantity: Math.min(quantity, fruit.quantity) });
    }
    this.saveCart(cart);
    
    // Sync to backend asynchronously if logged in
    if (localStorage.getItem('user')) {
      fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fruit_id: fruit._id, quantity })
      }).catch(console.error);
    }
  },

  updateCartQuantity(fruitId: string, quantity: number) {
    let cart = this.getCart();
    cart = cart.map((item: any) => {
      if (item.fruit._id === fruitId) {
        if (quantity <= 0) return null;
        return { ...item, quantity: Math.min(quantity, item.fruit.quantity) };
      }
      return item;
    }).filter(Boolean);
    this.saveCart(cart);

    if (localStorage.getItem('user')) {
      fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fruit_id: fruitId, quantity })
      }).catch(console.error);
    }
  },

  removeFromCart(fruitId: string) {
    const cart = this.getCart().filter((item: any) => item.fruit._id !== fruitId);
    this.saveCart(cart);

    if (localStorage.getItem('user')) {
      fetch(`${API_URL}/cart/remove/${fruitId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).catch(console.error);
    }
  },

  clearCart() {
    this.saveCart([]);
    if (localStorage.getItem('user')) {
      fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).catch(console.error);
    }
  }
};
