import { Device } from './device';

export enum AlertType {
    GAS_DETECTED = 'GAS_DETECTED',
    SENSOR_ERROR = 'SENSOR_ERROR',
    OFFLINE = 'OFFLINE',
    MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED'
}

export enum AlertSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface Alert {
    id: number;
    deviceId: number;
    alertType: AlertType;
    severity: AlertSeverity;
    message: string;
    gasValuePpm: number | null;
    voltageValue: number | null;
    resolved: boolean;
    resolvedAt: string | null;
    resolvedBy: number | null;
    createdAt: string;
    device?: Device;
}
