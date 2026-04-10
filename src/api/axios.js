import axios from "axios";

const API = axios.create({
   baseURL: "https://exam-backend-render.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  withCredentials:true,
  
});

export default API;
