import API from './axiosConfig';

export const getOrders = (page = 1) => {
  return API.get(`/v1/orders?page=${page}`);
};

export const createOrder = (orderData) => {
  return API.post('/v1/orders', orderData);
};

export const updateOrder = (id, orderData) => {
  return API.put(`/v1/orders/${id}`, orderData);
};

export const deleteOrder = (id) => {
  return API.delete(`/v1/orders/${id}`);
};

export const getOrder = (id) => {
  return API.get(`/v1/orders/${id}`);
};