import API from './axiosConfig';

export const getProducts = (page = 1) => {
  return API.get(`/v1/products?page=${page}`);
};

export const addProduct = (productData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return API.post('/v1/products', productData, config);
};

export const updateProduct = (id, productData) => {
  return API.put(`/v1/products/${id}`, productData);
};

export const deleteProduct = (id) => {
  return API.delete(`/v1/products/${id}`);
};

export const getProduct = (id) => {
  return API.get(`/v1/products/${id}`);
};
