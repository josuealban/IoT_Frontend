// app/notification/[id].tsx
import { Notification, NotificationType } from '@/interfaces/notification';
import notificationService from '@/services/notificationSensorService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNotificationDetail();
        }
    }, [id]);

    const fetchNotificationDetail = async () => {
        try {
            const notificationId = typeof id === 'string' ? parseInt(id) : id[0] ? parseInt(id[0]) : 0;
            
            if (!notificationId || isNaN(notificationId)) {
                console.error('ID de notificación inválido:', id);
                Alert.alert('Error', 'ID de notificación inválido');
                router.back();
                return;
            }

            // Obtener todas las notificaciones y buscar la específica
            const allNotifications = await notificationService.getNotifications();
            const found = allNotifications.find(n => n.id === notificationId);
            
            if (found) {
                setNotification(found);
            } else {
                Alert.alert('Error', 'Notificación no encontrada');
                router.back();
            }
        } catch (error: any) {
            console.error('Error fetching notification details:', error);
            Alert.alert('Error', 'No se pudo cargar la información de la notificación');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.ALERT:
                return 'alert-circle';
            case NotificationType.WARNING:
                return 'warning';
            case NotificationType.SUCCESS:
                return 'checkmark-circle';
            case NotificationType.INFO:
                return 'information-circle';
            default:
                return 'notifications';
        }
    };

    const getColors = (type: NotificationType) => {
        switch (type) {
            case NotificationType.ALERT:
                return { 
                    bg: 'bg-red-500/10', 
                    icon: '#ef4444', 
                    text: 'text-red-500',
                    border: 'border-red-500/20'
                };
            case NotificationType.WARNING:
                return { 
                    bg: 'bg-yellow-500/10', 
                    icon: '#f59e0b', 
                    text: 'text-yellow-500',
                    border: 'border-yellow-500/20'
                };
            case NotificationType.SUCCESS:
                return { 
                    bg: 'bg-green-500/10', 
                    icon: '#10b981', 
                    text: 'text-green-500',
                    border: 'border-green-500/20'
                };
            case NotificationType.INFO:
                return { 
                    bg: 'bg-blue-500/10', 
                    icon: '#3b82f6', 
                    text: 'text-blue-500',
                    border: 'border-blue-500/20'
                };
            default:
                return { 
                    bg: 'bg-slate-500/10', 
                    icon: '#64748b', 
                    text: 'text-slate-500',
                    border: 'border-slate-500/20'
                };
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-slate-400 mt-4">Cargando notificación...</Text>
            </SafeAreaView>
        );
    }

    if (!notification) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <View className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="alert-circle-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-slate-400 text-lg mb-2">Notificación no encontrada</Text>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-medium">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const colors = getColors(notification.type);
    const formattedDate = new Date(notification.createdAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-50">Detalle de Notificación</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                {/* Icon and Type */}
                <View className="items-center mb-6">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${colors.bg} border-2 ${colors.border}`}>
                        <Ionicons name={getIcon(notification.type) as any} size={40} color={colors.icon} />
                    </View>
                    <Text className={`text-sm font-bold uppercase ${colors.text}`}>
                        {notification.type}
                    </Text>
                </View>

                {/* Title */}
                <View className="bg-slate-900 rounded-xl p-6 mb-4 border border-slate-800">
                    <Text className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Título</Text>
                    <Text className="text-slate-50 text-xl font-bold">
                        {notification.title}
                    </Text>
                </View>

                {/* Message */}
                <View className="bg-slate-900 rounded-xl p-6 mb-4 border border-slate-800">
                    <Text className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Mensaje</Text>
                    <Text className="text-slate-100 text-base leading-6">
                        {notification.message}
                    </Text>
                </View>

                {/* Details */}
                <View className="bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-800">
                    <View className="flex-row justify-between p-4 border-b border-slate-800">
                        <Text className="text-slate-400">Fecha y Hora</Text>
                        <Text className="text-slate-50 font-medium text-right flex-1 ml-4">
                            {formattedDate}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}