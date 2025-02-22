import axios from "axios";

const api = axios.create({
  baseURL: "https://task-management-server-rho-livid.vercel.app",
});

export default function useAxios() {
  return api;
}
