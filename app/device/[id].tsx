// app/device/[id].tsx - CON TIPOS CORREGIDOS

import { DeviceSettingsModal } from '@/components/DeviceSettingsModal';
import { Device, DeviceStatus } from '@/interfaces/device';
import deviceService from '@/services/deviceService';
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

const POLLING_INTERVAL = 3000; // 3 segundos

export default function DeviceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    // ✅ TIPO CORRECTO para React Native/TypeScript
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (id) {
            fetchDeviceDetails();
            startPolling();
        }

        return () => {
            stopPolling();
        };
    }, [id]);

    const startPolling = () => {
        stopPolling();
        pollingIntervalRef.current = setInterval(() => {
            fetchDeviceDetails(true);
        }, POLLING_INTERVAL);
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
                console.error('ID de dispositivo inválido:', id);
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
                    console.log('📊 Datos actualizados');
                }
            }

            setDevice(data);
        } catch (error: any) {
            console.error('Error fetching device details:', error);

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
                console.log('⚠️ Error en polling (se reintentará):', error.message);
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

    const handleSaveSettings = async (settings: any) => {
        if (!device) return;

        try {
            await deviceService.updateSettings(device.id, settings);
            // Refrescar datos del dispositivo para mostrar la nueva configuración
            await fetchDeviceDetails();
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
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

    const latestReading = device.sensorData && device.sensorData.length > 0
        ? device.sensorData[0]
        : null;

    const isGasThresholdExceeded = latestReading && device.deviceSettings &&
        latestReading.gasConcentrationPpm &&
        latestReading.gasConcentrationPpm > device.deviceSettings.gasThresholdPpm;

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
                    <View className="flex-row items-center gap-1 mt-1">
                        <View className="w-2 h-2 rounded-full bg-slate-400" />
                        <Text className="text-slate-400 text-xs font-medium">
                            Actualizando cada {POLLING_INTERVAL / 1000}s
                        </Text>
                    </View>
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
                <View className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
                    <View className="items-center mb-4">
                        <View className={`w-24 h-24 rounded-full items-center justify-center bg-slate-800 mb-3 border-4 ${getStatusBgColor(device.status)}`}>
                            <Ionicons
                                name={device.status === DeviceStatus.ONLINE ? "cloud-done-outline" : "cloud-offline-outline"}
                                size={48}
                                color={getStatusIconColor(device.status)}
                            />
                        </View>
                        <Text className={`text-xl font-bold ${getStatusColor(device.status)}`}>
                            {device.status}
                        </Text>
                        <Text className="text-slate-400 text-sm mt-1">
                            {device.location || 'Sin ubicación'}
                        </Text>
                    </View>

                    {latestReading ? (
                        <>
                            <View className="flex-row justify-between border-t border-slate-800 pt-6 mt-2">
                                <View className="items-center flex-1 border-r border-slate-800">
                                    <Text className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Concentración Gas</Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`font-bold text-2xl ${isGasThresholdExceeded ? 'text-red-500' : 'text-slate-50'
                                            }`}>
                                            {latestReading.gasConcentrationPpm?.toFixed(0) || '--'}
                                            <Text className="text-sm text-slate-400 font-normal"> PPM</Text>
                                        </Text>
                                        {isGasThresholdExceeded && (
                                            <Ionicons name="warning" size={20} color="#ef4444" />
                                        )}
                                    </View>
                                    {device.deviceSettings && (
                                        <Text className="text-slate-500 text-xs mt-1">
                                            Umbral: {device.deviceSettings.gasThresholdPpm} PPM
                                        </Text>
                                    )}
                                </View>
                                <View className="items-center flex-1">
                                    <Text className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Voltaje</Text>
                                    <Text className="text-slate-50 font-bold text-2xl">
                                        {latestReading.voltage?.toFixed(2) || '--'}
                                        <Text className="text-sm text-slate-400 font-normal"> V</Text>
                                    </Text>
                                    <Text className="text-slate-500 text-xs mt-1">
                                        Raw: {latestReading.rawValue}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between border-t border-slate-800 pt-6 mt-6">
                                <View className="items-center flex-1 border-r border-slate-800">
                                    <Text className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Temperatura</Text>
                                    <Text className="text-slate-50 font-bold text-2xl">
                                        {latestReading.temperature?.toFixed(1) || '--'}
                                        <Text className="text-sm text-slate-400 font-normal"> °C</Text>
                                    </Text>
                                </View>
                                <View className="items-center flex-1">
                                    <Text className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Humedad</Text>
                                    <Text className="text-slate-50 font-bold text-2xl">
                                        {latestReading.humidity?.toFixed(0) || '--'}
                                        <Text className="text-sm text-slate-400 font-normal"> %</Text>
                                    </Text>
                                </View>
                            </View>

                            <View className="border-t border-slate-800 pt-4 mt-6 items-center">
                                <Text className="text-slate-500 text-xs">
                                    Última lectura: {new Date(latestReading.createdAt).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View className="border-t border-slate-800 pt-6 mt-2 items-center">
                            <Ionicons name="information-circle-outline" size={32} color="#64748b" />
                            <Text className="text-slate-400 mt-2">No hay lecturas disponibles</Text>
                            <Text className="text-slate-500 text-xs mt-1">Esperando datos del ESP32...</Text>
                        </View>
                    )}
                </View>

                <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Información del Dispositivo
                </Text>

                <View className="bg-slate-900 rounded-xl overflow-hidden mb-6 border border-slate-800">
                    <View className="flex-row justify-between p-4 border-b border-slate-800">
                        <Text className="text-slate-400">Device Key</Text>
                        <Text className="text-slate-50 font-medium text-xs" numberOfLines={1}>
                            {device.deviceKey.substring(0, 20)}...
                        </Text>
                    </View>
                    <View className="flex-row justify-between p-4 border-b border-slate-800">
                        <Text className="text-slate-400">Creado</Text>
                        <Text className="text-slate-50 font-medium">
                            {new Date(device.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View className="flex-row justify-between p-4">
                        <Text className="text-slate-400">Última conexión</Text>
                        <Text className="text-slate-50 font-medium">
                            {device.lastSeen
                                ? new Date(device.lastSeen).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Nunca'
                            }
                        </Text>
                    </View>
                </View>

                {device.deviceSettings && (
                    <>
                        <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                            Configuración
                        </Text>

                        <View className="bg-slate-900 rounded-xl overflow-hidden mb-6 border border-slate-800">
                            <View className="flex-row justify-between p-4 border-b border-slate-800">
                                <Text className="text-slate-400">Umbral de Gas</Text>
                                <Text className="text-slate-50 font-medium">
                                    {device.deviceSettings.gasThresholdPpm} PPM
                                </Text>
                            </View>
                            <View className="flex-row justify-between p-4 border-b border-slate-800">
                                <Text className="text-slate-400">Umbral de Voltaje</Text>
                                <Text className="text-slate-50 font-medium">
                                    {device.deviceSettings.voltageThreshold} V
                                </Text>
                            </View>
                            <View className="flex-row justify-between p-4 border-b border-slate-800">
                                <Text className="text-slate-400">Buzzer</Text>
                                <Text className={device.deviceSettings.buzzerEnabled ? "text-green-500 font-medium" : "text-slate-500 font-medium"}>
                                    {device.deviceSettings.buzzerEnabled ? 'Activado' : 'Desactivado'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between p-4 border-b border-slate-800">
                                <Text className="text-slate-400">LED</Text>
                                <Text className={device.deviceSettings.ledEnabled ? "text-green-500 font-medium" : "text-slate-500 font-medium"}>
                                    {device.deviceSettings.ledEnabled ? 'Activado' : 'Desactivado'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between p-4">
                                <Text className="text-slate-400">R0 Calibración</Text>
                                <Text className="text-slate-50 font-medium">
                                    {device.deviceSettings.calibrationR0} kΩ
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Alertas Activas
                </Text>

                {device.alerts && device.alerts.length > 0 ? (
                    <View className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mb-8">
                        {device.alerts.map((alert: any, index: number) => (
                            <View
                                key={alert.id}
                                className={`p-4 ${index !== device.alerts!.length - 1 ? 'border-b border-slate-800' : ''}`}
                            >
                                <View className="flex-row items-start gap-3">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center ${alert.severity === 'CRITICAL' ? 'bg-red-500/10' :
                                        alert.severity === 'HIGH' ? 'bg-orange-500/10' :
                                            alert.severity === 'MEDIUM' ? 'bg-yellow-500/10' :
                                                'bg-blue-500/10'
                                        }`}>
                                        <Ionicons
                                            name="warning"
                                            size={20}
                                            color={
                                                alert.severity === 'CRITICAL' ? '#ef4444' :
                                                    alert.severity === 'HIGH' ? '#f97316' :
                                                        alert.severity === 'MEDIUM' ? '#f59e0b' :
                                                            '#3b82f6'
                                            }
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className={`text-xs font-bold uppercase ${alert.severity === 'CRITICAL' ? 'text-red-500' :
                                                alert.severity === 'HIGH' ? 'text-orange-500' :
                                                    alert.severity === 'MEDIUM' ? 'text-yellow-500' :
                                                        'text-blue-500'
                                                }`}>
                                                {alert.severity}
                                            </Text>
                                            <Text className="text-slate-500 text-xs">
                                                {new Date(alert.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                        <Text className="text-slate-100 font-semibold mb-1">
                                            {alert.alertType.replace('_', ' ')}
                                        </Text>
                                        <Text className="text-slate-400 text-sm">
                                            {alert.message}
                                        </Text>
                                        {alert.gasValuePpm && (
                                            <Text className="text-slate-500 text-xs mt-1">
                                                Gas: {alert.gasValuePpm.toFixed(2)} PPM
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="bg-slate-900 rounded-xl p-8 border border-slate-800 mb-8 items-center">
                        <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
                        <Text className="text-slate-400 mt-3 text-center">
                            No hay alertas activas
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
                settings={device?.deviceSettings || null}
                onSave={handleSaveSettings}
            />
        </SafeAreaView>
    );
}