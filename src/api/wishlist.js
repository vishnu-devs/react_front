import API from './axiosConfig';

export const getWishlist = (page = 1) => {
  return API.get(`/v1/wishlist?page=${page}`);
};

export const addToWishlist = (productId) => {
  return API.post(`/v1/wishlist/${productId}`);
};

export const removeFromWishlist = (productId) => {
  return API.delete(`/v1/wishlist/${productId}`);
};