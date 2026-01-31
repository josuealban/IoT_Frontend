import * as SecureStore from 'expo-secure-store';
import api from './api';

import { authLogin, authRegister } from '@/constants/endpoints';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/interfaces/auth';

class AuthService {
    /**
     * Iniciar sesión
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(authLogin, data);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(authRegister, data);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('userId');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

export default new AuthService();
