import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Create axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include token in headers if available
api.interceptors.request.use((config) => {
  // Token will be passed via Authorization header in individual requests
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = (username, password) => 
  api.post("/users/login", { username, password });

export const loginWithPhone = (mobile, role) => 
  api.post("/users/login-phone", { mobile, role });

export const logout = () => 
  api.post("/users/logout");

export const getProfile = () => 
  api.get("/users/profile");

// User Management APIs
export const createDistributor = (distributorData) => 
  api.post("/users/distributors", distributorData);

export const createDealer = (dealerData) => 
  api.post("/users/dealers", dealerData);

export const getDistributors = () => 
  api.get("/users/distributors");

export const getDealers = () => 
  api.get("/users/my-dealers");

export const getAllDealers = () => 
  api.get("/users/dealers");

// Product APIs
export const getAllProducts = () => 
  api.get("/products");

export const getAllProductsAdmin = () => 
  api.get("/products/admin/all");

export const createProduct = (productData) => 
  api.post("/products", productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateProduct = (id, productData) => 
  api.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const deleteProduct = (id) => 
  api.delete(`/products/${id}`);

export const getProduct = (id) => 
  api.get(`/products/${id}`);

// Wallet APIs
export const getWalletBalance = () => 
  api.get("/wallets/balance");

export const getWalletTransactions = (page = 1, limit = 10) => 
  api.get(`/wallets/transactions?page=${page}&limit=${limit}`);

export const getAllWallets = () => 
  api.get("/wallets/admin/all");

export const getWalletSummary = () => 
  api.get("/wallets/admin/summary");

// Invoice APIs
export const createInvoice = (invoiceData) => 
  api.post("/invoices", invoiceData);

export const getUserInvoices = (type = 'all') => 
  api.get(`/invoices/my-invoices?type=${type}`);

export const getAllInvoices = () => 
  api.get("/invoices/admin/all");

export const getInvoiceSummary = () => 
  api.get("/invoices/admin/summary");

// Content APIs
export const getAllContent = (params = '') => 
  api.get(`/content/admin/all?${params}`);

export const getContentForUser = (params = '') => 
  api.get(`/content?${params}`);

export const createContent = (formData) => 
  api.post("/content", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateContent = (id, contentData) => 
  api.put(`/content/${id}`, contentData);

export const deleteContent = (id) => 
  api.delete(`/content/${id}`);

export const getContentSummary = () => 
  api.get("/content/admin/summary");

export default api;
