import { ApiResponse } from '@/interfaces/api';
import { Device, DeviceSettings } from '@/interfaces/device';
import apiService from './apiService';

import { alertResolve, deviceCreate, deviceGetAll, deviceGetById, deviceSettingsUpdate } from '@/constants/endpoints';

class DeviceService {
    /**
     * Obtener todos los dispositivos del usuario
     */
    async getDevices(): Promise<Device[]> {
        try {
            const response = await apiService.getAll<ApiResponse<Device[]>>(deviceGetAll);
            return response.data;
        } catch (error) {

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

            throw error;
        }
    }

    /**
     * Actualizar información básica del dispositivo
     */
    async updateDevice(id: number, data: { name?: string; description?: string; location?: string }): Promise<Device> {
        try {
            const response = await apiService.patch<ApiResponse<Device>>(`/device/${id}`, data);
            return response.data;
        } catch (error) {

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

            throw error;
        }
    }

    /**
     * Control manual de actuadores
     */
    async controlActuator(deviceKey: string, actuator: 'window' | 'fan', status: boolean): Promise<any> {
        try {
            const response = await apiService.create('/sensor-data/actuator', {
                deviceKey,
                actuator,
                status
            });
            return response;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Resolver una alerta activa
     */
    async resolveAlert(alertId: number): Promise<any> {
        try {
            const response = await apiService.patch<ApiResponse<any>>(alertResolve(alertId), {});
            return response.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Solicitar calibración remota
     */
    async calibrateDevice(deviceKey: string): Promise<any> {
        try {
            const response = await apiService.create('/sensor-data/calibrate', { deviceKey });
            return response;
        } catch (error) {

            throw error;
        }
    }
}

export default new DeviceService();