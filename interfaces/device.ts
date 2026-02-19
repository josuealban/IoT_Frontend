export enum DeviceStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    MAINTENANCE = 'MAINTENANCE'
}

export interface DeviceSettings {
    id: number;
    deviceId: number;
    mq2ThresholdPpm: number;
    mq3ThresholdPpm: number;
    mq5ThresholdPpm: number;
    mq9ThresholdPpm: number;
    mq2R0: number;
    mq3R0: number;
    mq5R0: number;
    mq9R0: number;
    buzzerEnabled: boolean;
    ledEnabled: boolean;
    notifyUser: boolean;
    notificationCooldown: number;
    autoShutoff: boolean;
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
    windowStatus: boolean;
    fanStatus: boolean;
    deviceSettings?: DeviceSettings;
    sensorData?: SensorData[];
    alerts?: any[]; // Usar 'any[]' temporalmente o importar Alert si es posible circular dependency
}
