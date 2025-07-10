import axios from "axios";

export const apiCover = axios.create({
  baseURL: "https://uploads.mangadex.org/covers", // ⬅️ Replace with your actual base API
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});
export const api = axios.create({
  baseURL: "https://corsproxy.io/?https://api.mangadex.org/manga", // ⬅️ Replace with your actual base API
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
