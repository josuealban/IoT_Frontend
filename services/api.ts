// services/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/Config";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no hemos intentado refrescar el token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync("refreshToken");

                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken } = response.data;

                    if (accessToken) {
                        // Guardar el nuevo token
                        await SecureStore.setItemAsync("accessToken", String(accessToken));

                    }

                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh, limpiar tokens y redirigir al login
                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("refreshToken");
                await SecureStore.deleteItemAsync("userId");

                // Aquí podrías emitir un evento o usar un callback para redirigir al login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
