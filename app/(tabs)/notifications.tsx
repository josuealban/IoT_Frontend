// app/(tabs)/notifications.tsx - CON TIPOS CORREGIDOS

import { Notification } from '@/interfaces/notification';
import notificationService from '@/services/notificationSensorService';
import { NotificationItem } from '@/src/presentation/components/notifications/NotificationItem';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SectionList,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLLING_INTERVAL = 4000; // 4 segundos

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    // ✅ TIPO CORRECTO para React Native/TypeScript
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isFetchingRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            setIsScreenFocused(true);
            fetchNotifications();
            startPolling();

            return () => {
                setIsScreenFocused(false);
                stopPolling();
            };
        }, [])
    );

    const startPolling = () => {
        stopPolling();
        
        pollingIntervalRef.current = setInterval(() => {
            fetchNotifications(true);
        }, POLLING_INTERVAL);

        console.log(`🔔 Notifications polling iniciado cada ${POLLING_INTERVAL / 1000}s`);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            console.log('⏹️ Notifications polling detenido');
        }
    };

    const fetchNotifications = async (isPolling: boolean = false) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            const data = await notificationService.getNotifications();
            
            if (isPolling) {
                const hasNewNotifications = data.length > notifications.length;
                if (hasNewNotifications) {
                    console.log('🔔 Nuevas notificaciones:', {
                        nuevas: data.length - notifications.length,
                        total: data.length,
                        noLeidas: data.filter(n => !n.read).length,
                        timestamp: new Date().toLocaleTimeString()
                    });
                }
            }
            
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (!isPolling) {
                setNotifications([]);
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const groupNotifications = (notifs: Notification[]) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups: { title: string; data: Notification[] }[] = [
            { title: 'HOY', data: [] },
            { title: 'AYER', data: [] },
            { title: 'ANTERIOR', data: [] }
        ];

        notifs.forEach(n => {
            const date = new Date(n.createdAt);
            if (date.toDateString() === today.toDateString()) {
                groups[0].data.push(n);
            } else if (date.toDateString() === yesterday.toDateString()) {
                groups[1].data.push(n);
            } else {
                groups[2].data.push(n);
            }
        });

        return groups.filter(g => g.data.length > 0);
    };

    const sections = groupNotifications(notifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-slate-800">
                <View>
                    <Text className="text-2xl font-bold text-slate-50">Notificaciones</Text>
                    {unreadCount > 0 && (
                        <Text className="text-slate-400 text-sm mt-1">
                            {unreadCount} sin leer
                        </Text>
                    )}
                </View>
                {isScreenFocused && (
                    <View className="flex-row items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <Text className="text-green-500 text-xs font-medium">
                            Actualizando
                        </Text>
                    </View>
                )}
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-slate-400 mt-4">Cargando notificaciones...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={() => {
                                console.log('Notificación presionada:', item.id);
                            }}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="bg-slate-950 px-4 py-2 mt-2">
                            <Text className="text-slate-500 text-xs font-bold tracking-wider">
                                {title}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#3b82f6"
                            colors={['#3b82f6']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                                <Text className="text-4xl">🔔</Text>
                            </View>
                            <Text className="text-slate-400 text-lg font-medium mb-2">
                                No tienes notificaciones
                            </Text>
                            <Text className="text-slate-500 text-center text-sm px-8">
                                Las alertas de tus dispositivos aparecerán aquí en tiempo real
                            </Text>
                        </View>
                    }
                    stickySectionHeadersEnabled={false}
                />
            )}
        </SafeAreaView>
    );
}