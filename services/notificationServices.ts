import { Alert } from 'react-native';

const notificationService = {
    success: (title: string, message?: string) => {
        Alert.alert('Success: ' + title, message);
    },
    error: (title: string, message?: string) => {
        Alert.alert('Error: ' + title, message);
    },
    info: (title: string, message?: string) => {
        Alert.alert('Info: ' + title, message);
    }
};

export default notificationService;
