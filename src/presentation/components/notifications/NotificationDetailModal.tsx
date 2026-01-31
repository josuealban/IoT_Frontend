// src/presentation/components/notifications/NotificationDetailModal.tsx
import { Notification, NotificationType } from '@/interfaces/notification';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationDetailModalProps {
    notification: Notification | null;
    visible: boolean;
    onClose: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
    notification,
    visible,
    onClose
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    if (!notification) return null;

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

    const colors = getColors(notification.type);
    const formattedDate = new Date(notification.createdAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const handleGoToDevice = () => {
        if (notification.alert?.deviceId) {
            onClose();
            router.push(`/device/${notification.alert.deviceId}`);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
                <TouchableOpacity 
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
                    onPress={onClose}
                    activeOpacity={1}
                />
                <View 
                    className="bg-slate-950 rounded-t-3xl border-t border-slate-800 w-full"
                    style={{ 
                        paddingBottom: insets.bottom,
                        maxHeight: '90%'
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
                        <Text className="text-lg font-bold text-slate-50">Detalle de Notificación</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={20} color="#f8fafc" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
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
                        <View className="bg-slate-900 rounded-xl p-5 mb-4 border border-slate-800">
                            <Text className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Título</Text>
                            <Text className="text-slate-50 text-lg font-bold">
                                {notification.title}
                            </Text>
                        </View>

                        {/* Message */}
                        <View className="bg-slate-900 rounded-xl p-5 mb-4 border border-slate-800">
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

                            <View className="flex-row justify-between p-4 border-b border-slate-800">
                                <Text className="text-slate-400">ID de Notificación</Text>
                                <Text className="text-slate-50 font-medium">
                                    #{notification.id}
                                </Text>
                            </View>

                            {notification.alertId && (
                                <View className="flex-row justify-between p-4 border-b border-slate-800">
                                    <Text className="text-slate-400">ID de Alerta</Text>
                                    <Text className="text-slate-50 font-medium">
                                        #{notification.alertId}
                                    </Text>
                                </View>
                            )}

                            <View className="flex-row justify-between p-4">
                                <Text className="text-slate-400">Estado de Envío</Text>
                                <View className="flex-row items-center gap-2">
                                    <View className={`w-2 h-2 rounded-full ${notification.sent ? 'bg-green-500' : 'bg-gray-500'}`} />
                                    <Text className={notification.sent ? "text-green-500 font-medium" : "text-gray-500 font-medium"}>
                                        {notification.sent ? 'Enviada' : 'Pendiente'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Alert Details if available */}
                        {notification.alert && (
                            <View className="bg-slate-900 rounded-xl p-5 mb-4 border border-slate-800">
                                <Text className="text-slate-400 text-xs mb-4 uppercase tracking-wide">
                                    Información de la Alerta
                                </Text>

                                <View className="space-y-3">
                                    <View className="mb-3">
                                        <Text className="text-slate-400 text-xs mb-1">Tipo de Alerta</Text>
                                        <Text className="text-slate-100 font-medium">
                                            {notification.alert.alertType.replace('_', ' ')}
                                        </Text>
                                    </View>

                                    <View className="mb-3">
                                        <Text className="text-slate-400 text-xs mb-1">Severidad</Text>
                                        <Text className={`font-bold ${notification.alert.severity === 'CRITICAL' ? 'text-red-500' :
                                                notification.alert.severity === 'HIGH' ? 'text-orange-500' :
                                                    notification.alert.severity === 'MEDIUM' ? 'text-yellow-500' :
                                                        'text-blue-500'
                                            }`}>
                                            {notification.alert.severity}
                                        </Text>
                                    </View>

                                    {notification.alert.gasValuePpm && (
                                        <View className="mb-3">
                                            <Text className="text-slate-400 text-xs mb-1">Concentración de Gas</Text>
                                            <Text className="text-slate-100 font-medium">
                                                {notification.alert.gasValuePpm.toFixed(2)} PPM
                                            </Text>
                                        </View>
                                    )}

                                    <View className="mb-3">
                                        <Text className="text-slate-400 text-xs mb-1">Estado</Text>
                                        <View className="flex-row items-center gap-2">
                                            <View className={`w-2 h-2 rounded-full ${notification.alert.resolved ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <Text className={notification.alert.resolved ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                                {notification.alert.resolved ? 'Resuelta' : 'Activa'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="pb-6">
                            {notification.alert && notification.alert.deviceId && (
                                <TouchableOpacity
                                    onPress={handleGoToDevice}
                                    className="bg-blue-600 rounded-xl p-4 items-center mb-3"
                                    activeOpacity={0.8}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
                                        <Text className="text-white text-base font-semibold">
                                            Ver Dispositivo
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-slate-700 rounded-xl p-4 items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-base font-semibold">
                                    Cerrar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};