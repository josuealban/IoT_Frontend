import { Device, DeviceStatus } from '@/interfaces/device';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DeviceCardProps {
    device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
    const router = useRouter();

    const getStatusColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE:
                return 'text-green-500 bg-green-500/10';
            case DeviceStatus.OFFLINE:
                return 'text-gray-500 bg-gray-500/10';
            case DeviceStatus.MAINTENANCE:
                return 'text-yellow-500 bg-yellow-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusDotColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE:
                return 'bg-green-500';
            case DeviceStatus.OFFLINE:
                return 'bg-gray-500';
            case DeviceStatus.MAINTENANCE:
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <TouchableOpacity
            onPress={() => router.push(`/device/${device.id}`)}
            className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700 shadow-sm"
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                        <Ionicons name="cloud-outline" size={20} color="#3b82f6" />
                    </View>
                    <View>
                        <Text className="text-slate-100 font-semibold text-lg">{device.name}</Text>
                        <Text className="text-slate-400 text-xs">{device.location || 'Sin ubicación'}</Text>
                    </View>
                </View>

                <View className={`px-2 py-1 rounded-full flex-row items-center gap-1.5 ${getStatusColor(device.status).split(' ')[1]}`}>
                    <View className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(device.status)}`} />
                    <Text className={`text-xs font-medium ${getStatusColor(device.status).split(' ')[0]}`}>
                        {device.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-slate-700">
                <View>
                    <Text className="text-slate-400 text-xs mb-0.5">Última lectura</Text>
                    <Text className="text-slate-200 font-medium">
                        {device.sensorData && device.sensorData.length > 0
                            ? `${device.sensorData[0].gasConcentrationPpm?.toFixed(0)} PPM`
                            : 'N/A'}
                    </Text>
                </View>

                <View className="items-end">
                    <Text className="text-slate-400 text-xs mb-0.5">Conexión</Text>
                    <Text className="text-slate-200 font-medium">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
