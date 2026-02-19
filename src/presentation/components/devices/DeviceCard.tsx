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

    const isOnline = device.status === DeviceStatus.ONLINE;
    const lastReading = device.sensorData && device.sensorData.length > 0 ? device.sensorData[0] : null;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/device/${device.id}`)}
            className="bg-slate-900/80 rounded-3xl p-5 mb-4 border border-white/5 shadow-2xl"
            activeOpacity={0.8}
        >
            {/* Upper Section */}
            <View className="flex-row justify-between items-start mb-5">
                <View className="flex-row items-center gap-4">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isOnline ? 'bg-indigo-500/10' : 'bg-slate-800'}`}>
                        <Ionicons
                            name={isOnline ? "pulse-outline" : "wifi-outline"}
                            size={24}
                            color={isOnline ? "#6366f1" : "#475569"}
                        />
                    </View>
                    <View>
                        <Text className="text-slate-100 font-black text-lg tracking-tight">{device.name}</Text>
                        <View className="flex-row items-center mt-0.5">
                            <Ionicons name="location-sharp" size={10} color="#64748b" />
                            <Text className="text-slate-500 text-[10px] font-bold uppercase ml-1 tracking-widest">
                                {device.location || 'GLOBAL'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className={`px-3 py-1.5 rounded-xl flex-row items-center gap-2 border ${isOnline ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-700 bg-slate-800'}`}>
                    <View className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                    <Text className={`text-[10px] font-black tracking-widest uppercase ${isOnline ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {device.status}
                    </Text>
                </View>
            </View>

            {/* Stats Overview */}
            <View className="flex-row gap-2 mb-4">
                <View className="flex-1 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Nivel MQ2</Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-slate-100 text-lg font-black">
                            {lastReading?.gasConcentrationPpm?.toFixed(0) || '0'}
                        </Text>
                        <Text className="text-slate-600 text-[10px] font-bold">PPM</Text>
                    </View>
                </View>
                <View className="flex-1 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Estado</Text>
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons
                            name={lastReading?.gasConcentrationPpm && lastReading.gasConcentrationPpm > 400 ? "warning" : "checkmark-circle"}
                            size={16}
                            color={lastReading?.gasConcentrationPpm && lastReading.gasConcentrationPpm > 400 ? "#ef4444" : "#22c55e"}
                        />
                        <Text className={`text-[10px] font-black uppercase ${lastReading?.gasConcentrationPpm && lastReading.gasConcentrationPpm > 400 ? 'text-red-500' : 'text-green-500'}`}>
                            {lastReading?.gasConcentrationPpm && lastReading.gasConcentrationPpm > 400 ? 'PELIGRO' : 'SEGURO'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Footer */}
            <View className="flex-row justify-between items-center pt-4 border-t border-white/5">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#475569" />
                    <Text className="text-slate-500 text-[10px] ml-1.5 font-bold uppercase tracking-tighter">
                        Actualizado: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </Text>
                </View>
                <TouchableOpacity
                    className="bg-indigo-600/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                    onPress={() => router.push(`/device/${device.id}`)}
                >
                    <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Detalles</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};
