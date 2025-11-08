import axios from "axios";

const api = axios.create({
  baseURL: "https://backnoteasy-production.up.railway.app/",
});

export default api;
