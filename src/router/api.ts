import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
});

export default api;
export const apiGet = async (url: string, params?: any) => {
    try {
        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("API GET Error:", error);
        throw error;
    }
}
export const apiPost = async (url: string, data?: any) => {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (error) {
        console.error("API POST Error:", error);
        throw error;
    }
}
export const apiPut = async (url: string, data?: any) => {
    try {
        const response = await api.put(url, data);
        return response.data;
    } catch (error) {
        console.error("API PUT Error:", error);
        throw error;
    }
}