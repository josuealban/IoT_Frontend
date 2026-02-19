import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Device } from '@/interfaces/device';
import deviceService from '@/services/deviceService';
import { DeviceCard } from '@/src/presentation/components/devices/DeviceCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLLING_INTERVAL = 15000; // 15 segundos - solo lista de dispositivos

export default function HomeScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // ✅ TIPO CORRECTO para React Native/TypeScript
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      fetchDevices();
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
      fetchDevices(true);
    }, POLLING_INTERVAL);


  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;

    }
  };

  const fetchDevices = async (isPolling: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      const data = await deviceService.getDevices();

      if (Array.isArray(data)) {
        if (isPolling) {
          const hasChanges = JSON.stringify(devices) !== JSON.stringify(data);
          if (hasChanges) {

          }
        }
        setDevices(data);
      } else {
        setDevices([]);
      }
    } catch (error) {

      if (!isPolling) {
        setDevices([]);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  // Recopilar alertas activas de todos los dispositivos
  const activeAlerts = devices.flatMap(device =>
    (device.alerts || [])
      .filter((a: any) => !a.resolved)
      .map((a: any) => ({ ...a, deviceName: device.name, deviceId: device.id }))
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Máximo 5 alertas

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'skull', iconColor: '#f87171', label: 'CRÍTICO' };
      case 'HIGH': return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'warning', iconColor: '#fb923c', label: 'ALTO' };
      case 'MEDIUM': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'alert-circle', iconColor: '#fbbf24', label: 'MEDIO' };
      case 'LOW': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'notifications', iconColor: '#60a5fa', label: 'BAJO' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', icon: 'notifications-outline', iconColor: '#94a3b8', label: 'AVISO' };
    }
  };

  const getQuickAction = (gasType: string, severity: string) => {
    if (severity === 'CRITICAL') return { icon: 'exit-outline', text: 'Evacúe el área inmediatamente', color: '#f87171' };
    if (severity === 'HIGH') return { icon: 'people-outline', text: 'Alerte a personas cercanas', color: '#fb923c' };
    switch (gasType) {
      case 'LPG': return { icon: 'flame-outline', text: 'No use llamas ni fósforos', color: '#fbbf24' };
      case 'CO': return { icon: 'medical-outline', text: 'Busque aire fresco', color: '#f87171' };
      case 'SMOKE': return { icon: 'eye-outline', text: 'Identifique el origen del humo', color: '#fbbf24' };
      case 'ALCOHOL': return { icon: 'beaker-outline', text: 'Ventile el área', color: '#60a5fa' };
      case 'METHANE': return { icon: 'aperture-outline', text: 'Ventile y no encienda fuego', color: '#fbbf24' };
      default: return { icon: 'shield-outline', text: 'Investigue la fuente', color: '#60a5fa' };
    }
  };

  const renderActiveAlerts = () => {
    if (activeAlerts.length === 0) return null;

    return (
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px]">
              Alertas Activas
            </Text>
          </View>
          <View className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <Text className="text-red-400 text-[10px] font-black">{activeAlerts.length}</Text>
          </View>
        </View>

        {activeAlerts.map((alert: any, index: number) => {
          const style = getSeverityStyle(alert.severity);
          const quickAction = getQuickAction(alert.gasType, alert.severity);

          return (
            <TouchableOpacity
              key={alert.id || index}
              className={`${style.bg} rounded-3xl p-4 mb-3 border ${style.border}`}
              onPress={() => router.push(`/device/${alert.deviceId}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-start">
                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${style.bg} border ${style.border}`}>
                  <Ionicons name={style.icon as any} size={20} color={style.iconColor} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`text-[9px] font-black uppercase tracking-widest ${style.text}`}>
                      {style.label} — {alert.gasType || 'GAS'}
                    </Text>
                    {alert.gasValuePpm && (
                      <Text className={`text-sm font-black ${style.text}`}>
                        {alert.gasValuePpm.toFixed(0)} PPM
                      </Text>
                    )}
                  </View>
                  <Text className="text-slate-300 text-[13px] font-bold mb-2" numberOfLines={1}>
                    {alert.message?.split(':')[0] || 'Detección de gas'}
                  </Text>

                  {/* Quick Action */}
                  <View className="flex-row items-center bg-black/20 rounded-xl px-3 py-2 mt-1">
                    <Ionicons name={quickAction.icon as any} size={14} color={quickAction.color} />
                    <Text className="text-slate-400 text-[11px] font-semibold ml-2 flex-1">{quickAction.text}</Text>
                    <Ionicons name="chevron-forward" size={12} color="#475569" />
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="hardware-chip-outline" size={10} color="#475569" />
                    <Text className="text-slate-600 text-[10px] font-bold ml-1">{alert.deviceName}</Text>
                    <Text className="text-slate-700 text-[10px] ml-2">
                      {new Date(alert.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View className="mb-8 pt-2">
      <View className="flex-row justify-between items-end mb-8">
        <View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Panel de Control</Text>
          <Text className="text-4xl font-black text-slate-50 tracking-tighter">IoT Monitor</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push('/device/add')}
            className="w-12 h-12 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/10"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center border border-white/5"
            activeOpacity={0.7}
          >
            <Feather name="settings" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 bg-slate-900 rounded-[32px] p-5 border border-white/5 shadow-sm">
          <View className="w-10 h-10 rounded-2xl bg-indigo-500/10 items-center justify-center mb-4">
            <Ionicons name="hardware-chip" size={20} color="#6366f1" />
          </View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Sistemas</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-50 text-3xl font-black tracking-tighter">{devices.length}</Text>
            <Text className="text-slate-600 text-xs font-bold uppercase">Total</Text>
          </View>
        </View>

        <View className="flex-1 bg-slate-900 rounded-[32px] p-5 border border-white/5 shadow-sm">
          <View className="w-10 h-10 rounded-2xl bg-emerald-500/10 items-center justify-center mb-4">
            <Ionicons name="wifi" size={20} color="#10b981" />
          </View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Activos</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-50 text-3xl font-black tracking-tighter">
              {devices.filter(d => d.status === 'ONLINE').length}
            </Text>
            <Text className="text-slate-600 text-xs font-bold uppercase">Online</Text>
          </View>
        </View>
      </View>

      {/* Alertas Activas */}
      {renderActiveAlerts()}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-slate-400 mt-4">Cargando dispositivos...</Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={({ item }) => <DeviceCard device={item} />}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3b82f6"
                colors={['#3b82f6']}
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <View className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-4">
                  <Ionicons name="cube-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-slate-400 text-center text-lg font-medium mb-2">
                  No tienes dispositivos registrados
                </Text>
                <Text className="text-slate-500 text-center text-sm mb-4">
                  Agrega tu primer dispositivo ESP32 para comenzar
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() => router.push('/device/add')}
                >
                  <Text className="text-white font-medium">Agregar Dispositivo</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}