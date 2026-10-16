import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // lets the browser send cookies with every request (that's how Clerk's session reaches the API)
});

export default axiosInstance;
