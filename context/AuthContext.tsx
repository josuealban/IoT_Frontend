import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import { AuthContext } from '@/hooks/useAuthContext';
import { AuthContextType, AuthResponse, LoginRequest, RegisterRequest } from '@/interfaces/auth';
import apiService from '@/services/apiService';
import notificationService from '@/services/notificationServices';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const uid = await SecureStore.getItemAsync('userId');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');

            if (token && uid) {
                // 1. Autenticación Optimista: Asumimos que es válido para arranque rápido y offline
                setIsAuthenticated(true);
                setAccessToken(token);
                setUserId(Number(uid));


            } else {
                setLoading(false);
            }
        } catch (error) {

            setLoading(false);
        } finally {
            // Asegurar que loading se apague
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);

            const data: LoginRequest = {
                email,
                password
            };

            const responseData = await apiService.createReqRes<LoginRequest, AuthResponse>(
                "/auth/login",
                data
            );



            const {
                accessToken: token,
                refreshToken,
                user,
            } = responseData;

            const uid = user?.id;

            if (!token || !refreshToken || !uid) {
                throw new Error('Respuesta de login inválida: faltan tokens o ID de usuario');
            }

            // Guardar en SecureStore
            await SecureStore.setItemAsync('accessToken', token);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            await SecureStore.setItemAsync('userId', String(uid));

            // Actualizar el estado del contexto
            setIsAuthenticated(true);
            setUserId(uid);
            setAccessToken(token);

            return { success: true };

        } catch (error: any) {


            let errorMessage = 'No se pudo iniciar sesión';

            if (error.response) {

                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {

            } else {

            }

            notificationService.error('Error de autenticación', errorMessage);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            setLoading(true);

            const data: RegisterRequest = {
                username,
                email,
                password
            };

            const responseData = await apiService.createReqRes<RegisterRequest, AuthResponse>(
                "/auth/register",
                data
            );

            const {
                accessToken: token,
                refreshToken,
                user,
            } = responseData;

            const uid = user?.id;

            if (token && refreshToken && uid) {
                // Guardar en SecureStore
                await SecureStore.setItemAsync('accessToken', token);
                await SecureStore.setItemAsync('refreshToken', refreshToken);
                await SecureStore.setItemAsync('userId', String(uid));

                // Actualizar el estado del contexto
                setIsAuthenticated(true);
                setUserId(uid);
                setAccessToken(token);

                notificationService.success('Registro exitoso', 'Bienvenido al sistema');
            } else {
                notificationService.success('Registro exitoso', 'Por favor inicia sesión');
            }

            return { success: true };

        } catch (error: any) {

            let errorMessage = 'No se pudo registrar el usuario';

            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            }

            notificationService.error('Error de registro', errorMessage);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('userId');

            setIsAuthenticated(false);
            setUserId(null);
            setAccessToken(null);

        } catch (err) {

        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        isAuthenticated,
        userId,
        accessToken,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};