// app/device/[id].tsx - CON TIPOS CORREGIDOS

import { DeviceSettingsModal } from '@/components/DeviceSettingsModal';
import { Device, DeviceStatus } from '@/interfaces/device';
import deviceService from '@/services/deviceService';
import notificationService from '@/services/notificationServices';
import socketService from '@/services/socketService';
import { NotificationDetailModal } from '@/src/presentation/components/notifications/NotificationDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEVICE_INFO_REFRESH = 30000; // 30s - solo para info del dispositivo (alertas, settings), NO para datos de sensores
const MQ2_THRESHOLD_DEFAULT = 400;

export default function DeviceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [realtimeData, setRealtimeData] = useState<any>(null);
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isFanOn, setIsFanOn] = useState(false);
    const [actuatorLoading, setActuatorLoading] = useState<string | null>(null);

    // Estado para el modal de alerta
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // ✅ TIPO CORRECTO para React Native/TypeScript
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (id) {
            fetchDeviceDetails();
            // Polling lento solo para info (alertas, estado de conexión)
            // Los datos de sensores llegan 100% por WebSocket
            startPolling();
        }

        return () => {
            stopPolling();
            if (lastSubscribedKey.current) {
                socketService.unsubscribeFromDevice(lastSubscribedKey.current);
                lastSubscribedKey.current = null;
            }
        };
    }, [id]);

    // Suscribirse a WebSocket cuando tengamos la deviceKey
    const lastSubscribedKey = useRef<string | null>(null);

    useEffect(() => {
        if (device?.deviceKey && device.deviceKey !== lastSubscribedKey.current) {
            if (lastSubscribedKey.current) {
                socketService.unsubscribeFromDevice(lastSubscribedKey.current);
            }

            // Conectar primero si no está conectado
            socketService.connect();


            socketService.subscribeToDevice(device.deviceKey, (data) => {

                setRealtimeData(data);
            });
            lastSubscribedKey.current = device.deviceKey;
        }

        return () => { };
    }, [device?.deviceKey]);

    const startPolling = () => {
        stopPolling();
        // Solo refresca info del dispositivo (alertas, settings) cada 30s
        // Los sensores se actualizan via WebSocket en tiempo real
        pollingIntervalRef.current = setInterval(() => {
            fetchDeviceDetails(true);
        }, DEVICE_INFO_REFRESH);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const fetchDeviceDetails = async (isPolling: boolean = false) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            const deviceId = typeof id === 'string' ? parseInt(id) : id[0] ? parseInt(id[0]) : 0;

            if (!deviceId || isNaN(deviceId)) {

                if (!isPolling) {
                    Alert.alert('Error', 'ID de dispositivo inválido');
                    router.back();
                }
                return;
            }

            const data = await deviceService.getDeviceById(deviceId);

            if (isPolling) {
                const hasNewData = !device ||
                    device.sensorData?.[0]?.id !== data.sensorData?.[0]?.id ||
                    device.status !== data.status;

                // Solo loguear cuando hay cambios significativos
                if (hasNewData && data.sensorData?.[0]) {

                }
            }

            setDevice(data);

            // Sincronizar estados de actuadores desde la DB al cargar/actualizar
            if (data) {
                setIsWindowOpen(data.windowStatus);
                setIsFanOn(data.fanStatus);
            }
        } catch (error: any) {


            if (!isPolling) {
                if (error?.response?.status === 404) {
                    Alert.alert(
                        'Dispositivo no encontrado',
                        'El dispositivo que buscas no existe o no tienes acceso a él.',
                        [{ text: 'OK', onPress: () => router.back() }]
                    );
                } else {
                    Alert.alert('Error', 'No se pudo cargar la información del dispositivo');
                }
            } else {

            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDeviceDetails();
    };

    const handleSaveSettings = async (data: any) => {
        if (!device) return;

        try {
            // Separar datos básicos de la configuración técnica
            const { name, description, location, ...settings } = data;

            // Ejecutar ambas actualizaciones
            await Promise.all([
                deviceService.updateDevice(device.id, { name, description, location }),
                deviceService.updateSettings(device.id, settings)
            ]);

            // Refrescar datos del dispositivo para mostrar la nueva configuración
            await fetchDeviceDetails();
        } catch (error) {

            throw error;
        }
    };

    const handleActuatorControl = async (actuator: 'window' | 'fan', status: boolean) => {
        if (!device?.deviceKey) return;

        try {
            setActuatorLoading(actuator);
            // Hacer la petición al endpoint manual
            await deviceService.controlActuator(device.deviceKey, actuator, status);

            // Actualización optimista del UI
            if (actuator === 'window') setIsWindowOpen(status);
            if (actuator === 'fan') setIsFanOn(status);

        } catch (error) {

            Alert.alert('Error', `No se pudo ${status ? 'activar' : 'desactivar'} el componente.`);
        } finally {
            setActuatorLoading(null);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        // Sincronizar estado si se resolvió en el modal
        if (selectedNotification?.alert?.resolved) {
            const alertId = selectedNotification.alert.id;
            setDevice(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    alerts: prev.alerts?.map(a => a.id === alertId ? { ...a, resolved: true } : a)
                };
            });
        }
        setTimeout(() => setSelectedNotification(null), 300);
    };

    const handleAlertPress = (alert: any) => {
        // Envolver la alerta en un objeto tipo notificación para el modal
        const pseudoNotification = {
            id: alert.id,
            title: alert.message.split(':')[0],
            message: alert.message,
            createdAt: alert.createdAt,
            alert: alert,
            alertId: alert.id,
            type: 'ALERT'
        };
        setSelectedNotification(pseudoNotification);
        setModalVisible(true);
    };

    const handleResolveAlert = async (alertId: number) => {
        try {
            await deviceService.resolveAlert(alertId);
            // Actualizar interfaz
            await fetchDeviceDetails();
            notificationService.success('Alerta Resuelta', 'La alerta ha sido marcada como atendida');
        } catch (error) {

            Alert.alert('Error', 'No se pudo resolver la alerta');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <ActivityIndicator size="large" color="#64748b" />
                <Text className="text-slate-400 mt-4">Cargando dispositivo...</Text>
            </SafeAreaView>
        );
    }

    if (!device) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <View className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="alert-circle-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-slate-400 text-lg mb-2">Dispositivo no encontrado</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-slate-700 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-medium">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE: return 'text-green-500';
            case DeviceStatus.OFFLINE: return 'text-gray-500';
            case DeviceStatus.MAINTENANCE: return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBgColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE: return 'border-green-500/20';
            case DeviceStatus.OFFLINE: return 'border-slate-700';
            case DeviceStatus.MAINTENANCE: return 'border-yellow-500/20';
            default: return 'border-slate-700';
        }
    };

    const getStatusIconColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE: return '#10b981';
            case DeviceStatus.OFFLINE: return '#64748b';
            case DeviceStatus.MAINTENANCE: return '#f59e0b';
            default: return '#64748b';
        }
    };

    // --- LÓGICA DE VISUALIZACIÓN DE DATOS (Real-time con Fallback) ---
    // Intentamos obtener el último dato histórico si no hay tiempo real aún
    const lastHistory = device.sensorData && device.sensorData.length > 0
        ? device.sensorData[0]
        : null;

    const sensorDisplay = [
        {
            id: 'mq2', label: 'MQ2', gas: 'LPG / Humo',
            ppm: realtimeData?.mq2?.ppm ?? lastHistory?.gasConcentrationPpm,
            threshold: device.deviceSettings?.mq2ThresholdPpm,
            icon: 'flame-outline' as const, color: '#f97316', bgColor: 'bg-orange-500/10',
        },
        {
            id: 'mq3', label: 'MQ3', gas: 'Alcohol',
            ppm: realtimeData?.mq3?.ppm ?? device.deviceSettings?.mq3ThresholdPpm, // MQ3 a veces no está en history
            threshold: device.deviceSettings?.mq3ThresholdPpm,
            icon: 'wine-outline' as const, color: '#a855f7', bgColor: 'bg-purple-500/10',
        },
        {
            id: 'mq5', label: 'MQ5', gas: 'Metano',
            ppm: realtimeData?.mq5?.ppm ?? device.deviceSettings?.mq5ThresholdPpm,
            threshold: device.deviceSettings?.mq5ThresholdPpm,
            icon: 'cloud-outline' as const, color: '#3b82f6', bgColor: 'bg-blue-500/10',
        },
        {
            id: 'mq9', label: 'MQ9', gas: 'Monóxido CO',
            ppm: realtimeData?.mq9?.ppm ?? device.deviceSettings?.mq9ThresholdPpm,
            threshold: device.deviceSettings?.mq9ThresholdPpm,
            icon: 'skull-outline' as const, color: '#ef4444', bgColor: 'bg-red-500/10',
        },
    ];

    const displayTemp = realtimeData?.temperature ?? lastHistory?.temperature;
    const displayHum = realtimeData?.humidity ?? lastHistory?.humidity;
    const hasAnyReading = realtimeData !== null || lastHistory !== null;

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <View className="flex-1 items-center mx-4">
                    <Text className="text-lg font-bold text-slate-50" numberOfLines={1}>
                        {device.name}
                    </Text>
                </View>
                <TouchableOpacity
                    className="p-2 -mr-2"
                    onPress={() => setSettingsModalVisible(true)}
                >
                    <Ionicons name="settings-outline" size={24} color="#f8fafc" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-6"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#64748b"
                        colors={['#64748b']}
                    />
                }
            >
                {/* Estado del dispositivo */}
                <View className="bg-slate-900 rounded-xl p-5 mb-4 border border-slate-800">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className={`w-14 h-14 rounded-full items-center justify-center bg-slate-800 border-2 ${getStatusBgColor(device.status)}`}>
                                <Ionicons
                                    name={device.status === DeviceStatus.ONLINE ? "cloud-done-outline" : "cloud-offline-outline"}
                                    size={28}
                                    color={getStatusIconColor(device.status)}
                                />
                            </View>
                            <View>
                                <Text className={`text-lg font-bold ${getStatusColor(device.status)}`}>
                                    {device.status}
                                </Text>
                                <Text className="text-slate-400 text-xs">
                                    {device.location || 'Sin ubicación'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2 ${realtimeData ? 'bg-green-500' : 'bg-slate-500'}`} />
                            <Text className={`text-xs font-medium ${realtimeData ? 'text-green-500' : 'text-slate-500'}`}>
                                {realtimeData ? 'EN VIVO' : 'SIN DATOS'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Grid de sensores */}
                <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Sensores de Gas
                </Text>

                {hasAnyReading ? (
                    <View className="flex-row flex-wrap justify-between mb-4">
                        {sensorDisplay.map((sensor) => {
                            const threshold = sensor.threshold ?? 999999;
                            const isExceeded = sensor.ppm !== undefined && sensor.ppm > threshold;
                            return (
                                <View
                                    key={sensor.id}
                                    className={`w-[48%] rounded-xl p-4 mb-3 border ${isExceeded ? 'border-red-500/50 bg-red-950/30' : 'border-slate-800 bg-slate-900'
                                        }`}
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className={`w-9 h-9 rounded-full items-center justify-center ${sensor.bgColor}`}>
                                            <Ionicons name={sensor.icon} size={18} color={sensor.color} />
                                        </View>
                                        <Text className="text-slate-500 text-xs font-bold">{sensor.label}</Text>
                                    </View>
                                    <Text className={`font-bold text-2xl mb-1 ${isExceeded ? 'text-red-500' : 'text-slate-50'}`}>
                                        {sensor.ppm !== undefined ? sensor.ppm.toFixed(0) : '--'}
                                        <Text className="text-sm text-slate-400 font-normal"> PPM</Text>
                                    </Text>
                                    {isExceeded && (
                                        <View className="flex-row items-center mt-2">
                                            <Ionicons name="warning" size={12} color="#ef4444" />
                                            <Text className="text-red-500 text-xs ml-1 font-bold">PELIGRO</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="bg-slate-900 rounded-xl p-8 mb-4 border border-slate-800 items-center">
                        <Ionicons name="information-circle-outline" size={32} color="#64748b" />
                        <Text className="text-slate-400 mt-2">Esperando datos del dispositivo...</Text>
                        <Text className="text-blue-500 text-xs mt-1">Conectando a WebSocket...</Text>
                    </View>
                )}

                {/* Temperatura y Humedad */}
                <View className="flex-row justify-between mb-6">
                    <View className="w-[48%] bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="w-8 h-8 rounded-full bg-amber-500/10 items-center justify-center">
                                <Ionicons name="thermometer-outline" size={16} color="#f59e0b" />
                            </View>
                            <Text className="text-slate-400 text-xs uppercase">Temperatura</Text>
                        </View>
                        <Text className="text-slate-50 font-bold text-2xl">
                            {displayTemp !== undefined && displayTemp !== null ? displayTemp.toFixed(1) : '--'}
                            <Text className="text-sm text-slate-400 font-normal"> °C</Text>
                        </Text>
                    </View>
                    <View className="w-[48%] bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="w-8 h-8 rounded-full bg-cyan-500/10 items-center justify-center">
                                <Ionicons name="water-outline" size={16} color="#06b6d4" />
                            </View>
                            <Text className="text-slate-400 text-xs uppercase">Humedad</Text>
                        </View>
                        <Text className="text-slate-50 font-bold text-2xl">
                            {displayHum !== undefined && displayHum !== null ? displayHum.toFixed(0) : '--'}
                            <Text className="text-sm text-slate-400 font-normal"> %</Text>
                        </Text>
                    </View>
                </View>

                {/* Controles Manuales */}
                <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Controles Manuales
                </Text>
                <View className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
                    <View className="flex-row items-center justify-between py-2 border-b border-slate-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-indigo-500/10 items-center justify-center">
                                <Ionicons name="apps-outline" size={20} color="#6366f1" />
                            </View>
                            <View>
                                <Text className="text-slate-50 font-bold">Ventana</Text>
                                <Text className="text-slate-500 text-xs">Simulación Servo MG996R</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleActuatorControl('window', !isWindowOpen)}
                            disabled={actuatorLoading === 'window'}
                            className={`px-4 py-2 rounded-lg ${isWindowOpen ? 'bg-indigo-600' : 'bg-slate-800'}`}
                        >
                            {actuatorLoading === 'window' ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-bold">{isWindowOpen ? 'CERRAR' : 'ABRIR'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between py-2 mt-2">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center">
                                <Ionicons name="sync-outline" size={20} color="#10b981" />
                            </View>
                            <View>
                                <Text className="text-slate-50 font-bold">Ventilación</Text>
                                <Text className="text-slate-500 text-xs">Extractor / Ventilador</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleActuatorControl('fan', !isFanOn)}
                            disabled={actuatorLoading === 'fan'}
                            className={`px-4 py-2 rounded-lg ${isFanOn ? 'bg-emerald-600' : 'bg-slate-800'}`}
                        >
                            {actuatorLoading === 'fan' ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-bold">{isFanOn ? 'APAGAR' : 'ENCENDER'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4 p-3 bg-slate-950 rounded-lg flex-row items-start gap-2">
                        <Ionicons name="information-circle" size={16} color="#64748b" />
                        <Text className="text-slate-500 text-[10px] flex-1">
                            El modo manual desactiva temporalmente el control automático de seguridad durante 5 minutos o hasta que se detecte una nueva alerta crítica.
                        </Text>
                    </View>
                </View>



                <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Umbrales de Configuración
                </Text>

                <View className="bg-slate-900 rounded-xl overflow-hidden mb-6 border border-slate-800">
                    <View className="flex-row flex-wrap p-2">
                        <View className="w-1/2 p-2 border-r border-b border-slate-800">
                            <Text className="text-slate-500 text-[10px] uppercase">MQ2 (LPG)</Text>
                            <Text className="text-slate-50 font-bold">{device.deviceSettings?.mq2ThresholdPpm || '--'} PPM</Text>
                        </View>
                        <View className="w-1/2 p-2 border-b border-slate-800">
                            <Text className="text-slate-500 text-[10px] uppercase">MQ3 (Alcohol)</Text>
                            <Text className="text-slate-50 font-bold">{device.deviceSettings?.mq3ThresholdPpm || '--'} PPM</Text>
                        </View>
                        <View className="w-1/2 p-2 border-r border-slate-800">
                            <Text className="text-slate-500 text-[10px] uppercase">MQ5 (Metano)</Text>
                            <Text className="text-slate-50 font-bold">{device.deviceSettings?.mq5ThresholdPpm || '--'} PPM</Text>
                        </View>
                        <View className="w-1/2 p-2">
                            <Text className="text-slate-500 text-[10px] uppercase">MQ9 (CO)</Text>
                            <Text className="text-slate-50 font-bold">{device.deviceSettings?.mq9ThresholdPpm || '--'} PPM</Text>
                        </View>
                    </View>

                    <View className="p-4 bg-slate-800/20 border-t border-slate-800">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-slate-400">Device Key</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    require('react-native').Clipboard.setString(device.deviceKey);
                                    notificationService.success('Copiado', 'Clave del dispositivo copiada al portapapeles');
                                }}
                                className="flex-row items-center bg-blue-600/20 px-2 py-1 rounded"
                            >
                                <Ionicons name="copy-outline" size={12} color="#3b82f6" />
                                <Text className="text-blue-400 text-[10px] ml-1">Copiar</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-slate-50 font-mono text-[10px] opacity-60">
                            {device.deviceKey}
                        </Text>
                    </View>
                </View>


                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] ml-1">
                        Alertas Recientes
                    </Text>
                    {device.alerts && device.alerts.filter((a: any) => !a.resolved).length > 0 && (
                        <View className="bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/30">
                            <Text className="text-red-500 text-[9px] font-black tracking-tighter">
                                {device.alerts.filter((a: any) => !a.resolved).length} ACTIVAS
                            </Text>
                        </View>
                    )}
                </View>

                {device.alerts && device.alerts.length > 0 ? (
                    <View className="mb-8">
                        {device.alerts.slice(0, 5).map((alert: any, index: number) => {
                            const isResolved = alert.resolved;
                            const severityColor = alert.severity === 'CRITICAL' ? '#ef4444' :
                                alert.severity === 'HIGH' ? '#f97316' :
                                    alert.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6';
                            const severityBg = alert.severity === 'CRITICAL' ? 'bg-red-500/10' :
                                alert.severity === 'HIGH' ? 'bg-orange-500/10' :
                                    alert.severity === 'MEDIUM' ? 'bg-yellow-500/10' : 'bg-blue-500/10';
                            const severityIcon = alert.severity === 'CRITICAL' ? 'skull' :
                                alert.severity === 'HIGH' ? 'warning' :
                                    alert.severity === 'MEDIUM' ? 'alert-circle' : 'notifications';

                            return (
                                <TouchableOpacity
                                    key={alert.id}
                                    onPress={() => handleAlertPress(alert)}
                                    activeOpacity={0.7}
                                    className={`mb-3 rounded-2xl p-4 border ${isResolved ? 'bg-slate-900/40 border-white/5 opacity-70' : 'bg-slate-900 border-white/10'}`}
                                >
                                    <View className="flex-row gap-4">
                                        <View className={`w-12 h-12 rounded-full items-center justify-center ${isResolved ? 'bg-slate-800' : severityBg}`}>
                                            <Ionicons
                                                name={isResolved ? "checkmark-circle" : (severityIcon as any)}
                                                size={24}
                                                color={isResolved ? '#22c55e' : severityColor}
                                            />
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className={`text-[9px] font-black uppercase tracking-widest ${isResolved ? 'text-emerald-500/60' : (alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-slate-500')}`}>
                                                    {isResolved ? '✓ RESUELTA' : alert.severity}
                                                </Text>
                                                <Text className="text-slate-600 text-[10px]">
                                                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>

                                            <Text className={`text-[15px] font-bold ${isResolved ? 'text-slate-400' : 'text-slate-100'} mb-1`}>
                                                {alert.message.split(':')[0]}
                                            </Text>

                                            <View className="flex-row items-center justify-between mt-3">
                                                <View className="flex-row items-center">
                                                    <View className={`px-2 py-0.5 rounded-md ${isResolved ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                                        <Text className={`text-[8px] font-black uppercase ${isResolved ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {isResolved ? '✓ RESUELTA' : '✕ SIN RESOLVER'}
                                                        </Text>
                                                    </View>
                                                    <View className="w-1 h-1 rounded-full bg-slate-800 mx-2" />
                                                    <Ionicons name="stats-chart" size={12} color={isResolved ? '#64748b' : '#94a3b8'} />
                                                    <Text className="text-slate-400 text-xs ml-1 font-bold">
                                                        {alert.gasValuePpm?.toFixed(1)} PPM
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View className="bg-slate-900 rounded-xl p-8 border border-slate-800 mb-8 items-center">
                        <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
                        <Text className="text-slate-400 mt-3 text-center">
                            No hay alertas recientes
                        </Text>
                        <Text className="text-slate-500 text-sm mt-1 text-center">
                            Todo funciona correctamente
                        </Text>
                    </View>
                )}
            </ScrollView>

            <DeviceSettingsModal
                visible={settingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
                device={device}
                settings={device?.deviceSettings || null}
                onSave={handleSaveSettings}
            />

            <NotificationDetailModal
                notification={selectedNotification}
                visible={modalVisible}
                onClose={handleCloseModal}
            />
        </SafeAreaView >
    );
}