// Simple cart utility using localStorage
const CART_KEY = 'cartItems';
const CHECKOUT_KEY = 'checkoutItems';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product, qty = 1) {
  const items = getCart();
  const price = product?.price?.raw ?? product?.price ?? 0;
  const imageUrl = product?.images?.main ?? product?.main_image ?? product?.image ?? '';
  const idx = items.findIndex((i) => i.id === product.id);
  if (idx >= 0) {
    items[idx].quantity += qty;
  } else {
    items.push({ id: product.id, name: product.name, price, image: imageUrl, quantity: qty });
  }
  setCart(items);
  // Notify listeners (Header) to update badge
  try {
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (e) {}
}

export function getCartCount() {
  const items = getCart();
  return items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
}

export function updateCartItem(id, quantity) {
  const items = getCart();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    items[idx].quantity = Number(quantity) || 1;
    setCart(items);
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
  }
}

export function removeFromCart(id) {
  const items = getCart().filter((i) => i.id !== id);
  setCart(items);
  try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
}

export function clearCart() {
  setCart([]);
  try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
}

export function setCheckoutItems(items) {
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(items));
}

export function getCheckoutItems() {
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function clearCheckoutItems() {
  localStorage.removeItem(CHECKOUT_KEY);
}