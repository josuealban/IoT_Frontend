import * as SecureStore from 'expo-secure-store';
import api from './api';

// Ajustar endpoints si es necesario (asumo que existen en constants/endpoints, si no usar strings directos)
const LOGIN_ENDPOINT = '/auth/login';
const REGISTER_ENDPOINT = '/auth/register';

import { AuthResponse, LoginRequest, RegisterRequest } from '@/interfaces/auth';

class AuthService {
    /**
     * Iniciar sesión y guardar tokens
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(LOGIN_ENDPOINT, data);

            if (response.data) {
                await this.setSession(response.data);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Registrar nuevo usuario y guardar sesión
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(REGISTER_ENDPOINT, data);

            if (response.data) {
                await this.setSession(response.data);
            }

            return response.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Guardar sesión localmente
     */
    async setSession(authData: AuthResponse): Promise<void> {
        try {
            if (authData.accessToken) {
                await SecureStore.setItemAsync('accessToken', authData.accessToken);
            }
            if (authData.refreshToken) {
                await SecureStore.setItemAsync('refreshToken', authData.refreshToken);
            }
            if (authData.user?.id) {
                await SecureStore.setItemAsync('userId', String(authData.user.id));
            }
        } catch (error) {
        }
    }

    /**
     * Cerrar sesión y limpiar storage
     */
    async logout(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('userId');
        } catch (error) {
        }
    }

    /**
     * Obtener token actual
     */
    async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync('accessToken');
    }
}

export default new AuthService();
