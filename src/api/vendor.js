import API from "./axiosConfig";

export const submitVendorRequest = (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return API.post("/v1/vendor-details", formData, config);
};

export const getVendorDetails = () => {
  return API.get("/v1/vendor-details");
};