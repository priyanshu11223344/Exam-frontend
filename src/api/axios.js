import axios from "axios";

const API = axios.create({
   baseURL: "https://exam-backend-render.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  withCredentials:true,
  
});
// 🔥 ADD THIS BLOCK
API.interceptors.request.use(
  (req) => {
    console.log("🚀 API CALL:", req.method.toUpperCase(), req.baseURL + req.url);
    console.trace(); // 🔥 THIS WILL SHOW EXACT SOURCE
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
