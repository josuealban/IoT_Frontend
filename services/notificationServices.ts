import { Alert } from 'react-native';

const formatMessage = (message?: any): string => {
    if (!message) return '';
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'object') return JSON.stringify(message);
    return String(message);
};

const notificationService = {
    success: (title: string, message?: any) => {
        Alert.alert('Éxito: ' + title, formatMessage(message));
    },
    error: (title: string, message?: any) => {
        Alert.alert('Error: ' + title, formatMessage(message));
    },
    info: (title: string, message?: any) => {
        Alert.alert('Info: ' + title, formatMessage(message));
    }
};

export default notificationService;
