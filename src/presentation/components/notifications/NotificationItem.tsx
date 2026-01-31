import { Notification, NotificationType } from '@/interfaces/notification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
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
                return { bg: 'bg-red-500/10', icon: '#ef4444', text: 'text-red-500' };
            case NotificationType.WARNING:
                return { bg: 'bg-yellow-500/10', icon: '#f59e0b', text: 'text-yellow-500' };
            case NotificationType.SUCCESS:
                return { bg: 'bg-green-500/10', icon: '#10b981', text: 'text-green-500' };
            case NotificationType.INFO:
                return { bg: 'bg-blue-500/10', icon: '#3b82f6', text: 'text-blue-500' };
            default:
                return { bg: 'bg-slate-500/10', icon: '#64748b', text: 'text-slate-500' };
        }
    };

    const colors = getColors(notification.type);
    const timeAgo = new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <TouchableOpacity
            onPress={() => onPress(notification)}
            className={`flex-row p-4 border-b border-slate-800 ${!notification.read ? 'bg-slate-900' : ''}`}
            activeOpacity={0.7}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${colors.bg}`}>
                <Ionicons name={getIcon(notification.type) as any} size={20} color={colors.icon} />
                {!notification.read && (
                    <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-950" />
                )}
            </View>

            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className={`text-xs font-bold uppercase ${colors.text}`}>
                        {notification.type}
                    </Text>
                    <Text className="text-slate-500 text-xs">{timeAgo}</Text>
                </View>

                <Text className="text-slate-100 font-semibold mb-1">
                    {notification.title}
                </Text>
                <Text className="text-slate-400 text-sm leading-5" numberOfLines={2}>
                    {notification.message}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
