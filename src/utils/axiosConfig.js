// // import axios from "axios";

// export const apiCover = axios.create({
//   baseURL: "https://uploads.mangadex.org/covers",
//   timeout: 5000, // 5 seconds timeout
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// // export const apiManga = axios.create({
// //   baseURL: "https://api.mangadex.org",
// //   timeout: 5000, // 5 seconds timeout
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// import axios from "axios";

// // export const apiCover = axios.create({
// //   baseURL: "/covers", // goes through Vercel proxy
// //   timeout: 5000,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// export const apiManga = axios.create({
//   baseURL: "/api", // goes through Vercel proxy
//   timeout: 5000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// utils/axiosConfig.js
import axios from "axios";

// For development - direct API calls with proper CORS handling
const isDev = process.env.NODE_ENV === "development";

export const apiManga = axios.create({
  baseURL: isDev ? "https://api.mangadex.org" : "/api",
  timeout: 10000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "YourAppName/1.0", // Add a user agent
  },
});

// Add request interceptor for better error handling
apiManga.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiManga.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else if (error.response?.status === 429) {
      console.error("Rate limited");
    } else if (error.response?.status === 403) {
      console.error("Forbidden - CORS or API key issue");
    }

    return Promise.reject(error);
  }
);

export const apiCover = axios.create({
  baseURL: "https://uploads.mangadex.org/covers",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
