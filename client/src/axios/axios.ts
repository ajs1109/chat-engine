import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { getStoredProfile } from "@/lib/profile";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use((req) => {
  const { token } = getStoredProfile();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default instance;
