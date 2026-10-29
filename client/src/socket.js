import { io } from "socket.io-client";
import { getAccessToken } from "./api/tokenStore";

export const socket = io("https://localhost:7643", {
  autoConnect: false,
  withCredentials: true,
  auth: (callback) => {
    callback({ token: getAccessToken() });
  },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
});
