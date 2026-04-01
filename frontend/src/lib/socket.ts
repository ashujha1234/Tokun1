import { io } from "socket.io-client";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const user = JSON.parse(localStorage.getItem("user") || "{}");
// export const socket = io(API_BASE, {
//   auth: {
//     userId: user?._id, // 🔥 MUST EXIST
//   },
//   withCredentials: true,
//   autoConnect: true,
// });




const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socket = io(API_BASE, {
  autoConnect: false, // 🔥 IMPORTANT
  withCredentials: true,
});