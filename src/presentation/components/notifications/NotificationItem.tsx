import { Notification, NotificationType } from '@/interfaces/notification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
    onResolve?: (alertId: number) => Promise<void>;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    onResolve
}) => {
    const [resolving, setResolving] = React.useState(false);

    // Deducir severidad real (Prioridad: título -> objeto alert -> tipo)
    const getRealSeverity = () => {
        const title = notification.title.toUpperCase();
        if (title.includes('CRÍTICO') || title.includes('CRITICAL')) return 'CRITICAL';
        if (title.includes('ALTO') || title.includes('HIGH')) return 'HIGH';
        if (title.includes('MEDIO') || title.includes('MEDIUM')) return 'MEDIUM';
        if (title.includes('BAJO') || title.includes('LOW')) return 'LOW';
        return notification.alert?.severity || (notification.type === NotificationType.ALERT ? 'MEDIUM' : 'INFO');
    };

    const severity = getRealSeverity();
    const alert = notification.alert;
    const isResolved = alert?.resolved;

    const getIcon = () => {
        if (isResolved) return 'checkmark-circle';
        switch (severity) {
            case 'CRITICAL': return 'skull';
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'alert-circle';
            case 'LOW': return 'notifications';
            default: return 'notifications-outline';
        }
    };

    const getColors = () => {
        if (isResolved) {
            return { bg: 'bg-slate-800', icon: '#64748b', text: 'text-slate-500', label: 'RESUELTA' };
        }
        switch (severity) {
            case 'CRITICAL': return { bg: 'bg-red-500/20', icon: '#ef4444', text: 'text-red-500', label: 'CRÍTICO' };
            case 'HIGH': return { bg: 'bg-orange-500/20', icon: '#f97316', text: 'text-orange-500', label: 'ALTO' };
            case 'MEDIUM': return { bg: 'bg-yellow-500/20', icon: '#f59e0b', text: 'text-yellow-500', label: 'MEDIO' };
            case 'LOW': return { bg: 'bg-blue-500/20', icon: '#3b82f6', text: 'text-blue-500', label: 'BAJO' };
            default: return { bg: 'bg-slate-500/10', icon: '#64748b', text: 'text-slate-500', label: 'INFO' };
        }
    };

    const colors = getColors();

    const getPPMValue = () => {
        if (alert?.gasValuePpm) return alert.gasValuePpm.toFixed(1);
        const match = notification.message.match(/(\d+\.?\d*)\s*PPM/);
        return match ? match[1] : null;
    };

    // The handleResolve function is no longer used as the 'RESOLVER ALERTA' button is removed.
    // It is kept here as the instruction only specified removing the button, not the function.
    const handleResolve = async (e: any) => {
        e.stopPropagation();
        const idToResolve = alert?.id || notification.alertId;
        if (!idToResolve || !onResolve) return;
        try {
            setResolving(true);
            await onResolve(idToResolve);
        } finally {
            setResolving(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(notification)}
            className={`mx-4 mb-3 rounded-3xl p-5 border relative ${isResolved ? 'bg-slate-900/60 border-white/5 opacity-70' : 'bg-slate-900 border-white/10'}`}
            activeOpacity={0.7}
        >
            {/* Time Top Right */}
            <Text className="absolute top-5 right-6 text-slate-600 text-[10px] font-bold">
                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <View className="flex-row gap-4 items-start">
                {/* Icon Container Circle */}
                <View className={`w-14 h-14 rounded-full items-center justify-center ${colors.bg}`}>
                    <Ionicons
                        name={getIcon() as any}
                        size={28}
                        color={isResolved ? '#22c55e' : colors.icon}
                    />
                </View>

                {/* Content area */}
                <View className="flex-1">
                    {/* Severity Tag */}
                    <Text className={`text-[10px] font-black uppercase tracking-[2px] mb-1 ${colors.text}`}>
                        {colors.label}
                    </Text>

                    {/* Title */}
                    <Text className={`text-[16px] font-bold ${isResolved ? 'text-slate-400' : 'text-slate-50'} mb-1`} numberOfLines={1}>
                        {notification.title}
                    </Text>

                    {/* Status Badge - Posición solicitada */}
                    <View className="flex-row items-center mb-3">
                        <View className={`px-2 py-1 rounded-md border ${isResolved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${isResolved ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isResolved ? '✓ RESUELTA' : '✕ SIN RESOLVER'}
                            </Text>
                        </View>
                        <View className="mx-2 w-1 h-1 rounded-full bg-slate-800" />
                        <View className="flex-row items-center">
                            <Ionicons name="stats-chart" size={12} color="#64748b" />
                            <Text className="text-slate-400 text-[10px] ml-1.5 font-bold uppercase">
                                {getPPMValue() ? `${getPPMValue()} PPM` : 'N/A PPM'}
                            </Text>
                        </View>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
    );
};