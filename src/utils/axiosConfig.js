import axios from "axios";

export const apiCover = axios.create({
  baseURL: "https://uploads.mangadex.org/covers",
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});
export const apiManga = axios.create({
  baseURL: "https://api.mangadex.org",
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});
