import apiService from '@/services/apiService';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Final status not granted');
                return;
            }

            // Learn more about projectId:
            // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

                // Usamos getDevicePushTokenAsync para Firebase Cloud Messaging (nativo)
                // O getExpoPushTokenAsync si usamos el servicio de Expo
                // Dado que configuramos google-services.json, intentamos obtener el token nativo (FCM)
                // Pero Expo recomienda usar Expo Push Token para portabilidad.
                // Sin embargo, el backend usa firebase-admin para enviar directamente a FCM.
                // Entonces necesitamos el Device Push Token (FCM Token).

                const tokenResponse = await Notifications.getDevicePushTokenAsync();
                token = tokenResponse.data;
                console.log('FCM Token:', token);
            } catch (e) {
                console.log('Error getting push token:', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then(async token => {
            setExpoPushToken(token);
            if (token) {
                // Enviar token al backend
                try {
                    await apiService.create('/notifications/register-token', { token });
                    console.log('Token registrado en backend exitosamente');
                } catch (error) {
                    // Ignorar error si es 401 (no logueado) para evitar ruido
                    console.log('Token no registrado (probablemente usuario no logueado)');
                }
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            console.log('Notification tapped:', response);

            // Extraer deviceId de los datos de la notificación
            const deviceId = response.notification.request.content.data?.deviceId;

            if (deviceId) {
                // Importar router dinámicamente para evitar problemas de dependencias circulares
                import('expo-router').then(({ router }) => {
                    router.push(`/device/${deviceId}`);
                });
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
};
