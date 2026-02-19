import { Notification } from '@/interfaces/notification';
import api from './api';

class NotificationService {
    /**
     * Obtener todas las notificaciones
     */
    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await api.get<Notification[]>('/notifications');
            return response.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Obtener notificaciones no leídas
     */
    async getUnreadNotifications(): Promise<Notification[]> {
        try {
            const response = await api.get<Notification[]>('/notifications/unread');
            return response.data;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Marcar notificación como leída
     */
    async markAsRead(id: number): Promise<void> {
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch (error) {

            throw error;
        }
    }

    /**
     * Marcar todas como leídas
     */
    async markAllAsRead(): Promise<void> {
        try {
            await api.patch('/notifications/read-all');
        } catch (error) {

            throw error;
        }
    }

    /**
     * Resolver una alerta vinculada a una notificación
     */
    async resolveAlert(alertId: number): Promise<void> {
        try {
            await api.patch(`/sensor-data/alerts/${alertId}/resolve`, {});
        } catch (error) {

            throw error;
        }
    }
}

export default new NotificationService();
