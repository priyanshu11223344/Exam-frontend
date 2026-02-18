import axios from "axios";

const API = axios.create({
  baseURL: "https://exam-backend-six.vercel.app/api",
});

export default API;
