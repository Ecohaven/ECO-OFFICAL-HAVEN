import axios from "axios";

const instance = axios.create({ // Create axios instance
    baseURL: import.meta.env.VITE_API_BASE_URL // Set the base URL for the API
});

// Add a request interceptor
instance.interceptors.request.use((config) => { 
  // Do something before request is sent  
  let token = localStorage.getItem('accessToken'); // Get token
    if (token) { // If token exists
      config.headers["Authorization"] = `Bearer ${token}`; // Add token to request headers
    }
    if (config.data && config.data.account) { // If account data exists in request
      delete config.data.account; // Delete account data from request
    }
    return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use((response) => {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  if (error.response.status === 401 || error.response.status === 403)  { // If unauthorized or forbidden
    localStorage.removeItem('accessToken'); // Remove token from localStorage
    localStorage.clear(); // Clear localStorage
    window.location = '/'; // Redirect to home page
  }
  return Promise.reject(error);
});

export default instance;