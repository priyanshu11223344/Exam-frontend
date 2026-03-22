import axios from "axios";

const API = axios.create({
  baseURL: "https://exam-backend-render.onrender.com/api",
});

export default API;
