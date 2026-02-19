import { Notification } from '@/interfaces/notification';
import deviceService from '@/services/deviceService';
import notificationService from '@/services/notificationSensorService';
import { NotificationDetailModal } from '@/src/presentation/components/notifications/NotificationDetailModal';
import { NotificationItem } from '@/src/presentation/components/notifications/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SectionList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLLING_INTERVAL = 4000;

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Estados para el modal
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isFetchingRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
            startPolling();

            return () => {
                stopPolling();
            };
        }, [])
    );

    const startPolling = () => {
        stopPolling();
        pollingIntervalRef.current = setInterval(() => {
            fetchNotifications(true);
        }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const fetchNotifications = async (isPolling: boolean = false) => {
        if (isFetchingRef.current) return;
        try {
            isFetchingRef.current = true;
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {

            if (!isPolling) setNotifications([]);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleResolveAlert = async (alertId: number) => {
        try {
            await deviceService.resolveAlert(alertId);
            // Actualizar localmente la lista
            setNotifications(prev => prev.map(n => {
                if (n.alert?.id === alertId) {
                    return { ...n, alert: { ...n.alert, resolved: true } };
                }
                return n;
            }));
        } catch (error) {
            Alert.alert('Error', 'No se pudo resolver la alerta');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNotificationPress = (notification: Notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        // Sincronizar el estado resuelto del modal a la lista principal de forma persistente
        if (selectedNotification && (selectedNotification.alert?.resolved || selectedNotification.alertId)) {
            // Si el objeto alert en la notificación seleccionada está resuelto, actualizamos la lista
            if (selectedNotification.alert?.resolved) {
                setNotifications(prev => prev.map(n =>
                    n.id === selectedNotification.id
                        ? {
                            ...n,
                            alert: n.alert ? { ...n.alert, resolved: true } : undefined
                        }
                        : n
                ));
            }
        }
        setTimeout(() => setSelectedNotification(null), 300);
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

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            {/* Header Premium */}
            <View className="px-6 py-6 flex-row justify-between items-end bg-slate-950/50">
                <View>
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Centro de Control</Text>
                    <Text className="text-4xl font-black text-slate-50 tracking-tighter">Eventos</Text>
                    <View className="flex-row items-center mt-2 bg-blue-500/10 self-start px-2 py-0.5 rounded-full border border-blue-500/20">
                        <View className="w-1 h-1 rounded-full bg-blue-400 mr-2" />
                        <Text className="text-blue-400 text-[9px] font-black uppercase tracking-widest">
                            {notifications.length} Actividades
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => notificationService.markAllAsRead().then(() => fetchNotifications())}
                    className="w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center border border-white/5 shadow-lg"
                >
                    <Ionicons name="checkmark-done-outline" size={24} color="#6366f1" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text className="text-slate-500 font-bold mt-4 tracking-widest text-[10px] uppercase">Sincronizando...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                            onResolve={handleResolveAlert}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="bg-slate-950/90 px-6 py-4">
                            <Text className="text-slate-600 text-[10px] font-black tracking-[4px]">
                                {title}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#6366f1"
                        />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 px-10">
                            <View className="w-24 h-24 rounded-[40px] bg-slate-900 items-center justify-center mb-6 border border-white/5">
                                <Ionicons name="notifications-off-outline" size={40} color="#334155" />
                            </View>
                            <Text className="text-slate-100 text-xl font-black mb-2 text-center">
                                Bandeja Limpia
                            </Text>
                            <Text className="text-slate-500 text-center text-sm font-medium">
                                No hay eventos recientes registrados en tu sistema.
                            </Text>
                        </View>
                    }
                    stickySectionHeadersEnabled={true}
                />
            )}

            <NotificationDetailModal
                notification={selectedNotification}
                visible={modalVisible}
                onClose={handleCloseModal}
            />
        </SafeAreaView>
    );
}