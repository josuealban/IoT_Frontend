import { Alert } from './alert';

export enum NotificationType {
    ALERT = 'ALERT',
    INFO = 'INFO',
    WARNING = 'WARNING',
    SUCCESS = 'SUCCESS'
}

export interface Notification {
    id: number;
    userId: number;
    alertId: number | null;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    sent: boolean;
    createdAt: string;
    alert?: Alert;
}
