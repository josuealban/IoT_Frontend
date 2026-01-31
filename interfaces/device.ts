export enum DeviceStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    MAINTENANCE = 'MAINTENANCE'
}

export interface DeviceSettings {
    id: number;
    deviceId: number;
    gasThresholdPpm: number;
    voltageThreshold: number;
    buzzerEnabled: boolean;
    ledEnabled: boolean;
    notifyUser: boolean;
    notificationCooldown: number;
    autoShutoff: boolean;
    calibrationR0: number;
    updatedAt: string;
}

export interface SensorData {
    id: number;
    deviceId: number;
    rawValue: number;
    voltage: number | null;
    gasConcentrationPpm: number | null;
    rsRoRatio: number | null;
    temperature: number | null;
    humidity: number | null;
    thresholdPassed: boolean;
    readAt: string;
    createdAt: string;
}

export interface Device {
    id: number;
    userId: number;
    name: string;
    description: string | null;
    deviceKey: string;
    status: DeviceStatus;
    location: string | null;
    lastSeen: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    deviceSettings?: DeviceSettings;
    sensorData?: SensorData[];
    alerts?: any[]; // Usar 'any[]' temporalmente o importar Alert si es posible circular dependency
}
