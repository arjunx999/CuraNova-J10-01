import axios from "axios";
import { getAccessToken, clearAccessToken, setAccessToken } from "./tokenStore";

const instance = axios.create({
  baseURL: "https://localhost:7643",
  // baseURL: "http://192.168.0.101:7643",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/user/login") &&
      !original.url.includes("/auth/doctor/login")
    ) {
      if (original.url === "/auth/refresh-token") {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return instance(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await instance.post("/auth/refresh-token");
        const newToken = res.data.token;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return instance(original);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
