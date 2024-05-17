import axios from "axios";
import { BACKEND_URL } from "./constants";

export const axiosReq = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
});