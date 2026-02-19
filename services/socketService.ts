// services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/Config';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, (data: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(API_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        this.socket.on('connect', () => {

            this.reconnectAttempts = 0;

            // Re-suscribirse a todos los dispositivos activos tras reconexión
            this.listeners.forEach((_, key) => {
                const deviceKey = key.replace('device:', '');
                this.socket?.emit('subscribe', { deviceKey });

            });
        });

        this.socket.on('disconnect', (reason) => {

        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;

        });

        this.socket.on('sensorUpdate', (data) => {
            const callback = this.listeners.get(`device:${data.deviceKey}`);
            if (callback) {
                callback(data);
            }
        });

        this.socket.on('error', (err) => {

        });
    }

    subscribeToDevice(deviceKey: string, callback: (data: any) => void) {
        if (!this.socket || !this.socket.connected) this.connect();

        this.listeners.set(`device:${deviceKey}`, callback);

        if (this.socket) {
            this.socket.emit('subscribe', { deviceKey });

        }
    }

    unsubscribeFromDevice(deviceKey: string) {
        this.listeners.delete(`device:${deviceKey}`);

        if (this.socket) {
            this.socket.emit('unsubscribe', { deviceKey });

        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
