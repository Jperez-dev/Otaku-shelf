import axios from "axios";

// Detect if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Use direct API in development, rewrite proxy in production
export const apiManga = axios.create({
  baseURL: isDevelopment 
    ? "https://api.mangadex.org" 
    : "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging in development
if (isDevelopment) {
  apiManga.interceptors.request.use(
    (config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// Add response interceptor for error handling
apiManga.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);