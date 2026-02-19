// services/userService.ts
import { usersGetById } from '@/constants/endpoints';
import { ApiResponse } from '@/interfaces/api';
import api from './api';
import apiService from './apiService';

interface User {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UpdateUserDto {
    username?: string;
    email?: string;
}

interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

class UserService {
    /**
     * Obtener información del usuario actual por ID
     */
    async getUserById(userId: number): Promise<User> {
        try {
            const endpoint = usersGetById.replace(':id', String(userId));
            const response = await apiService.getAll<ApiResponse<User>>(endpoint);
            return response.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Actualizar perfil del usuario
     */
    async updateProfile(userId: number, data: UpdateUserDto): Promise<User> {
        try {
            const response = await api.patch<ApiResponse<User>>(`/users/${userId}`, data);
            return response.data.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Cambiar contraseña del usuario
     */
    async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
        try {
            await api.patch(`/users/${userId}/password`, data);
        } catch (error) {

            throw error;
        }
    }
}

export default new UserService();