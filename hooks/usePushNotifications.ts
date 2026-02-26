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
            // Canal para alertas bajas
            await Notifications.setNotificationChannelAsync('low', {
                name: 'Alertas Bajas',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: 'low', // Referencia al archivo en res/raw (sin .mp3)
                vibrationPattern: [0, 250],
            });

            // Canal para alertas medias
            await Notifications.setNotificationChannelAsync('medium', {
                name: 'Alertas Medias',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'medium',
                vibrationPattern: [0, 250, 250, 250],
            });

            // Canal para alertas altas
            await Notifications.setNotificationChannelAsync('high', {
                name: 'Alertas Altas',
                importance: Notifications.AndroidImportance.MAX,
                sound: 'high',
                vibrationPattern: [0, 500, 200, 500],
            });

            // Canal para alertas críticas
            await Notifications.setNotificationChannelAsync('critical', {
                name: 'Alertas Críticas',
                importance: Notifications.AndroidImportance.MAX,
                sound: 'critical',
                vibrationPattern: [0, 1000, 500, 1000],
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

            } catch (e) {

            }
        } else {

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

                } catch (error) {
                    // Ignorar error si es 401 (no logueado) para evitar ruido

                }
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {


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
