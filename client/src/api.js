// Small fetch wrapper for the EduMart API.
const TOKEN_KEY = 'edumart_token';
const SESSION_KEY = 'edumart_session';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

// Guests are identified by a random id so their cart survives page reloads.
export const getSessionId = () => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'x-session-id': getSessionId() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (auth && !token) throw new ApiError('Please log in to continue', 401);

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response
  }
  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status);
  }
  return data;
}

export const addToWishlist = (productId) => apiFetch('/api/wishlist', { method: 'POST', body: { productId }, auth: true });
export const removeFromWishlist = (idOrProductId) => apiFetch(`/api/wishlist/${idOrProductId}`, { method: 'DELETE', auth: true });

// Cart (works for guests via x-session-id and for logged-in users via the token)
export const getCart = () => apiFetch('/api/cart');
export const addToCart = (productId, quantity = 1) => apiFetch('/api/cart/add', { method: 'POST', body: { productId, quantity } });
export const updateCartItem = (itemId, quantity) => apiFetch(`/api/cart/item/${itemId}`, { method: 'PUT', body: { quantity } });
export const removeCartItem = (itemId) => apiFetch(`/api/cart/item/${itemId}`, { method: 'DELETE' });
export const clearCart = () => apiFetch('/api/cart/clear', { method: 'DELETE' });
export const mergeGuestCart = () => apiFetch('/api/cart/merge', { method: 'POST', auth: true });

// Checkout & Orders
export const validateCoupon = (couponCode) => apiFetch('/api/checkout/validate-coupon', { method: 'POST', body: { couponCode } });
export const submitCheckout = (payload) => apiFetch('/api/checkout', { method: 'POST', body: payload });
export const confirmPayment = (payload) => apiFetch('/api/payment/confirm', { method: 'POST', body: payload });
export const getOrder = (id) => apiFetch(`/api/orders/${id}`);
export const getOrderHistory = () => apiFetch('/api/orders/history', { auth: true });

// Seller APIs
export const getSellerDashboard = () => apiFetch('/api/seller/dashboard', { auth: true });
export const getSellerProducts = () => apiFetch('/api/seller/products', { auth: true });
export const createSellerProduct = (payload) => apiFetch('/api/seller/products', { method: 'POST', body: payload, auth: true });
export const toggleProductStatus = (id) => apiFetch(`/api/seller/products/${id}/toggle-status`, { method: 'PUT', auth: true });
export const deleteSellerProduct = (id) => apiFetch(`/api/seller/products/${id}`, { method: 'DELETE', auth: true });
export const getSellerOrders = () => apiFetch('/api/seller/orders', { auth: true });
export const getSellerEarnings = () => apiFetch('/api/seller/earnings', { auth: true });
export const requestPayout = (payload) => apiFetch('/api/seller/payout', { method: 'POST', body: payload, auth: true });
export const getSellerAnalytics = () => apiFetch('/api/seller/analytics', { auth: true });

// Admin APIs
export const getAdminStats = () => apiFetch('/api/admin/stats', { auth: true });
export const getAdminUsers = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, val]) => val !== undefined && val !== null && val !== '')
  ).toString();
  return apiFetch(`/api/admin/users${query ? `?${query}` : ''}`, { auth: true });
};
export const getAdminUser = (id) => apiFetch(`/api/admin/users/${id}`, { auth: true });
export const updateUserRole = (id, role) => apiFetch(`/api/admin/users/${id}/role`, { method: 'PUT', body: { role }, auth: true });
export const toggleUserVerification = (id) => apiFetch(`/api/admin/users/${id}/toggle-verify`, { method: 'PUT', auth: true });
export const deleteAdminUser = (id) => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE', auth: true });
export const impersonateUser = (id) => apiFetch(`/api/admin/users/${id}/impersonate`, { method: 'POST', auth: true });
