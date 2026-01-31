import { ApiResponse } from '@/interfaces/api';
import { Device, DeviceSettings } from '@/interfaces/device';
import apiService from './apiService';

import { deviceCreate, deviceGetAll, deviceGetById, deviceSettingsUpdate } from '@/constants/endpoints';

class DeviceService {
    /**
     * Obtener todos los dispositivos del usuario
     */
    async getDevices(): Promise<Device[]> {
        try {
            const response = await apiService.getAll<ApiResponse<Device[]>>(deviceGetAll);
            return response.data;
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    }

    /**
     * Obtener un dispositivo por ID con sus datos de sensor y alertas
     */
    async getDeviceById(id: number): Promise<Device> {
        try {
            const response = await apiService.getAll<ApiResponse<Device>>(deviceGetById(id));
            return response.data;
        } catch (error) {
            console.error(`Error fetching device ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo dispositivo
     */
    async createDevice(data: { name: string; description?: string; location?: string }): Promise<Device> {
        try {
            const response = await apiService.create<ApiResponse<Device>>(deviceCreate, data as any);
            return response.data;
        } catch (error) {
            console.error('Error creating device:', error);
            throw error;
        }
    }

    /**
     * Actualizar configuración del dispositivo
     */
    async updateSettings(deviceId: number, settings: Partial<DeviceSettings>): Promise<DeviceSettings> {
        try {
            const response = await apiService.patch<ApiResponse<DeviceSettings>>(deviceSettingsUpdate(deviceId), settings);
            return response.data;
        } catch (error) {
            console.error(`Error updating settings for device ${deviceId}:`, error);
            throw error;
        }
    }
}

export default new DeviceService();